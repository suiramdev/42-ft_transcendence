# Contributing to ft_transcendence

Thank you for your interest in contributing to ft_transcendence! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Getting Started](#getting-started)
- [Setting Up the Development Environment](#setting-up-the-development-environment)
- [Creating a New Django App](#creating-a-new-django-app)
- [Creating Migrations](#creating-migrations)
- [Adding a New Page](#adding-a-new-page)

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

## Create a New Django App

The `make create` command provides two main functionalities:

```bash
make create app myapp
```

This will:

- Create a new app in the `apps/` directory
- Register it automatically in `INSTALLED_APPS`
- Set up the basic app structure

## Create Migrations

```bash
make create migrations        # Create migrations for all apps
make create migrations myapp  # Create migrations for specific app
```

Use this after making changes to your models to generate new database migrations.

[Learn more about project architecture](docs/architecture.md)

## Add a New Page

1. Create HTML template in `templates/js/templates/example.html`

   ```html
   <div id="example"></div>
   ```

2. Create page class in `templates/js/pages/example.js`

   ```javascript
   import { Page } from '../core/Page.js';

   export class ExamplePage extends Page {
     constructor() {
       super('example.html');
     }
   }
   ```

3. Register route in `templates/js/app.js`

   ```javascript
   router.registerRoute('/example', new ExamplePage());
   ```

[Learn more about routing](docs/routing.md)
