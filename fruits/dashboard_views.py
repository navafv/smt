from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Sum, F, DecimalField
from django.db.models.functions import Coalesce, TruncDay
from datetime import timedelta

from .models import Sale, Purchase, Expense, StockReturn, Product, CustomerPayment

class DashboardSummaryView(APIView):
    """
    Provides business intelligence metrics including real-time financials,
    30-day sales trends, and inventory health alerts.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.localdate()
        thirty_days_ago = today - timedelta(days=30)
        
        # 1. Financials (Today)
        # Using Coalesce for safety against null values
        finance_qs = {
            "sales": Sale.objects.filter(created_at__date=today).aggregate(
                total=Coalesce(Sum('total_amount'), 0, output_field=DecimalField())
            )['total'],
            
            "purchases": Purchase.objects.filter(created_at__date=today).aggregate(
                total=Coalesce(Sum('total_amount'), 0, output_field=DecimalField())
            )['total'],
            
            "expenses": Expense.objects.filter(date=today).aggregate(
                total=Coalesce(Sum('amount'), 0, output_field=DecimalField())
            )['total'],
            
            "wastage": StockReturn.objects.filter(created_at__date=today, return_type='wastage').aggregate(
                total=Coalesce(Sum('loss_amount'), 0, output_field=DecimalField())
            )['total'],
            
            "debt_forgiven": CustomerPayment.objects.filter(date__date=today).aggregate(
                total=Coalesce(Sum('discount_amount'), 0, output_field=DecimalField())
            )['total'],
        }
        
        profit_today = finance_qs["sales"] - (
            finance_qs["purchases"] + finance_qs["expenses"] + finance_qs["wastage"] + finance_qs["debt_forgiven"]
        )

        # 2. 30-Day Sales Trend (For Recharts)
        # SENIOR MOVE: Use TruncDay to group timestamps into dates at the DB level.
        sales_trend_qs = Sale.objects.filter(
            created_at__date__range=[thirty_days_ago, today]
        ).annotate(
            day=TruncDay('created_at')
        ).values('day').annotate(
            total=Sum('total_amount')
        ).order_by('day')

        chart_data = [
            {
                "date": item['day'].strftime('%d %b'),
                "amount": float(item['total'])
            } for item in sales_trend_qs
        ]

        # 3. Top Products (By Quantity Sold - Last 30 Days)
        top_products = Product.objects.filter(
            saleitem__sale__created_at__date__range=[thirty_days_ago, today]
        ).annotate(
            total_sold=Coalesce(Sum('saleitem__quantity'), 0, output_field=DecimalField())
        ).filter(total_sold__gt=0).order_by('-total_sold')[:5]

        # 4. Low Stock Alerts
        low_stock_qs = Product.objects.filter(
            is_active=True,
            stock_quantity__lte=F('low_stock_threshold')
        ).only('name', 'stock_quantity', 'unit')

        return Response({
            "today": {
                **finance_qs,
                "profit": profit_today
            },
            "chart_data": chart_data, # For the Line/Area Chart
            "top_products": [
                {"name": p.name, "sold": float(p.total_sold), "unit": p.unit} 
                for p in top_products
            ],
            "low_stock": [
                {"name": p.name, "stock": p.stock_quantity, "unit": p.unit} 
                for p in low_stock_qs[:5]
            ],
            "low_stock_count": low_stock_qs.count()
        })
