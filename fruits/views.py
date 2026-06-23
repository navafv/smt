from django.db import transaction
from django.db.models import F, Q, Sum
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Customer,
    CustomerPayment,
    Expense,
    Product,
    Purchase,
    Sale,
    StockReturn,
    Supplier,
    SupplierPayment,
)
from .serializers import (
    CustomerPaymentSerializer,
    CustomerSerializer,
    ExpenseSerializer,
    ProductSerializer,
    PurchaseSerializer,
    SaleSerializer,
    StockReturnSerializer,
    SupplierPaymentSerializer,
    SupplierSerializer,
)


class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ProductSerializer
    pagination_class = None
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name"]
    ordering_fields = ["stock_quantity", "price_per_unit", "created_at"]

    def get_queryset(self):
        return Product.objects.filter(is_active=True)

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active"])


class SaleViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = SaleSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["payment_type", "customer"]
    search_fields = ["id", "customer__name"]

    def get_queryset(self):
        return Sale.objects.select_related("customer").prefetch_related("items__product")

    @transaction.atomic
    def perform_destroy(self, instance):
        for item in instance.items.select_related("product"):
            Product.objects.filter(pk=item.product_id).update(
                stock_quantity=F("stock_quantity") + item.quantity
            )
        if instance.payment_type == "credit" and instance.customer_id:
            Customer.objects.filter(pk=instance.customer_id).update(
                balance=F("balance") - instance.total_amount
            )
        instance.delete()


class PurchaseViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = PurchaseSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["id", "supplier__name"]

    def get_queryset(self):
        return Purchase.objects.select_related("supplier").prefetch_related("items__product")

    @transaction.atomic
    def perform_destroy(self, instance):
        for item in instance.items.select_related("product"):
            Product.objects.filter(pk=item.product_id).update(
                stock_quantity=F("stock_quantity") - item.quantity
            )
        if instance.supplier_id:
            Supplier.objects.filter(pk=instance.supplier_id).update(
                balance=F("balance") - instance.total_amount
            )
        instance.delete()


class CustomerViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    pagination_class = None
    filter_backends = [filters.SearchFilter]
    search_fields = ["name"]


class SupplierViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    pagination_class = None
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "contact_number"]


class CustomerPaymentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = CustomerPaymentSerializer
    pagination_class = None

    def get_queryset(self):
        return CustomerPayment.objects.select_related("customer")

    @transaction.atomic
    def perform_create(self, serializer):
        payment = serializer.save()
        Customer.objects.filter(pk=payment.customer_id).update(
            balance=F("balance") - payment.amount
        )

    @transaction.atomic
    def perform_destroy(self, instance):
        Customer.objects.filter(pk=instance.customer_id).update(
            balance=F("balance") + instance.amount
        )
        instance.delete()


class SupplierPaymentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = SupplierPaymentSerializer
    pagination_class = None

    def get_queryset(self):
        return SupplierPayment.objects.select_related("supplier")

    @transaction.atomic
    def perform_create(self, serializer):
        payment = serializer.save()
        Supplier.objects.filter(pk=payment.supplier_id).update(
            balance=F("balance") - payment.amount
        )

    @transaction.atomic
    def perform_destroy(self, instance):
        Supplier.objects.filter(pk=instance.supplier_id).update(
            balance=F("balance") + instance.amount
        )
        instance.delete()


class ExpenseViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    pagination_class = None
    filterset_fields = ["category"]


class StockReturnViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = StockReturnSerializer
    pagination_class = None

    def get_queryset(self):
        return StockReturn.objects.select_related("product", "supplier")

    @transaction.atomic
    def perform_destroy(self, instance):
        stock_delta = -instance.quantity if instance.return_type == "customer" else instance.quantity
        Product.objects.filter(pk=instance.product_id).update(
            stock_quantity=F("stock_quantity") + stock_delta
        )
        if instance.return_type == "supplier" and instance.supplier_id:
            Supplier.objects.filter(pk=instance.supplier_id).update(
                balance=F("balance") + (instance.product.price_per_unit * instance.quantity)
            )
        instance.delete()


class ReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")

        if not start_date or not end_date:
            end_date = timezone.localdate()
            start_date = end_date.replace(day=1)

        filters_q = Q(created_at__date__range=[start_date, end_date])
        expense_filters = Q(date__range=[start_date, end_date])

        sales_sum = Sale.objects.filter(filters_q).aggregate(total=Sum("total_amount"))["total"] or 0
        purchases_sum = Purchase.objects.filter(filters_q).aggregate(total=Sum("total_amount"))["total"] or 0
        expenses_sum = Expense.objects.filter(expense_filters).aggregate(total=Sum("amount"))["total"] or 0
        wastage_sum = (
            StockReturn.objects.filter(filters_q, return_type="wastage").aggregate(total=Sum("loss_amount"))["total"]
            or 0
        )
        net_profit = sales_sum - (purchases_sum + expenses_sum + wastage_sum)

        sales_qs = (
            Sale.objects.filter(filters_q)
            .select_related("customer")
            .prefetch_related("items__product")
            .order_by("-created_at")
        )
        sales_list = SaleSerializer(sales_qs, many=True).data

        return Response(
            {
                "summary": {
                    "sales": sales_sum,
                    "purchases": purchases_sum,
                    "expenses": expenses_sum,
                    "wastage": wastage_sum,
                    "net_profit": net_profit,
                },
                "details": {"sales_list": sales_list},
                "period": {"start": start_date, "end": end_date},
            }
        )
