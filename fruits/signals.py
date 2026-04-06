import logging
from django.db.models import F
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import (
    CustomerPayment, SupplierPayment, StockReturn, 
    Sale, Purchase, SaleItem, PurchaseItem
)

logger = logging.getLogger(__name__)

# ==========================================
# 1. LEDGER UPDATES (Balances)
# ==========================================

@receiver(post_save, sender=Sale)
def update_customer_balance_on_sale(sender, instance, created, **kwargs):
    """Increase customer debt for credit sales."""
    if created and instance.payment_type == 'credit' and instance.customer:
        instance.customer.__class__.objects.filter(pk=instance.customer.pk).update(
            balance=F('balance') + instance.total_amount
        )

@receiver(post_save, sender=Purchase)
def update_supplier_balance_on_purchase(sender, instance, created, **kwargs):
    """Increase what we owe to the supplier."""
    if created and instance.supplier:
        instance.supplier.__class__.objects.filter(pk=instance.supplier.pk).update(
            balance=F('balance') + instance.total_amount
        )

@receiver(post_save, sender=CustomerPayment)
def update_customer_balance_on_payment(sender, instance, created, **kwargs):
    """Decrease customer debt when they pay us."""
    if created:
        instance.customer.__class__.objects.filter(pk=instance.customer.pk).update(
            balance=F('balance') - instance.amount
        )

@receiver(post_save, sender=SupplierPayment)
def update_supplier_balance_on_payment(sender, instance, created, **kwargs):
    """Decrease our debt when we pay a supplier."""
    if created:
        instance.supplier.__class__.objects.filter(pk=instance.supplier.pk).update(
            balance=F('balance') - instance.amount
        )

# ==========================================
# 2. INVENTORY UPDATES (Stock Levels)
# ==========================================

@receiver(post_save, sender=SaleItem)
def reduce_stock_on_sale(sender, instance, created, **kwargs):
    """Deduct stock when an item is sold."""
    if created:
        instance.product.__class__.objects.filter(pk=instance.product.pk).update(
            stock_quantity=F('stock_quantity') - instance.quantity
        )

@receiver(post_save, sender=PurchaseItem)
def increase_stock_on_purchase(sender, instance, created, **kwargs):
    """Add stock when an item is purchased."""
    if created:
        instance.product.__class__.objects.filter(pk=instance.product.pk).update(
            stock_quantity=F('stock_quantity') + instance.quantity
        )

@receiver(post_save, sender=StockReturn)
def handle_stock_adjustment(sender, instance, created, **kwargs):
    """Handle physical inventory and financial supplier adjustments."""
    if created:
        product = instance.product
        
        # Determine Stock Change Direction
        # Customer Return = Stock increases (Back in shop)
        # Wastage/Supplier Return = Stock decreases (Leaves shop)
        change = instance.quantity if instance.return_type == 'customer' else -instance.quantity
        
        # 1. ATOMIC INVENTORY UPDATE
        # Using .update(F()) prevents lost updates if two sales happen at once
        product.__class__.objects.filter(pk=product.pk).update(
            stock_quantity=F('stock_quantity') + change
        )

        # 2. FINANCIAL LOGIC FOR SUPPLIER RETURNS (Fixed Branch)
        # Only fire if it's a supplier return and the supplier is linked
        if instance.return_type == 'supplier' and instance.supplier:
            # We owe the supplier LESS now, so we subtract from balance
            instance.supplier.__class__.objects.filter(pk=instance.supplier.pk).update(
                balance=F('balance') - instance.loss_amount
            )
            
        logger.info(f"SMT Stock Sync | {product.name} | Type: {instance.return_type}")

# ==========================================
# 3. DELETION RECOVERY (Cleanup)
# ==========================================

@receiver(post_delete, sender=CustomerPayment)
def restore_customer_balance_on_delete(sender, instance, **kwargs):
    instance.customer.__class__.objects.filter(pk=instance.customer.pk).update(
        balance=F('balance') + instance.amount
    )

@receiver(post_delete, sender=SupplierPayment)
def restore_supplier_balance_on_delete(sender, instance, **kwargs):
    instance.supplier.__class__.objects.filter(pk=instance.supplier.pk).update(
        balance=F('balance') + instance.amount
    )