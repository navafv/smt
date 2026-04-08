from decouple import config

from .base import *  # noqa: F403,F401


DEBUG = False

RENDER_EXTERNAL_HOSTNAME = config("RENDER_EXTERNAL_HOSTNAME", default="")
DEFAULT_BACKEND_URL = f"https://{RENDER_EXTERNAL_HOSTNAME}" if RENDER_EXTERNAL_HOSTNAME else ""

BACKEND_APP_URL = normalize_origin(config("BACKEND_APP_URL", default=DEFAULT_BACKEND_URL))
FRONTEND_APP_URL = normalize_origin(config("FRONTEND_APP_URL", default=FRONTEND_APP_URL))

ALLOWED_HOSTS = unique_list(
    cast_csv(config("ALLOWED_HOSTS", default="")),
    [extract_host(BACKEND_APP_URL), RENDER_EXTERNAL_HOSTNAME, "127.0.0.1", "localhost"],
)
CSRF_TRUSTED_ORIGINS = unique_list(
    cast_csv(config("CSRF_TRUSTED_ORIGINS", default="")),
    [origin for origin in [FRONTEND_APP_URL, BACKEND_APP_URL] if origin],
)
CORS_ALLOWED_ORIGINS = unique_list(
    cast_csv(config("CORS_ALLOWED_ORIGINS", default="")),
    [origin for origin in [FRONTEND_APP_URL] if origin],
)

REFRESH_COOKIE_PATH = config("REFRESH_COOKIE_PATH", default="/api/auth/")
REFRESH_COOKIE_DOMAIN = config("REFRESH_COOKIE_DOMAIN", default="")
REFRESH_COOKIE_SECURE = config("REFRESH_COOKIE_SECURE", default=True, cast=bool)
REFRESH_COOKIE_SAMESITE = config("REFRESH_COOKIE_SAMESITE", default="None")

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_SSL_REDIRECT = config("SECURE_SSL_REDIRECT", default=True, cast=bool)
SECURE_HSTS_SECONDS = config("SECURE_HSTS_SECONDS", default=31536000, cast=int)
SECURE_HSTS_INCLUDE_SUBDOMAINS = config(
    "SECURE_HSTS_INCLUDE_SUBDOMAINS",
    default=True,
    cast=bool,
)
SECURE_HSTS_PRELOAD = config("SECURE_HSTS_PRELOAD", default=True, cast=bool)
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"
USE_X_FORWARDED_HOST = True
X_FRAME_OPTIONS = "DENY"
SECURE_CROSS_ORIGIN_OPENER_POLICY = config(
    "SECURE_CROSS_ORIGIN_OPENER_POLICY",
    default="same-origin",
)
