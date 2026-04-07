# SMT deployment guide

This project is now prepared for:

- backend on Render
- frontend on Vercel
- PostgreSQL on Neon

## Recommended architecture

- Vercel hosts the Vite frontend from `smt_frontend`
- Render hosts the Django backend from the repository root
- Neon hosts the production PostgreSQL database

## Important note about Render free sleep

Render free web services can spin down after inactivity and wake on the next request. That means the first request after idle time can be slow.

For this project, a repeated keep-alive interval is not the best fix:

- it is unreliable because it only runs while a user has the app open
- it adds pointless traffic
- it does not fully solve the problem for new visitors

Instead, the frontend now sends a one-time warm-up request to `/api/health/` when the login page loads and before session refresh runs. This reduces the chance that the user's first real auth request is the one waiting on cold start.

If you ever want to disable that, set:

```env
VITE_ENABLE_API_WARMUP=false
```

## 1. Neon database

1. Create a free Neon project.
2. Create a database, or use the default one.
3. Copy the pooled connection string.
4. Put that value into the backend `DATABASE_URL` environment variable on Render.

Example format:

```env
DATABASE_URL=postgresql://username:password@ep-xxxx.region.aws.neon.tech/dbname?sslmode=require
```

## 2. Deploy backend to Render

Render can use the included `render.yaml`, or you can create the service manually.

### Render service settings

- Root directory: repository root
- Build command: `pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput`
- Start command: `gunicorn smt_backend.wsgi:application --bind 0.0.0.0:$PORT`

### Required Render environment variables

Set these in Render after you know your real domains:

```env
DJANGO_SETTINGS_MODULE=smt_backend.settings.prod
DEBUG=False
DATABASE_URL=postgresql://...
ALLOWED_HOSTS=your-render-service.onrender.com
CSRF_TRUSTED_ORIGINS=https://your-vercel-app.vercel.app
CORS_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
REFRESH_COOKIE_SECURE=True
REFRESH_COOKIE_SAMESITE=None
```

If you add a custom frontend domain later, update both `CSRF_TRUSTED_ORIGINS` and `CORS_ALLOWED_ORIGINS`.

## 3. Deploy frontend to Vercel

Create the Vercel project with:

- Framework preset: `Vite`
- Root directory: `smt_frontend`

### Frontend environment variables

```env
VITE_API_URL=https://your-render-service.onrender.com/api
VITE_ENABLE_API_WARMUP=true
```

`smt_frontend/vercel.json` is included so Vercel serves the built SPA correctly on refresh and deep links.

## 4. Create the first production user

After the backend is deployed:

```bash
python manage.py createsuperuser
```

You can run that from a Render shell, or create a management job/one-off command in the Render dashboard.

## 5. Final checklist

- Render deploy succeeds
- Vercel build succeeds
- Render `ALLOWED_HOSTS` matches the real Render hostname
- Render `CSRF_TRUSTED_ORIGINS` matches the real Vercel frontend URL
- Render `CORS_ALLOWED_ORIGINS` matches the real Vercel frontend URL
- Vercel `VITE_API_URL` points to Render `/api`
- Neon connection string is in `DATABASE_URL`
- Login works from the deployed frontend

## Notes about auth in production

This app uses a refresh token in an `HttpOnly` cookie. Because the frontend and backend are on different domains in production, the cookie must be:

- `Secure=True`
- `SameSite=None`

That is now supported by the backend configuration and wired through environment variables.
