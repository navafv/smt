from django.conf import settings
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import MyTokenObtainPairView


def _cookie_settings():
    return {
        "httponly": True,
        "secure": settings.REFRESH_COOKIE_SECURE,
        "samesite": settings.REFRESH_COOKIE_SAMESITE,
        "path": settings.REFRESH_COOKIE_PATH,
    }


class CookieTokenObtainPairView(MyTokenObtainPairView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        refresh = response.data.pop("refresh", None)
        if refresh:
            response.set_cookie(
                settings.REFRESH_COOKIE_NAME,
                refresh,
                max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()),
                **_cookie_settings(),
            )
        return response


class CookieTokenRefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        # 1. Try to get token from cookie (HttpOnly) or fallback to body (for legacy)
        refresh_token = request.COOKIES.get(settings.REFRESH_COOKIE_NAME) or request.data.get("refresh")

        if not refresh_token:
            return Response(
                {"detail": "No refresh token found in cookies."}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        try:
            serializer = TokenRefreshSerializer(data={"refresh": refresh_token})
            serializer.is_valid(raise_exception=True)

            # 2. Extract validated data
            data = serializer.validated_data
            
            # 3. SENIOR MOVE: Remove the refresh token from the JSON response body
            # This prevents it from being stored in localStorage on the frontend
            new_refresh = data.pop("refresh", None) 
            
            response = Response(data, status=status.HTTP_200_OK)
            
            # 4. Set the new refresh token as a secure cookie
            if new_refresh:
                response.set_cookie(
                    settings.REFRESH_COOKIE_NAME,
                    new_refresh,
                    max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()),
                    **_cookie_settings(),
                )
            return response
        
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get(settings.REFRESH_COOKIE_NAME)
        if refresh_token:
            try:
                RefreshToken(refresh_token).blacklist()
            except TokenError:
                pass

        response = Response(status=status.HTTP_204_NO_CONTENT)
        response.delete_cookie(
            settings.REFRESH_COOKIE_NAME,
            path=settings.REFRESH_COOKIE_PATH,
            samesite=settings.REFRESH_COOKIE_SAMESITE,
        )
        return response
