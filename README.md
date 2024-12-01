# ft_transcendence

A real-time multiplayer Pong game web application featuring user authentication, live chat, and social features. Built with Django and vanilla HTML/CSS/JavaScript, this project delivers a modern take on the classic arcade game with seamless multiplayer functionality and real-time communication.

See the [subject](subject.pdf) for more details.

## Installation

### Prerequisites

- Python 3.8 or later
- pip (Python package manager)
- PostgreSQL (Docker setup included)

### Setup

1. Clone the repository:

```bash
git clone https://github.com/suiramdev/42-ft_transcendence.git
```

2. Navigate to the project directory:

```bash
cd 42-ft_transcendence
```

#### Backend

1. Create and activate a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Configure the environment variables:

   - Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

   - Edit the `.env` file with your specific configurations
   - Required variables are pre-defined in `.env.example` with example values

   Example `.env` contents:

   ```bash
   DEBUG=True
   SECRET_KEY=your-secret-key
   POSTGRES_HOST=127.0.0.1
   POSTGRES_PORT=5432
   POSTGRES_USER=user
   POSTGRES_PASSWORD=password
   POSTGRES_DB=ft_transcendence
   ```

4. Set up the PostgreSQL database using Docker:

   - Ensure Docker and Docker Compose are installed on your machine.
   - Start the PostgreSQL server using the following command:

   ```bash
   docker compose up -d
   ```

   - This command will initialize and run the PostgreSQL server in the background.

5. Apply database migrations:

```bash
python manage.py migrate
```

---

### Notes on Dockerized PostgreSQL Setup

- The Docker Compose file (`docker-compose.yml`) is included in the repository. By default, it sets up a PostgreSQL database with the required configurations.
- You can customize the PostgreSQL settings (e.g., `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`) in the `docker-compose.yml` file.

---

After setting up the Dockerized PostgreSQL server and running the application, you can interact with the database and application as expected.

### Running the Application

To start the development server:

```bash
python manage.py runserver
```

The application will be available at `http://localhost:8000`.

## Development

### Project Structure

- **Backend:** Built with [Django](https://www.djangoproject.com/), featuring a robust MVT architecture and RESTful APIs.
- **Frontend:** Developed using vanilla HTML, CSS, and JavaScript for a lightweight and efficient UI.
- **Database:** PostgreSQL with Django ORM for database management and migrations.
- **WebSockets:** Real-time communication powered by Django Channels.

### Commands

| Command                            | Description                           |
| ---------------------------------- | ------------------------------------- |
| `python manage.py runserver`       | Starts the development server.        |
| `python manage.py makemigrations`  | Creates new database migrations.      |
| `python manage.py migrate`         | Applies database migrations.          |
| `python manage.py test`            | Runs all unit and integration tests.  |
| `python manage.py createsuperuser` | Creates a superuser for admin access. |

## Contribution Guidelines

We welcome contributions! Please follow these steps:

1. Fork the repository.
2. Create a new branch following the format `<type>/<issue-number>-<name>`:
   ```bash
   git checkout -b feat/42-user-authentication
   # or
   git checkout -b fix/57-login-error
   # or
   git checkout -b docs/12-api-documentation
   ```
3. Commit your changes:
   ```bash
   git commit -m "feat(auth): implement user authentication"
   ```
4. Push to your branch:
   ```bash
   git push origin feat/42-user-authentication
   ```
5. Create a pull request on GitHub.

Please ensure your code follows our linting and testing standards.
