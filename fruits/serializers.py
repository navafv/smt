from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db import transaction
from django.db.models import F
from .models import (
    Product, Customer, CustomerPayment, Sale, SaleItem, 
    Supplier, SupplierPayment, Purchase, PurchaseItem, 
    StockReturn, Expense
)

# ==========================================
# 0. AUTHENTICATION SERIALIZERS
# ==========================================

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['is_staff'] = user.is_staff
        token['email'] = user.email
        return token

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

# ==========================================
# 1. BASE / HELPER SERIALIZERS
# ==========================================

class ProductSerializer(serializers.ModelSerializer):
    is_low_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = '__all__'

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'

# ==========================================
# 2. TRANSACTION ITEM SERIALIZERS (NESTED)
# ==========================================

class SaleItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    unit = serializers.ReadOnlyField(source='product.unit')

    class Meta:
        model = SaleItem
        fields = ['product', 'product_name', 'unit', 'quantity', 'unit_price', 'subtotal']

class PurchaseItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')

    class Meta:
        model = PurchaseItem
        fields = ['product', 'product_name', 'quantity', 'unit_price', 'subtotal']

# ==========================================
# 3. MAIN TRANSACTION SERIALIZERS (FIXED STOCK LOGIC)
# ==========================================

class SaleSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True)
    customer_name = serializers.ReadOnlyField(source='customer.name')

    class Meta:
        model = Sale
        fields = ['id', 'customer', 'customer_name', 'total_amount', 'payment_type', 'items', 'created_at']

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        sale = Sale.objects.create(**validated_data)
        for item in items_data:
            # Just create the item. The SIGNAL now handles the stock math!
            SaleItem.objects.create(sale=sale, **item)
        return sale


class PurchaseSerializer(serializers.ModelSerializer):
    items = PurchaseItemSerializer(many=True)
    supplier_name = serializers.ReadOnlyField(source='supplier.name')

    class Meta:
        model = Purchase
        fields = ['id', 'supplier', 'supplier_name', 'total_amount', 'items', 'created_at']

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        purchase = Purchase.objects.create(**validated_data)
        for item in items_data:
            # Just create the item. The SIGNAL now handles the stock math!
            PurchaseItem.objects.create(purchase=purchase, **item)
        return purchase

# ==========================================
# 4. ACCOUNTING & ADJUSTMENT SERIALIZERS
# ==========================================

class CustomerPaymentSerializer(serializers.ModelSerializer):
    customer_name = serializers.ReadOnlyField(source='customer.name')
    class Meta:
        model = CustomerPayment
        fields = '__all__'

class SupplierPaymentSerializer(serializers.ModelSerializer):
    supplier_name = serializers.ReadOnlyField(source='supplier.name')
    class Meta:
        model = SupplierPayment
        fields = '__all__'

class StockReturnSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')

    class Meta:
        model = StockReturn
        fields = '__all__'

    def validate(self, data):
        """
        Check that wastage/supplier returns don't exceed current stock.
        """
        product = data['product']
        quantity = data['quantity']
        return_type = data['return_type']

        if return_type in ['wastage', 'supplier']:
            if product.stock_quantity < quantity:
                raise serializers.ValidationError({
                    "quantity": f"Cannot return {quantity}. Only {product.stock_quantity} available in stock."
                })
        return data

class ExpenseSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    class Meta:
        model = Expense
        fields = '__all__'