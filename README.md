# ft_transcendence

A real-time multiplayer Pong game web application featuring user authentication, live chat, and social features. Built with Django and vanilla HTML/CSS/JavaScript, this project delivers a modern take on the classic arcade game with seamless multiplayer functionality and real-time communication.

This project is part of the 42 School curriculum. See the [subject](docs/subject.pdf) for more details.

## Prerequisites

- [Docker](https://www.docker.com/get-started/) and [Docker Compose](https://docs.docker.com/compose/install/)
- [Python 3.10+](https://www.python.org/downloads/)
- [Git](https://git-scm.com/downloads)

## Quick Setup (Using Makefile)

1. Clone the repository:

   ```bash
   git clone https://github.com/suiramdev/42-ft_transcendence.git
   cd 42-ft_transcendence
   ```

2. Run setup (creates venv, installs dependencies, sets up Docker):

   ```bash
   make setup
   ```

3. Run migrations:

   ```bash
   make migrate
   ```

4. Start the development server:
   ```bash
   make run
   ```

The application will be available at `http://localhost:8000`.

## Available Commands

```bash
# Setup and Installation
make setup      # Runs full setup (venv, dependencies, .env, docker)
make install    # Install Python dependencies

# Development
make run        # Start development server
make migrate    # Run database migrations
make static     # Collect static files
make test       # Run tests

# Docker Management
make docker     # Start Docker containers
make stop       # Stop Docker containers

# Maintenance
make clean      # Remove venv and temporary files
```

To see all available commands with descriptions:

```bash
make help
```

## Project Structure

```
ft_transcendence/
├── api/                # Django project settings and main URLs
├── apps/              # Django applications
│   ├── users/         # User authentication and profiles
│   └── ...
├── docs/              # Documentation
├── templates/         # HTML templates
│   ├── css/          # Stylesheets
│   └── js/           # JavaScript files
└── docker/           # Docker configuration files
```

## Tech Stack

- **Backend:** Django with Django REST Framework
- **Frontend:** Vanilla HTML, CSS, and JavaScript
- **Database:** PostgreSQL (via Docker)
- **Real-time:** Django Channels for WebSocket support
- **Authentication:** OAuth 2.0 integration

## Contributing

Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details on:

- Setting up your development environment
- Coding standards
- Pull request process
- Commit message conventions
