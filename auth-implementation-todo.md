# Authentication Implementation TODO

This file outlines the remaining steps to implement session-based authentication.

## Backend (API)

1.  **Create API Routes for Authentication (`src/routes/auth.ts`) using Hono**:

    - Install Hono: `bun add hono`
    - Initialize a Hono app instance in `src/routes/auth.ts`.
    - **POST `/api/auth/signup`**:
      - Use Hono's context (`c`) to get request body and set cookies.
      - Validate input (username, password) from `await c.req.json()`.
      - Check if username already exists using `getUserByUsername`.
      - Create new user using `createUser` from `src/lib/auth.ts`.
      - Create a session using `createSession`.
      - Set an HTTP-only cookie with the session ID using `setCookie` from `hono/cookie`.
      - Return user information (excluding password) as JSON.
    - **POST `/api/auth/login`**:
      - Validate input (username, password) from `await c.req.json()`.
      - Retrieve user by username using `getUserByUsername`.
      - Verify password using `verifyPassword`.
      - If valid, create a session using `createSession`.
      - Set an HTTP-only cookie with the session ID using `setCookie`.
      - Return user information (excluding password) as JSON.
    - **POST `/api/auth/logout`**:
      - Get session ID from cookie using `getCookie` from `hono/cookie`.
      - Delete the session using `deleteSession`.
      - Clear the session cookie using `deleteCookie` from `hono/cookie`.
      - Return a success message as JSON.
    - **GET `/api/auth/session`**:
      - Get session ID from cookie using `getCookie`.
      - Validate the session using `getSession`.
      - If valid and not expired, return user information (e.g., username, id) as JSON.
      - If invalid or expired, clear cookie and return null or an appropriate error (e.g., 401 status) as JSON.

2.  **Integrate Auth Routes into Main App (`src/index.tsx`)**:

    - Import and use the new Hono auth routes. The main app will need to be adapted to use Hono as its primary router or to delegate to Hono for the `/api/auth` path.

3.  **Implement Session Cookie Handling (using Hono's `hono/cookie` middleware)**:

    - Use `setCookie`, `getCookie`, `deleteCookie` from `hono/cookie`.
    - Ensure cookies are HTTP-only, secure (in production), and have appropriate SameSite attributes (e.g., `Lax` or `Strict`).

4.  **Protect API Routes (Middleware/Hook using Hono)**:
    - Create a Hono middleware function.
    - This middleware will:
      - Extract session ID from the cookie using `getCookie`.
      - Validate the session using `getSession`.
      - If session is invalid or expired, return a 401 Unauthorized error using `c.json({ error: "Unauthorized" }, 401)`.
      - If valid, attach user information to Hono's context (`c.set('user', user)`) for downstream handlers.
    - Apply this middleware to protected routes (e.g., `/api/chat` if it's also handled by Hono, or adapt the existing Elysia/other router to call this logic).

## Frontend (React)

1.  **Create Authentication Context/Store**:

    - Use React Context or a state management library (like Zustand) to manage global authentication state (e.g., `currentUser`, `isAuthenticated`, `isLoading`).

2.  **Create Authentication Forms/Pages**:

    - `LoginPage.tsx`: Form with username and password fields, calls `/api/auth/login`.
    - `SignupPage.tsx`: Form with username and password fields, calls `/api/auth/signup`.

3.  **Update `App.tsx` / Main Layout**:

    - Wrap the application with the AuthProvider.
    - Implement routing (e.g., using `wouter` or another lightweight router if not already present) to handle `/login`, `/signup`, and protected routes.
    - Fetch initial session state on app load by calling `/api/auth/session`.
    - Conditionally render Login/Signup pages or the main application based on authentication state.

4.  **Update `UserMenu.tsx`**:

    - Display current user's username.
    - Include a "Logout" button that calls `/api/auth/logout` and updates the auth state.

5.  **Protected Routes/Components on Frontend**:

    - Create a higher-order component or a custom hook to protect routes/components that require authentication.
    - Redirect to `/login` if the user is not authenticated.

6.  **API Service for Auth Calls**:
    - Create helper functions to make API calls to the auth endpoints (signup, login, logout, session).
    - Handle responses and update the auth state accordingly.

## General

1.  **Error Handling and User Feedback**:

    - Ensure robust error handling for all API calls on both backend and frontend.
    - Provide clear user feedback for success and failure scenarios (e.g., "Login failed: Invalid credentials", "Signup successful! Redirecting...").

2.  **Security Considerations**:

    - Review cookie settings (HttpOnly, Secure, SameSite).
    - Password hashing is already implemented with `Bun.password`.
    - Consider rate limiting for login/signup attempts (optional, advanced).

3.  **Testing**:
    - Manually test all authentication flows: signup, login with correct/incorrect credentials, logout, session persistence across page reloads, session expiration, access to protected routes with/without authentication.
    - Consider writing automated tests (unit/integration) for auth logic and API endpoints.
