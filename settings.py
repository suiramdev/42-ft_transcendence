import os
from dotenv import load_dotenv

load_dotenv()

DATABASES = {
    'default': {
        'ENGINE': 'django_db_connection_pool.backends.postgresql',
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
            'PRE_PING': True,  # Check connection validity before using it
            'ECHO': bool(os.getenv('DB_ECHO', False)),  # Log all SQL statements
        }
    }
}