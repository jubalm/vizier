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
- [ ] Reimplement session and authentication using cookies instead of headers
- [ ] Build UI for user registration and login (with cookie-based session)

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
