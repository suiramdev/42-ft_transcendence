# Project Architecture

This document explains the architecture and organization of the ft_transcendence project.

## Project Structure Overview

```
ft_transcendence/
├── api/               # Core Django project configuration
├── apps/              # Django applications
├── docs/              # Project documentation
├── templates/         # Frontend templates and assets
└── docker/            # Docker configuration files
```

## Core Components

### API Directory (`api/`)

The `api/` directory contains the core Django project configuration:

- `settings.py`: Project-wide settings, including:

  - Installed apps
  - Middleware configuration
  - Database settings
  - Static/Media files configuration
  - Authentication backends
  - WebSocket configuration
  - Third-party integrations

- `urls.py`: Main URL routing configuration
- `asgi.py`: ASGI configuration for WebSocket support
- `wsgi.py`: WSGI configuration for HTTP requests

### Apps Directory (`apps/`)

The `apps/` directory follows Django's modular architecture pattern. Each app represents a distinct feature or functionality of the project.

Current apps:

- `user/`: User authentication and profile management

  - `models.py`: Database models for user data
  - `views.py`: View logic and API endpoints
  - `serializers.py`: Data serialization for API responses
  - `urls.py`: App-specific URL routing

- `game/`: Game logic and multiplayer functionality

  - `models.py`: Database models for game data
  - `views.py`: View logic and API endpoints
  - `serializers.py`: Data serialization for API responses
  - `urls.py`: App-specific URL routing

- `authentication/`: Authentication and authorization

  - `models.py`: Database models for authentication data
  - `views.py`: View logic and API endpoints
  - `serializers.py`: Data serialization for API responses
  - `urls.py`: App-specific URL routing

#### Creating a New App

1. Create the app structure:

   ```bash
   python manage.py startapp your_app_name apps/your_app_name
   ```

2. Register the app in `api/settings.py`:

   ```python
   INSTALLED_APPS = [
       ...
       'apps.your_app_name',
   ]
   ```

3. Create app-specific URLs in `apps/your_app_name/urls.py`:

   ```python
   from django.urls import path
   from . import views

   app_name = 'your_app_name'
   urlpatterns = [
       path('endpoint/', views.YourView.as_view(), name='endpoint'),
   ]
   ```

4. Include app URLs in `api/urls.py`:
   ```python
   urlpatterns = [
       ...
       path('api/your-app/', include('apps.your_app_name.urls')),
   ]
   ```

### Templates Directory (`templates/`)

The `templates/` directory contains all frontend-related files:

```
templates/
├── css/          # Stylesheets
├── js/           # JavaScript files
└── *.html        # HTML templates
```

- Static files are collected using `make static`
- (preffered) Follow BEM naming convention for CSS classes

### Docker Directory (`docker/`)

Contains Docker-related configuration:

- `Dockerfile`: Application container definition
- `docker-compose.yml`: Multi-container orchestration
- Service-specific configurations
