from django.contrib import admin
from django.urls import include, path

from fruits.auth_views import CookieTokenObtainPairView, CookieTokenRefreshView, LogoutView
from fruits.health_views import HealthCheckView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', HealthCheckView.as_view(), name='health-check'),
    path('api/auth/login/', CookieTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/logout/', LogoutView.as_view(), name='token_logout'),
    path('api/', include('fruits.urls', namespace='fruits')),
]
