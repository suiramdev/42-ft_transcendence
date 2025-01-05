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

- `users/`: User authentication and profile management
  - `models.py`: Database models for user data
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

- Use Django template inheritance with `{% extends 'base.html' %}`
- Static files are collected using `make static`
- Follow BEM naming convention for CSS classes

### Docker Directory (`docker/`)

Contains Docker-related configuration:

- `Dockerfile`: Application container definition
- `docker-compose.yml`: Multi-container orchestration
- Service-specific configurations

## Key Design Patterns

1. **MVT (Model-View-Template)**

   - Models: Database schema in `models.py`
   - Views: Business logic in `views.py`
   - Templates: HTML files in `templates/`

2. **RESTful API Design**

   - Use Django REST Framework
   - Endpoints follow REST conventions
   - Serializers for data transformation

3. **WebSocket Communication**
   - Django Channels for real-time features
   - Consumers handle WebSocket connections
   - Routing in `routing.py` files

## Best Practices

1. **App Organization**

   - Keep apps focused and single-purpose
   - Use meaningful app names
   - Include app-specific tests
   - Document app functionality

2. **Code Structure**

   - Follow Django's style guide
   - Use type hints in Python code
   - Write docstrings for classes and functions
   - Keep views thin, logic in services

3. **API Design**

   - Version your APIs
   - Use meaningful endpoint names
   - Document API endpoints
   - Handle errors consistently

4. **Security**
   - Store secrets in `.env`
   - Use Django's security features
   - Validate user input
   - Follow OWASP guidelines

## Development Flow

1. **Creating New Features**

   - Create a new app if needed
   - Define models and migrations
   - Implement views and serializers
   - Add URL patterns
   - Create templates
   - Write tests

2. **Making Changes**
   - Follow the contributing guidelines
   - Update documentation
   - Run tests before committing
   - Use proper commit messages

## Testing

- Write tests in app's `tests.py`
- Run tests with `make test`
- Test coverage for:
  - Models
  - Views
  - API endpoints
  - WebSocket consumers

## Documentation

Keep documentation up-to-date:

- Update `README.md` for project-wide changes
- Document APIs using docstrings
- Update this architecture guide for structural changes
- Use inline comments for complex logic
