from django.db import models

# ==========================================
# 1. INVENTORY MODULE
# ==========================================

class Product(models.Model):
    """Represents fruits and items available in the shop."""
    UNIT_CHOICES = [
        ('kg', 'Kilogram (kg)'),
        ('pcs', 'Pieces (pcs)'),
        ('box', 'Box'),
        ('gm', 'Gram (gm)'),
    ]
    
    name = models.CharField(max_length=255, db_index=True)
    price_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES, default='kg')
    stock_quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    low_stock_threshold = models.DecimalField(max_digits=10, decimal_places=2, default=5)
    
    is_active = models.BooleanField(default=True, help_text="Use this for soft delete.")
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['name']
        verbose_name = "Product"
        verbose_name_plural = "Products"

    def __str__(self):
        return f"{self.name} ({self.stock_quantity} {self.unit})"

    @property
    def is_low_stock(self):
        return self.stock_quantity <= self.low_stock_threshold


# ==========================================
# 2. STAKEHOLDERS (CUSTOMERS & SUPPLIERS)
# ==========================================

class Customer(models.Model):
    """Customers for credit tracking and sales history."""
    name = models.CharField(max_length=255, db_index=True)
    phone = models.CharField(max_length=15, unique=True, db_index=True)
    address = models.TextField(blank=True)
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - Balance: ₹{self.balance}"


class Supplier(models.Model):
    """Suppliers for purchase tracking and payables."""
    name = models.CharField(max_length=255, db_index=True)
    contact_number = models.CharField(max_length=15, blank=True, db_index=True)
    address = models.TextField(blank=True)
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - Owed: ₹{self.balance}"


# ==========================================
# 3. TRANSACTION MODULE (SALES & PURCHASES)
# ==========================================

class Sale(models.Model):
    """Core sales transactions."""
    PAYMENT_CHOICES = [('cash', 'Cash'), ('credit', 'Credit')]
    
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True, related_name='sales')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    payment_type = models.CharField(max_length=10, choices=PAYMENT_CHOICES, default='cash', db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Sale #{self.id} - {self.created_at.strftime('%Y-%m-%d')}"


class SaleItem(models.Model):
    """Individual line items for a sale."""
    sale = models.ForeignKey(Sale, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.PROTECT) # Prevent product deletion if sales exist
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.product.name} ({self.quantity})"


class Purchase(models.Model):
    """Stock inward transactions from suppliers."""
    supplier = models.ForeignKey(Supplier, on_delete=models.SET_NULL, null=True, related_name='purchases')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Purchase #{self.id} from {self.supplier}"


class PurchaseItem(models.Model):
    """Individual line items for a purchase."""
    purchase = models.ForeignKey(Purchase, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)


# ==========================================
# 4. ACCOUNTING & ADJUSTMENTS
# ==========================================

class CustomerPayment(models.Model):
    """Tracking when customers pay off their credit debt."""
    customer = models.ForeignKey(Customer, related_name='payments', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True, db_index=True)
    note = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ['-date']


class SupplierPayment(models.Model):
    """Tracking when the shop pays off debt to suppliers."""
    supplier = models.ForeignKey(Supplier, related_name='payments', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True, db_index=True)
    note = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ['-date']


class StockReturn(models.Model):
    """Tracking wastage, spoilage, and customer returns."""
    RETURN_TYPES = [
        ('customer', 'Customer Return (Restock)'),
        ('wastage', 'Wastage/Spoiled (Stock Out - Loss)'),
        ('supplier', 'Supplier Return (Stock Out - No Loss)'),
    ]
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    supplier = models.ForeignKey(Supplier, on_delete=models.SET_NULL, null=True, blank=True, help_text="Required if return_type is 'supplier'")
    return_type = models.CharField(max_length=20, choices=RETURN_TYPES, db_index=True)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.TextField(blank=True)
    loss_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    def save(self, *args, **kwargs):
        # Calculate financial loss automatically for wastage
        if self.return_type == 'wastage':
            self.loss_amount = self.product.price_per_unit * self.quantity
        else:
            self.loss_amount = 0
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-created_at']


class Expense(models.Model):
    """Shop overhead costs (Rent, Electricity, etc)."""
    EXPENSE_CATEGORIES = [
        ('rent', 'Rent'),
        ('electricity', 'Electricity / Utilities'),
        ('transport', 'Transportation'),
        ('salary', 'Staff Salary'),
        ('packaging', 'Packaging Materials'),
        ('other', 'Other Miscellaneous'),
    ]
    
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=20, choices=EXPENSE_CATEGORIES, default='other', db_index=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateField(auto_now_add=True, db_index=True)
    note = models.TextField(blank=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.title} - ₹{self.amount}"
