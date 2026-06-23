from django.core.management.base import BaseCommand
from django.db import transaction
from fruits.models import Customer

class Command(BaseCommand):
    help = 'Seeds the database with customer data extracted from handwritten notes.'

    def handle(self, *args, **kwargs):
        customer_data = [
            {"name": "Niyas Koodali", "balance": 2196},
            {"name": "Asad Bro", "balance": 470},
            {"name": "Latheefka Ktl", "balance": 835},
            {"name": "Rahim Malabar", "balance": 2680},
            {"name": "Muneer Tk", "balance": 7270},
            {"name": "Saheer kadachira", "balance": 800},
            {"name": "Anwar Icha", "balance": 2240},
            {"name": "Ayman Nabeel", "balance": 2640},
            {"name": "Isaq", "balance": 12348},
            {"name": "Aks", "balance": 3560},
            {"name": "Hajka", "balance": 4500},
            {"name": "Shameerka mtr", "balance": 2600},
            {"name": "KVK", "balance": 1300},
            {"name": "JTS", "balance": 2700},
            {"name": "Moiduka", "balance": 1300},
            {"name": "Jasmir", "balance": 4538},
            {"name": "Rasik Chalad", "balance": 2620},
            {"name": "Tholappi", "balance": 8300},
            {"name": "Noufal Jfc", "balance": 1035},
            {"name": "Rashi Market", "balance": 2000},
            {"name": "Majeedka Shop", "balance": 1260},
            {"name": "Afnas Goods", "balance": 900},
            {"name": "Shams Thans", "balance": 4280},
            {"name": "Nisarka Khrd", "balance": 4700},
            {"name": "Shalimar", "balance": 6300},
            {"name": "Noufal Mayil", "balance": 1800},
            {"name": "Nabeel Rk", "balance": 1600},
            {"name": "Baby", "balance": 900},
            {"name": "Rayees Smt", "balance": 2000},
            {"name": "Vadakara", "balance": 2600},
            {"name": "Sajad Acm", "balance": 2860},
            {"name": "Ubaid al", "balance": 12500},
            {"name": "Shahid King", "balance": 2720},
            {"name": "Dilshad Goods", "balance": 1080},
            {"name": "Muneerks KM", "balance": 1586},
            {"name": "Koyi Aseeska", "balance": 1820},
            {"name": "Thadiyan Foot Path", "balance": 450},
        ]

        self.stdout.write(self.style.WARNING("Starting to seed customer data..."))

        # Use a transaction so if anything fails, the database isn't left in a partial state
        with transaction.atomic():
            created_count = 0
            updated_count = 0

            for entry in customer_data:
                customer, created = Customer.objects.update_or_create(
                    name=entry["name"],
                    defaults={
                        "balance": entry["balance"],
                    }
                )
                
                if created:
                    created_count += 1
                else:
                    updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully seeded database! Created {created_count} new customers and updated {updated_count} existing customers."
            )
        )