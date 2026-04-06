import datetime
from django.db import transaction
from django.db.models import Sum, Q, F
from django.utils import timezone

from rest_framework import viewsets, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    Expense, Product, Sale, Purchase, Supplier, 
    Customer, SupplierPayment, CustomerPayment, StockReturn
)
from .serializers import (
    ExpenseSerializer, ProductSerializer, SaleSerializer, 
    PurchaseSerializer, SupplierSerializer, CustomerSerializer, 
    SupplierPaymentSerializer, CustomerPaymentSerializer, StockReturnSerializer
)

# ==========================================
# 1. INVENTORY VIEWSET
# ==========================================

class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['stock_quantity', 'price_per_unit', 'created_at']

    def get_queryset(self):
        """Only return active products by default."""
        return Product.objects.filter(is_active=True)

    def perform_destroy(self, instance):
        """Senior approach: Soft delete instead of hard delete."""
        instance.is_active = False
        instance.save()


# ==========================================
# 2. TRANSACTION VIEWSETS (With N+1 Optimization)
# ==========================================

class SaleViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = SaleSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['payment_type', 'customer']

    def get_queryset(self):
        """
        Optimization: select_related fetches the customer name in the same query.
        prefetch_related fetches all items in a single secondary query.
        """
        return Sale.objects.select_related('customer').prefetch_related('items__product').all()


class PurchaseViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = PurchaseSerializer

    def get_queryset(self):
        return Purchase.objects.select_related('supplier').prefetch_related('items__product').all()


# ==========================================
# 3. STAKEHOLDER VIEWSETS
# ==========================================

class CustomerViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    search_fields = ['name', 'phone']


class SupplierViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer


# ==========================================
# 4. ACCOUNTING & EXPENSES
# ==========================================

class CustomerPaymentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = CustomerPaymentSerializer

    def get_queryset(self):
        return CustomerPayment.objects.select_related('customer').all()


class SupplierPaymentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = SupplierPaymentSerializer

    def get_queryset(self):
        return SupplierPayment.objects.select_related('supplier').all()


class ExpenseViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    filterset_fields = ['category']


class StockReturnViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = StockReturnSerializer

    def get_queryset(self):
        return StockReturn.objects.select_related('product').all()


# ==========================================
# 5. ANALYTICS & REPORTS (Custom Logic)
# ==========================================

class ReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if not start_date or not end_date:
            end_date = timezone.now().date()
            start_date = end_date.replace(day=1)

        filters = Q(created_at__date__range=[start_date, end_date])
        expense_filters = Q(date__range=[start_date, end_date])

        # 1. Aggregates
        sales_sum = Sale.objects.filter(filters).aggregate(total=Sum('total_amount'))['total'] or 0
        purchases_sum = Purchase.objects.filter(filters).aggregate(total=Sum('total_amount'))['total'] or 0
        expenses_sum = Expense.objects.filter(expense_filters).aggregate(total=Sum('amount'))['total'] or 0
        wastage_sum = StockReturn.objects.filter(filters, return_type='wastage').aggregate(total=Sum('loss_amount'))['total'] or 0
        
        net_profit = sales_sum - (purchases_sum + expenses_sum + wastage_sum)

        # 2. Fetch the actual sales list for the table and CSV
        sales_qs = Sale.objects.filter(filters).order_by('-created_at')
        sales_list = SaleSerializer(sales_qs, many=True).data

        return Response({
            "summary": {
                "sales": sales_sum,      # Renamed to match frontend
                "purchases": purchases_sum,
                "expenses": expenses_sum, # Renamed to match frontend
                "wastage": wastage_sum,   # Renamed to match frontend
                "net_profit": net_profit,
            },
            "details": {
                "sales_list": sales_list  # Added the missing list!
            },
            "period": {"start": start_date, "end": end_date}
        })