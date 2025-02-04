# Variables
PYTHON = python3
VENV = venv
PIP = $(VENV)/bin/pip
PYTHON_VENV = $(VENV)/bin/python
DOCKER_COMPOSE = docker compose -f docker/docker-compose.yml --env-file .env
DB_NAME = $(shell grep DB_NAME .env | cut -d '=' -f2)
DB_USER = $(shell grep DB_USER .env | cut -d '=' -f2)
DB_PASSWORD = $(shell grep DB_PASSWORD .env | cut -d '=' -f2)

# Colors for terminal output
GREEN = \033[0;32m
NC = \033[0m # No Color
RED = \033[0;31m

# Default target
.DEFAULT_GOAL := help

help:
	@echo "Available commands:"
	@echo "  make setup      - Initial project setup (venv, dependencies, env file)"
	@echo "  make install    - Install Python dependencies"
	@echo "  make run       - Run the development server"
	@echo "  make docker    - Start Docker containers"
	@echo "  make stop      - Stop Docker containers"
	@echo "  make clean     - Remove virtual environment and cached files"
	@echo "  make create    - Create migrations or new Django app"
	@echo "  make migrate   - Run database migrations"
	@echo "  make static    - Collect static files"
	@echo "  make test      - Run tests"

setup: $(VENV) .env docker 
	@echo "${GREEN}Setup completed!${NC}"

$(VENV):
	@echo "Creating virtual environment..."
	@$(PYTHON) -m venv $(VENV)
	@echo "Activating virtual environment..."
	@. $(VENV)/bin/activate
	@$(PIP) install --upgrade pip
	@make install

.env:
	@echo "Creating .env file..."
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "${GREEN}.env file created from example${NC}"; \
	fi

install:
	@echo "Installing dependencies..."
	@$(PIP) install -r requirements.txt

docker:
	@echo "Starting Docker containers..."
	@$(DOCKER_COMPOSE) up -d

stop:
	@echo "Stopping Docker containers..."
	@$(DOCKER_COMPOSE) down

clean:
	@echo "Cleaning up..."
	@rm -rf $(VENV) __pycache__ .pytest_cache
	@find . -type d -name "__pycache__" -exec rm -r {} +
	@find . -type f -name "*.pyc" -delete

create:
	@if [ "$(filter migrations,$(MAKECMDGOALS))" = "migrations" ]; then \
		echo "Creating migrations..."; \
		$(PYTHON_VENV) manage.py makemigrations $(filter-out migrations,$(ARGS)) 2>/dev/null; \
		echo "${GREEN}Migrations created successfully!${NC}"; \
	elif [ "$(filter app,$(MAKECMDGOALS))" = "app" ]; then \
		echo "Creating new Django app..."; \
		cd apps && ../$(PYTHON_VENV) ../manage.py startapp $(word 3,$(MAKECMDGOALS)) 2>/dev/null && { \
			echo "Registering app in INSTALLED_APPS..."; \
			cd .. && $(PYTHON_VENV) scripts/register_app.py $(word 3,$(MAKECMDGOALS)) 2>/dev/null; \
			echo "${GREEN}App created and registered successfully!${NC}"; \
		} || { \
			echo "${RED}Failed to create app '$(word 3,$(MAKECMDGOALS))'. Make sure the app name is valid and doesn't already exist${NC}"; \
			exit 1; \
		} \
	else \
		echo "Usage:"; \
		echo "  make create migrations [app_name]  - Create migrations for all or specific app"; \
		echo "  make create app <app_name>        - Create new Django app"; \
	fi

migrate: create-db
	@echo "Running migrations..."
	@$(PYTHON_VENV) manage.py migrate

static:
	@echo "Collecting static files..."
	@$(PYTHON_VENV) manage.py collectstatic --noinput

run: docker
	@echo "Activating virtual environment..."
	@. $(VENV)/bin/activate
	@echo "Starting development server..."
	@$(PYTHON_VENV) manage.py runserver

test:
	@echo "Running tests..."
	@$(PYTHON_VENV) manage.py test

create-db:
	@echo "Ensuring database exists..."
	@$(DOCKER_COMPOSE) exec -T postgres psql -U $(DB_USER) -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$(DB_NAME)'" | grep -q 1 || \
	$(DOCKER_COMPOSE) exec -T postgres psql -U $(DB_USER) -d postgres -c "CREATE DATABASE $(DB_NAME)"

# Ignore all targets that don't match any of the above
%:
	@:

.PHONY: help setup install docker stop clean migrate static run test create-db
