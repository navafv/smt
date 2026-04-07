# SMT deployment on WSL

This project is set up to run:

- Django behind `gunicorn`
- nginx as the reverse proxy
- the Vite frontend as static files served by nginx

## 1. Move the project into the Linux filesystem

Using the Linux filesystem is more reliable for permissions and performance than `/mnt/c/...`.

```bash
mkdir -p ~/apps
cp -r /mnt/c/Users/User/Desktop/smt_project ~/apps/smt_project
cd ~/apps/smt_project
```

## 2. Install system packages

```bash
sudo apt update
sudo apt install -y python3 python3-venv python3-pip postgresql postgresql-contrib nginx nodejs npm
```

## 2.1 Enable systemd in WSL

If `systemctl` does not work in your WSL distro yet, enable `systemd` first:

```bash
sudo tee /etc/wsl.conf > /dev/null <<'EOF'
[boot]
systemd=true
EOF
```

Then shut WSL down from Windows and start it again:

```powershell
wsl --shutdown
```

After reopening Ubuntu, confirm it is active:

```bash
systemctl is-system-running
```

## 3. Create the Python environment

```bash
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

## 4. Configure the backend environment

Copy the example and edit it for production:

```bash
cp .env.example .env
```

Recommended production values:

```env
SECRET_KEY=replace-this-with-a-long-random-secret
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,<your-ip-or-domain>
CSRF_TRUSTED_ORIGINS=http://localhost,http://127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost
CORS_ALLOW_CREDENTIALS=True
SECURE_SSL_REDIRECT=False
SECURE_HSTS_SECONDS=0
SECURE_HSTS_INCLUDE_SUBDOMAINS=False
SECURE_HSTS_PRELOAD=False
DATABASE_URL=postgres://user:password@localhost:5432/smt_db
```

If you later put HTTPS in front of nginx, change:

- `SECURE_SSL_REDIRECT=True`
- `SECURE_HSTS_SECONDS=31536000`
- `CSRF_TRUSTED_ORIGINS=https://<your-domain>`
- `CORS_ALLOWED_ORIGINS=https://<your-frontend-origin>`

## 5. Create PostgreSQL database

```bash
sudo -u postgres psql
```

Then run:

```sql
CREATE DATABASE smt_db;
CREATE USER smt_user WITH PASSWORD 'change-this-password';
ALTER ROLE smt_user SET client_encoding TO 'utf8';
ALTER ROLE smt_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE smt_user SET timezone TO 'Asia/Kolkata';
GRANT ALL PRIVILEGES ON DATABASE smt_db TO smt_user;
\q
```

Update `DATABASE_URL` in `.env` after that.

## 6. Apply migrations and collect static files

```bash
source venv/bin/activate
export DJANGO_SETTINGS_MODULE=smt_backend.settings.prod
python manage.py migrate
python manage.py collectstatic --noinput
```

## 7. Build the frontend

Create the frontend production env file:

```bash
cp smt_frontend/.env.production.example smt_frontend/.env.production
```

Set:

```env
VITE_API_URL=/api
```

Then build:

```bash
cd smt_frontend
npm install
npm run build
cd ..
```

This app is currently wired to `src1` through `smt_frontend/index.html`, so `vite build` will use that source tree.

## 8. Run gunicorn manually first

```bash
source venv/bin/activate
export DJANGO_SETTINGS_MODULE=smt_backend.settings.prod
gunicorn smt_backend.wsgi:application --config deploy/gunicorn.conf.py
```

## 9. Install the systemd service

Edit `deploy/systemd/smt-gunicorn.service` and replace every `<your-user>` with your Linux username.

This service will:

- start Django with Gunicorn on boot
- restart automatically if Gunicorn exits
- load your production `.env`
- write logs to `journald`, which you can inspect with `journalctl`

Then install it:

```bash
sudo cp deploy/systemd/smt-gunicorn.service /etc/systemd/system/smt-gunicorn.service
sudo systemctl daemon-reload
sudo systemctl enable smt-gunicorn
sudo systemctl start smt-gunicorn
sudo systemctl status smt-gunicorn
```

Useful service commands:

```bash
sudo systemctl restart smt-gunicorn
sudo systemctl stop smt-gunicorn
sudo systemctl enable smt-gunicorn
sudo systemctl disable smt-gunicorn
sudo journalctl -u smt-gunicorn -f
```

## 10. Install the nginx site

Edit `deploy/nginx/smt.conf` and replace `<your-user>` with your Linux username.

Then:

```bash
sudo cp deploy/nginx/smt.conf /etc/nginx/sites-available/smt
sudo ln -s /etc/nginx/sites-available/smt /etc/nginx/sites-enabled/smt
sudo nginx -t
sudo systemctl restart nginx
```

If the default nginx site conflicts, disable it:

```bash
sudo rm /etc/nginx/sites-enabled/default
sudo systemctl restart nginx
```

## 11. Verify

- Frontend: `http://localhost/`
- API: `http://localhost/api/`
- Admin: `http://localhost/admin/`

Useful commands:

```bash
sudo systemctl restart smt-gunicorn
sudo systemctl restart nginx
sudo journalctl -u smt-gunicorn -f
sudo tail -f /var/log/nginx/error.log
```
