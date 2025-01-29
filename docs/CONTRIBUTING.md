# Contributing to ft_transcendence

Thank you for your interest in contributing to ft_transcendence! This document provides guidelines and instructions for contributing to the project.

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/get-started/) and [Docker Compose](https://docs.docker.com/compose/install/)
- [Python 3.10+](https://www.python.org/downloads/)
- [Git](https://git-scm.com/downloads)

### Setting Up the Development Environment

First, clone the repository:

```bash
git clone https://github.com/suiramdev/ft_transcendence.git
cd ft_transcendence
```

#### Option 1: Quick Setup (Using Makefile)

1. Set up everything (environment, dependencies, Docker):

   ```bash
   make setup
   ```

2. Run migrations:

   ```bash
   make migrate
   ```

3. Start the development server:
   ```bash
   make run
   ```

#### Option 2: Manual Setup

1. Create and configure environment:

   ```bash
   cp .env.example .env
   python -m venv venv
   source venv/bin/activate  # On Unix/macOS
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Start Docker containers:

   ```bash
   docker compose -f docker/docker-compose.yml up -d
   ```

4. Run migrations:

   ```bash
   python manage.py migrate
   ```

5. Start the development server:
   ```bash
   python manage.py runserver
   ```

### Available Makefile Commands

Here's the full list of available Makefile commands and their equivalents:

```bash
# Setup and Installation
make setup              # Runs full setup (venv, dependencies, .env, docker)
make install            # pip install -r requirements.txt

# Development
make run                # python manage.py runserver
make migrate            # python manage.py migrate
make static             # python manage.py collectstatic --noinput
make test               # python manage.py test
make create app <name>  # Creates a new Django app in apps/ directory
make create migrations  # Creates new migrations for model changes

# Docker Management
make docker             # docker compose up -d
make stop               # docker compose down

# Database Management
make create-db          # Ensures database exists in PostgreSQL

# Maintenance
make clean              # Removes venv, __pycache__, and temporary files
```

To see all available commands with descriptions:

```bash
make help
```

### Creating New Apps and Migrations

The `make create` command provides two main functionalities:

1. Creating new Django apps:

   ```bash
   make create app myapp
   ```

   This will:

   - Create a new app in the `apps/` directory
   - Register it automatically in `INSTALLED_APPS`
   - Set up the basic app structure

2. Creating migrations:

   ```bash
   make create migrations        # Create migrations for all apps
   make create migrations myapp  # Create migrations for specific app
   ```

   Use this after making changes to your models to generate new database migrations.

## Development Workflow

1. Create a new branch for your feature/fix:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following our coding standards
3. Test your changes thoroughly
4. Commit your changes:

   ```bash
   git add .
   git commit -m "feat: description of your changes"
   ```

5. Push to your fork:

   ```bash
   git push origin feature/your-feature-name
   ```

6. Create a Pull Request from your fork to our main repository

## Coding Standards

### Python

- Follow PEP 8 style guide
- Use meaningful variable and function names
- Add docstrings for functions and classes
- Keep functions focused and concise
- Write unit tests for new features

### JavaScript

- Use ES6+ features
- Follow consistent indentation (2 spaces)
- Use meaningful variable and function names
- Add comments for complex logic

### HTML/CSS

- Use semantic HTML elements
- Follow BEM naming convention for CSS classes
- Keep styles modular and reusable

## Pull Request Guidelines

1. Provide a clear, descriptive title
2. Include a detailed description of changes
3. Reference any related issues
4. Update documentation if needed

## Commit Message Format

Follow the Conventional Commits specification:

- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Code style changes (formatting, etc.)
- refactor: Code refactoring
- test: Adding or updating tests
- chore: Maintenance tasks

Example:

```
feat: add user authentication system
```
