#!/bin/sh

python manage.py makemigrations base
python manage.py migrate
python manage.py collectstatic --no-input
python manage.py createsuperuser --email $SUPER_USER_EMAIL --noinput

# daphne -b 0.0.0.0 -p 8000 backend.asgi:application
uvicorn backend.asgi:application --reload --port 8000 --host 0.0.0.0
