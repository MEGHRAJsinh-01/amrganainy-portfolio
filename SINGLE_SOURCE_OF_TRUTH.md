Single Source of Truth (SoT) Policy

Scope
- Users: identity/auth only (username, email, password, role, tokens/flags)
- Profiles: portfolio content (name, title, bio, location, contactEmail, socialLinks, skills, theme, images/CV, integrations, settings)

API Contract
- Profile GET responses return both:
  - data.profile — definitive portfolio data
  - data.user — minimal identity { username, email } for convenience/fallback
- Profile PATCH updates only profile fields; user-owned fields (email, username, role, password) are rejected.

Migration Cleanup
- Legacy user.githubUrl and user.linkedinUrl are deprecated.
- Migration script provided: server/scripts/migrations/2025-09-13-move-user-social-links-to-profile.js
  - Moves any lingering user.*Url into profile.socialLinks if missing.

Client Guidance
- Read from ProfileContext only; it normalizes data and falls back to user summary when needed.
- Do not read social links from the Users API.

Rationale
- Keeps writes clean (each model owns its data), and reads convenient (client gets both pieces in a single response).

## Frontend Refactor Plan (September 2025)

### Current Issues
- Business logic scattered across frontend components (data fetching, processing, normalization)
- Complex data transformation in contexts and services
- URL manipulation and external API calls in client-side code
- Translation logic mixed with UI components

### Proposed Architecture
**Backend Responsibilities:**
- Data fetching from external APIs (GitHub, LinkedIn)
- Data normalization and transformation
- URL processing and validation
- Business logic for profile aggregation
- Skills extraction from repositories

**Frontend Responsibilities:**
- UI rendering and user interaction
- API communication
- State management (simple)
- Presentation logic only

### New Backend Endpoints
1. `GET /api/github/skills/:username` - Extract skills from GitHub repos
2. `GET /api/profile/aggregated/:username` - Complete profile with integrated data
3. `GET /api/projects/enriched/:username` - Projects with GitHub data
4. `POST /api/translate/batch` - Batch translation processing
5. `POST /api/utils/full-url` - URL normalization

### Implementation Steps
1. ✅ Document refactor plan
2. ✅ Implement backend skills endpoint (`GET /api/github/skills/:username`)
3. ✅ Implement backend aggregated profile endpoint (`GET /api/profile/aggregated/:username`)
4. ✅ Update frontend API layer with new methods
5. ✅ Refactor About component to use aggregated API
6. ✅ Remove DynamicText dependency and update dependent components
7. ✅ Refactor Projects component to use enriched backend endpoint
8. ✅ Simplify ProfileContext normalization logic
9. ⏳ Test refactored components

### Benefits
- Better separation of concerns
- Improved maintainability
- Enhanced security (API keys server-side)
- Better performance (reduced client processing)
- Easier testing of business logic
- Consistent API responses
