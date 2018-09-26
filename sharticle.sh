#!/bin/bash
# Script for Sharticle development

# MongoDB
sudo service mongod start


# Memcached
memcached &


# Text editor (VS Code)
code

# Browser client
# google-chrome localhost:8000/ &


# Celery (task queue)
celery -A sharticle worker -l info -B &


# Application (Sharticle)
python3 manage.py runserver &
# gunicorn --bind 0.0.0.0:8000 sharticle.wsgi


# Web/application servers
sudo service varnish restart
sudo service gunicorn restart
sudo service nginx restart


