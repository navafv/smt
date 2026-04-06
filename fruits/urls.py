from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    ProductViewSet, SaleViewSet, PurchaseViewSet, 
    SupplierViewSet, CustomerViewSet, CustomerPaymentViewSet, 
    SupplierPaymentViewSet, StockReturnViewSet, ExpenseViewSet, 
    ReportView
)
from .dashboard_views import DashboardSummaryView
from .export_views import ExportCSVView, BackupJSONView

# Using a descriptive name for the router
api_router = DefaultRouter()

# 1. Core Inventory & Stakeholders
api_router.register(r'products', ProductViewSet, basename='product')
api_router.register(r'suppliers', SupplierViewSet, basename='supplier')
api_router.register(r'customers', CustomerViewSet, basename='customer')

# 2. Transactions
api_router.register(r'sales', SaleViewSet, basename='sale')
api_router.register(r'purchases', PurchaseViewSet, basename='purchase')
api_router.register(r'expenses', ExpenseViewSet, basename='expense')

# 3. Accounting & Returns
api_router.register(r'customer-payments', CustomerPaymentViewSet, basename='customer-payment')
api_router.register(r'supplier-payments', SupplierPaymentViewSet, basename='supplier-payment')
api_router.register(r'stock-returns', StockReturnViewSet, basename='stock-return')

app_name = 'fruits'

urlpatterns = [
    # Router-generated CRUD endpoints
    path('', include(api_router.urls)),

    # Analytics Endpoints
    path('dashboard/', DashboardSummaryView.as_view(), name='dashboard-summary'),
    path('reports/', ReportView.as_view(), name='reports-summary'),

    # Data Export Endpoints
    path('export/csv/<str:resource_type>/', ExportCSVView.as_view(), name='export-csv'),
    path('export/backup/', BackupJSONView.as_view(), name='system-backup'),
]