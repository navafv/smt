from django.contrib import admin
from django.utils.html import format_html

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

admin.site.site_header = "Fruits Admin"
admin.site.site_title = "Fruits Admin Portal"
admin.site.index_title = "Welcome to Fruits Management System"
admin.site.site_url = "https://smtapp.vercel.app/"


# ==========================================
# INLINES (For "One-Page" Editing)
# ==========================================


class SaleItemInline(admin.TabularInline):
    model = SaleItem
    extra = 0
    fields = ["product", "quantity", "unit_price", "subtotal"]
    readonly_fields = ["subtotal"]


class PurchaseItemInline(admin.TabularInline):
    model = PurchaseItem
    extra = 0
    fields = ["product", "quantity", "unit_price", "subtotal"]
    readonly_fields = ["subtotal"]


# ==========================================
# ADMIN CLASSES
# ==========================================


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ["name", "display_stock", "price_per_unit", "unit", "status_badge"]
    list_filter = ["unit", "is_active"]
    search_fields = ["name"]
    list_editable = ["price_per_unit"]
    actions = ["mark_as_inactive", "mark_as_active"]

    fieldsets = (
        ("Core Information", {"fields": ("name", "unit", "price_per_unit", "is_active")}),
        ("Inventory Levels", {"fields": ("stock_quantity", "low_stock_threshold")}),
    )

    @admin.display(description="Current Stock")
    def display_stock(self, obj):
        color = "red" if obj.is_low_stock else "green"
        return format_html("<b style=\"color: {};\">{} {}</b>", color, obj.stock_quantity, obj.unit)

    @admin.display(description="Status")
    def status_badge(self, obj):
        label = "Active" if obj.is_active else "Inactive"
        color = "green" if obj.is_active else "red"
        return format_html("<strong style=\"color: {};\">{}</strong>", color, label)

    def mark_as_inactive(self, request, queryset):
        queryset.update(is_active=False)

    def mark_as_active(self, request, queryset):
        queryset.update(is_active=True)


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ["name", "phone", "formatted_balance", "created_at"]
    search_fields = ["name", "phone"]
    readonly_fields = ["balance"]

    @admin.display(description="Balance")
    def formatted_balance(self, obj):
        color = "red" if obj.balance > 0 else "green"
        return format_html("<b style=\"color: {};\">Rs. {}</b>", color, obj.balance)


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ["name", "contact_number", "formatted_balance"]
    search_fields = ["name", "contact_number"]
    readonly_fields = ["balance"]

    @admin.display(description="Our Debt")
    def formatted_balance(self, obj):
        return format_html("<b style=\"color: orange;\">Rs. {}</b>", obj.balance)


@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ["id", "customer_display", "total_amount", "payment_type", "created_at"]
    list_filter = ["payment_type", "created_at"]
    search_fields = ["customer__name", "id"]
    inlines = [SaleItemInline]
    readonly_fields = ["total_amount", "created_at"]

    @admin.display(description="Customer")
    def customer_display(self, obj):
        return obj.customer.name if obj.customer_id and obj.customer else "Walk-in customer"


@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = ["id", "supplier_display", "total_amount", "created_at"]
    list_filter = ["created_at"]
    search_fields = ["supplier__name"]
    inlines = [PurchaseItemInline]
    readonly_fields = ["total_amount", "created_at"]

    @admin.display(description="Supplier")
    def supplier_display(self, obj):
        return obj.supplier.name if obj.supplier_id and obj.supplier else "No supplier"


@admin.register(CustomerPayment)
class CustomerPaymentAdmin(admin.ModelAdmin):
    list_display = ["customer", "amount", "date", "note"]
    list_filter = ["date"]
    autocomplete_fields = ["customer"]


@admin.register(SupplierPayment)
class SupplierPaymentAdmin(admin.ModelAdmin):
    list_display = ["supplier", "amount", "date", "note"]
    list_filter = ["date"]
    autocomplete_fields = ["supplier"]


@admin.register(StockReturn)
class StockReturnAdmin(admin.ModelAdmin):
    list_display = ["product", "return_type", "quantity", "loss_amount", "created_at"]
    list_filter = ["return_type", "created_at"]
    search_fields = ["product__name"]
    readonly_fields = ["loss_amount"]


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ["title", "category", "amount", "date"]
    list_filter = ["category", "date"]
    search_fields = ["title", "note"]
