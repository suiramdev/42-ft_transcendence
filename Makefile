# Variables
PYTHON = python3
VENV = venv
PIP = $(VENV)/bin/pip
PYTHON_VENV = $(VENV)/bin/python
DOCKER_COMPOSE = docker compose -f docker/docker-compose.yml --env-file .env

# Colors for terminal output
GREEN = \033[0;32m
NC = \033[0m # No Color

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
	@echo "  make migrate   - Run database migrations"
	@echo "  make static    - Collect static files"
	@echo "  make test      - Run tests"

setup: $(VENV) .env docker
	@echo "${GREEN}Setup completed!${NC}"

$(VENV):
	@echo "Creating virtual environment..."
	@$(PYTHON) -m venv $(VENV)
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

migrate:
	@echo "Running migrations..."
	@$(PYTHON_VENV) manage.py migrate

static:
	@echo "Collecting static files..."
	@$(PYTHON_VENV) manage.py collectstatic --noinput

run: docker
	@echo "Starting development server..."
	@$(PYTHON_VENV) manage.py runserver

test:
	@echo "Running tests..."
	@$(PYTHON_VENV) manage.py test

.PHONY: help setup install docker stop clean migrate static run test