# ft_transcendence

A real-time multiplayer Pong game web application featuring user authentication, live chat, and social features. Built with NestJS and Nuxt.js, this project delivers a modern take on the classic arcade game with seamless multiplayer functionality and real-time communication.

See the [subject](subject.pdf) for more details.

## Installation

### Prerequisites

- Node.js 20 or later
- pnpm 8 or later
- MySQL 8.0

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

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
pnpm install
```

3. Configure the environment variables:

   - Create a `.env` file in the `backend` directory.
   - Add the required variables as defined in `.env.example`.

   Example:

   ```bash
   NODE_ENV=development
   MYSQL_HOST=127.0.0.1
   MYSQL_PORT=3306
   MYSQL_USER=user
   MYSQL_PASSWORD=password
   MYSQL_DATABASE=ft_transcendence
   ```

4. Set up the MySQL database using Docker:

   - Ensure Docker and Docker Compose are installed on your machine.
   - Start the MySQL server using the following command:

   ```bash
   docker compose up -d
   ```

   - This command will initialize and run the MySQL server in the background.

---

### Notes on Dockerized MySQL Setup

- The Docker Compose file (`docker-compose.yml`) is included in the repository. By default, it sets up a MySQL database with the required configurations.
- You can customize the MySQL settings (e.g., `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`) in the `docker-compose.yml` file.

---

After setting up the Dockerized MySQL server and running the application, you can interact with the database and application as expected.

### Running the Application

To start the development server:

1. Start the backend:

```bash
pnpm run start:dev
```

2. Start the frontend:

```bash
pnpm run dev
```

The application will be available at `http://localhost:3000`.

## Development

### Project Structure

- **Backend:** Built with [NestJS](https://nestjs.com), featuring a modular architecture and RESTful APIs.
- **Frontend:** Developed using [Nuxt.js](https://nuxtjs.org) for server-side rendering and a responsive UI.
- **Database:** MySQL with [TypeORM](https://typeorm.io) for database management and migrations.
- **WebSockets:** Real-time communication powered by Socket.io.

### Commands

| Command              | Description                              |
| -------------------- | ---------------------------------------- |
| `pnpm run start:dev` | Starts the backend in development mode.  |
| `pnpm run dev`       | Starts the frontend in development mode. |
| `pnpm run build`     | Builds the application for production.   |
| `pnpm run lint`      | Runs linting checks.                     |
| `pnpm run test`      | Runs all unit and integration tests.     |

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
