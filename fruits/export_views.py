import csv
import json
from django.http import HttpResponse, StreamingHttpResponse, JsonResponse
from django.utils import timezone
from django.core import serializers
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from .models import Sale, Purchase, Expense, Product, Customer, Supplier

class Echo:
    """An object that implements just the write method of the file-like interface.
    Used for streaming CSVs directly to the client.
    """
    def write(self, value):
        return value

class ExportCSVView(APIView):
    """
    Highly optimized CSV exporter using database streaming.
    Prevents memory overflows and N+1 query bottlenecks.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, resource_type):
        timestamp = timezone.now().strftime("%Y-%m-%d_%H%M")
        filename = f"smt_{resource_type}_{timestamp}.csv"

        # Define headers and data logic mapping
        export_config = {
            'sales': {
                'queryset': Sale.objects.select_related('customer').all().iterator(),
                'headers': ['ID', 'Date', 'Customer', 'Total Amount', 'Payment Type'],
                'row_func': lambda s: [s.id, s.created_at.strftime("%Y-%m-%d %H:%M"), s.customer.name if s.customer else 'Walk-in', s.total_amount, s.payment_type]
            },
            'purchases': {
                'queryset': Purchase.objects.select_related('supplier').all().iterator(),
                'headers': ['ID', 'Date', 'Supplier', 'Total Amount'],
                'row_func': lambda p: [p.id, p.created_at.strftime("%Y-%m-%d %H:%M"), p.supplier.name if p.supplier else 'Direct', p.total_amount]
            },
            'expenses': {
                'queryset': Expense.objects.all().iterator(),
                'headers': ['ID', 'Date', 'Title', 'Category', 'Amount'],
                'row_func': lambda e: [e.id, e.date, e.title, e.get_category_display(), e.amount]
            }
        }

        if resource_type not in export_config:
            return JsonResponse({"error": "Invalid resource type"}, status=400)

        config = export_config[resource_type]
        
        # Generator function for streaming
        def stream_csv():
            pseudo_buffer = Echo()
            writer = csv.writer(pseudo_buffer)
            yield writer.writerow(config['headers'])
            
            for obj in config['queryset']:
                yield writer.writerow(config['row_func'](obj))

        response = StreamingHttpResponse(stream_csv(), content_type="text/csv")
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response


class BackupJSONView(APIView):
    """
    Generates a full system snapshot. 
    Strictly protected by authentication.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        timestamp = timezone.now().isoformat()
        
        # Senior Tip: Map models to keys for clean iteration
        models_to_backup = {
            "products": Product.objects.all(),
            "customers": Customer.objects.all(),
            "suppliers": Supplier.objects.all(),
            "sales": Sale.objects.all(),
            "purchases": Purchase.objects.all(),
            "expenses": Expense.objects.all(),
        }

        data = {
            "backup_version": "1.0",
            "timestamp": timestamp,
            "exported_by": request.user.username,
            "data": {
                key: json.loads(serializers.serialize('json', qs)) 
                for key, qs in models_to_backup.items()
            }
        }

        return JsonResponse(data, safe=False)