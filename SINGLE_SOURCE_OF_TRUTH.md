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
