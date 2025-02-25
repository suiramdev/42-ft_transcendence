# Authentication API

The authentication API handles user authentication and authorization.

## Authentication Flow

1. User initiates OAuth authentication with 42
2. Backend validates the OAuth token
3. Backend issues JWT tokens (access and refresh)
4. JWT tokens are stored as HttpOnly cookies
5. Access token is used for subsequent API requests

## Endpoints

### OAuth Authentication

#### GET `/api/auth/42/authorize/`

Redirects the user to the 42 OAuth authorization page.

#### GET `/api/auth/42/callback/`

Handles the OAuth callback from 42 and sets authentication cookies.

**Query Parameters:**

- `code`: OAuth authorization code

**Response:**

- Redirects to the home page on success
- Redirects to login page with error on failure

### JWT Token Management

#### POST `/api/auth/token/refresh/`

Refreshes the access token using the refresh token.

**Request:**
No body required, uses the refresh token cookie.

**Response:**

```json
{
  "access": "new.access.token"
}
```