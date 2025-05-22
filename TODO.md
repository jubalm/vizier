# TODO: Vizier AI Chat Agent Project

## Data Simulation

- [x] Define Vizier database schema (Employee, Certificate, Requirement, Document, ComplianceStatus)
- [x] Create mock data for each schema entity
- [x] Collect or draft sample conceptual policy and regulatory documents
- [x] Set up simulated directory for policy files
- [x] Map policy requirements to database fields

## Authentication & Session Management (Planned)

- [x] Research Bun's built-in routing for middleware or hooks to inject authentication into API endpoints
- [x] Scaffold a separate `auth.db` for authentication and session data
- [x] Implement demo authentication with username and email fields (no password for demo)
- [x] Integrate authentication checks into protected API endpoints (e.g., `/api/chat`) <!-- (pending: actual protection logic) -->
- [x] Document authentication and session flow in project docs
- [x] Reimplement session and authentication using cookies instead of headers
- [~] Build UI for user registration and login (with cookie-based session) <!-- in progress -->
  - [x] Create RegistrationForm component (username, email, submit, error handling)
  - [x] Create LoginForm component (username, submit, error handling, switch to register)
  - [ ] Add logic to check authentication state on app load (session check or cookie)
  - [ ] Store and update authentication state in the frontend
  - [ ] Conditionally render RegistrationForm, LoginForm, or main app (ChatInterface) based on auth state
  - [ ] Provide a way to switch between registration and login forms
  - [ ] Add a logout button that clears the session (cookie) and returns to login
  - [x] Connect RegistrationForm to /api/auth/register
  - [x] Connect LoginForm to /api/auth/session (handle Set-Cookie)
  - [ ] Ensure all protected API calls send the session cookie automatically
  - [ ] Show loading indicators and error messages for all auth actions
  - [ ] Display success messages or redirect on successful login/registration
  - [ ] Manually test registration, login, logout, and session persistence
  - [ ] Add frontend tests (if desired) for auth flows
  - [ ] Document the UI auth flow in project docs

## AI Chat Agent Development

- [ ] Define user stories and workflows for HR agents
- [ ] Design chat agent prompts and expected responses
- [ ] Integrate chat agent with mock data and policy files

## Testing

- [x] Test chat agent with simulated data and workflows <!-- (basic endpoint tested) -->
- [ ] Refine data, workflows, and agent responses based on feedback

## Documentation

- [x] Document database schema and data simulation process
- [x] Document policy file structure and mapping
- [ ] Document chat agent workflows and usage

---

**See `plan.md` for more details.**
