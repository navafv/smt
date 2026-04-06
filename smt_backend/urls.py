from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView

# Import your custom JWT view from your serializers/views
from fruits.serializers import MyTokenObtainPairView 

urlpatterns = [
    # 1. System Administration
    path('admin/', admin.site.urls),

    # 2. Global Authentication (JWT)
    path('api/auth/login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # 3. Application API (Namespaced)
    # This includes everything from fruits/urls.py
    path('api/', include('fruits.urls', namespace='fruits')),
]