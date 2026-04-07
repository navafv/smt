from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("fruits", "0012_stockreturn_supplier"),
    ]

    operations = [
        migrations.AddField(
            model_name="sale",
            name="discount_amount",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=12),
        ),
    ]
