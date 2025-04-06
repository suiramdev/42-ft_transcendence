"""
Production settings for transcendence project.
"""

from .base import *
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

ALLOWED_HOSTS = os.getenv('DJANGO_ALLOWED_HOSTS', '').split(',')

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST'),
        'PORT': os.getenv('DB_PORT'),
        'POOL_OPTIONS': {
            'POOL_SIZE': int(os.getenv('DB_POOL_SIZE', 20)),
            'MAX_OVERFLOW': int(os.getenv('DB_MAX_OVERFLOW', 10)),
            'TIMEOUT': int(os.getenv('DB_TIMEOUT', 30)),
            'RECYCLE': int(os.getenv('DB_RECYCLE', 3600)),
            'PRE_PING': True,
            'ECHO': False,
        }
    }
}

# CORS settings for production
CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', '').split(',')

# Security settings for production
SECURE_SSL_REDIRECT = False  # Disabled because Nginx handles SSL redirects
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')  # Trust the X-Forwarded-Proto header from Nginx
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# JWT settings for production
SIMPLE_JWT['SIGNING_KEY'] = os.getenv('AUTH_JWT_SECRET_KEY')

# Email settings for production
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.getenv('EMAIL_HOST')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')

# Redis settings for production
CHANNEL_LAYERS['default']['CONFIG']['hosts'] = [
    (os.getenv('CACHE_REDIS_HOST', 'redis'), 
     int(os.getenv('CACHE_REDIS_PORT', 6379)))
]

# Logging configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'level': 'ERROR',
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'ERROR',
            'propagate': True,
        },
    },
} 