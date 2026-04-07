from django.db import transaction
from django.db.models import F
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import (
    Customer,
    CustomerPayment,
    Expense,
    Product,
    Purchase,
    PurchaseItem,
    Sale,
    SaleItem,
    StockReturn,
    Supplier,
    SupplierPayment,
)


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["username"] = user.username
        token["is_staff"] = user.is_staff
        token["email"] = user.email
        return token


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class ProductSerializer(serializers.ModelSerializer):
    is_low_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = "__all__"


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = "__all__"


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = "__all__"


class SaleItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source="product.name")
    unit = serializers.ReadOnlyField(source="product.unit")

    class Meta:
        model = SaleItem
        fields = ["product", "product_name", "unit", "quantity", "unit_price", "subtotal"]


class PurchaseItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source="product.name")
    unit = serializers.ReadOnlyField(source="product.unit")

    class Meta:
        model = PurchaseItem
        fields = ["product", "product_name", "unit", "quantity", "unit_price", "subtotal"]


class SaleSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True)
    customer_name = serializers.ReadOnlyField(source="customer.name")

    class Meta:
        model = Sale
        fields = ["id", "customer", "customer_name", "total_amount", "payment_type", "items", "created_at"]

    def validate(self, data):
        items = data.get("items") or []
        if not items:
            raise serializers.ValidationError({"items": "At least one sale item is required."})
        if data.get("payment_type") == "credit" and not data.get("customer"):
            raise serializers.ValidationError({"customer": "Customer is required for credit sales."})
        return data

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop("items")
        product_ids = [item["product"].id for item in items_data]
        locked_products = {
            product.id: product
            for product in Product.objects.select_for_update().filter(id__in=product_ids, is_active=True)
        }

        sale = Sale.objects.create(**validated_data)
        sale_items = []

        for item in items_data:
            product = locked_products.get(item["product"].id)
            if product is None:
                raise serializers.ValidationError({
                    "items": [f"Product {item['product'].id} is unavailable or inactive."]
                })
            if product.stock_quantity < item["quantity"]:
                raise serializers.ValidationError({
                    "items": [f"Insufficient stock for {product.name}. Available: {product.stock_quantity}."]
                })

            Product.objects.filter(pk=product.pk).update(
                stock_quantity=F("stock_quantity") - item["quantity"]
            )
            product.stock_quantity -= item["quantity"]
            sale_items.append(SaleItem(sale=sale, **item))

        SaleItem.objects.bulk_create(sale_items)

        if sale.payment_type == "credit" and sale.customer_id:
            Customer.objects.filter(pk=sale.customer_id).update(
                balance=F("balance") + sale.total_amount
            )

        return (
            Sale.objects.select_related("customer")
            .prefetch_related("items__product")
            .get(pk=sale.pk)
        )


class PurchaseSerializer(serializers.ModelSerializer):
    items = PurchaseItemSerializer(many=True)
    supplier_name = serializers.ReadOnlyField(source="supplier.name")

    class Meta:
        model = Purchase
        fields = ["id", "supplier", "supplier_name", "total_amount", "items", "created_at"]

    def validate(self, data):
        if not data.get("items"):
            raise serializers.ValidationError({"items": "At least one purchase item is required."})
        return data

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop("items")
        product_ids = [item["product"].id for item in items_data]
        Product.objects.select_for_update().filter(id__in=product_ids)

        purchase = Purchase.objects.create(**validated_data)
        purchase_items = []

        for item in items_data:
            Product.objects.filter(pk=item["product"].pk).update(
                stock_quantity=F("stock_quantity") + item["quantity"]
            )
            purchase_items.append(PurchaseItem(purchase=purchase, **item))

        PurchaseItem.objects.bulk_create(purchase_items)

        if purchase.supplier_id:
            Supplier.objects.filter(pk=purchase.supplier_id).update(
                balance=F("balance") + purchase.total_amount
            )

        return (
            Purchase.objects.select_related("supplier")
            .prefetch_related("items__product")
            .get(pk=purchase.pk)
        )


class CustomerPaymentSerializer(serializers.ModelSerializer):
    customer_name = serializers.ReadOnlyField(source="customer.name")

    class Meta:
        model = CustomerPayment
        fields = "__all__"

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value


class SupplierPaymentSerializer(serializers.ModelSerializer):
    supplier_name = serializers.ReadOnlyField(source="supplier.name")

    class Meta:
        model = SupplierPayment
        fields = "__all__"

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value


class StockReturnSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source="product.name")

    class Meta:
        model = StockReturn
        fields = "__all__"

    def validate(self, data):
        quantity = data["quantity"]
        if quantity <= 0:
            raise serializers.ValidationError({"quantity": "Quantity must be greater than zero."})

        return_type = data["return_type"]
        supplier = data.get("supplier")
        if return_type == "supplier" and not supplier:
            raise serializers.ValidationError({"supplier": "Supplier is required for supplier returns."})
        return data

    @transaction.atomic
    def create(self, validated_data):
        product = Product.objects.select_for_update().get(pk=validated_data["product"].pk)
        quantity = validated_data["quantity"]
        return_type = validated_data["return_type"]

        if return_type in {"wastage", "supplier"} and product.stock_quantity < quantity:
            raise serializers.ValidationError({
                "quantity": f"Cannot return {quantity}. Only {product.stock_quantity} available in stock."
            })

        stock_return = StockReturn.objects.create(**validated_data)
        stock_delta = quantity if return_type == "customer" else -quantity

        Product.objects.filter(pk=product.pk).update(
            stock_quantity=F("stock_quantity") + stock_delta
        )

        if return_type == "supplier" and stock_return.supplier_id:
            Supplier.objects.filter(pk=stock_return.supplier_id).update(
                balance=F("balance") - (product.price_per_unit * quantity)
            )

        return stock_return


class ExpenseSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source="get_category_display", read_only=True)

    class Meta:
        model = Expense
        fields = "__all__"
