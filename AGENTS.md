# Agent Instructions — Locksyra

> Mirrored across CLAUDE.md, AGENTS.md, and GEMINI.md.

## Project Overview

Locksyra is a full-stack AI-powered cybersecurity awareness platform for students.
- **Frontend**: React 19 + Tailwind CSS, deployed on Firebase Hosting
- **Backend**: Node.js + Express + MongoDB (Mongoose), runs on port 5001
- **Auth**: JWT (access + refresh tokens), bcrypt password hashing
- **Encryption**: AES-256-GCM for vault passwords
- **AI**: Claude API (Anthropic) for security analysis
- **Mobile**: Capacitor for iOS/Android
- **Browser Extension**: Chrome MV3 extension in `browser-extension/`

## The 3-Layer Architecture

**Layer 1: Directive (What to do)**
- SOPs in `directives/` (Markdown)
- Define goals, inputs, tools/scripts, outputs, edge cases

**Layer 2: Orchestration (You)**
- Read directives → call execution tools in order → handle errors → update directives
- Never scrape or call APIs yourself; delegate to scripts in `execution/`

**Layer 3: Execution (Deterministic)**
- Python scripts in `execution/`
- Secrets in `.env` — never hardcode API keys
- Scripts must be commented, testable, and idempotent

## Critical Rules for This Codebase

### Environment & Secrets
- NEVER hardcode API keys. All secrets live in `.env` files.
- Frontend env vars must be prefixed `REACT_APP_` and never contain secrets.
- Backend `.env` requires: `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ENCRYPTION_KEY` (64 hex chars), `MONGODB_URI`.
- The Firebase config in `src/firebase.js` is public-safe (Firebase client keys are not secret) but still prefer env vars.

### JWT Token Handling
- Access tokens: short-lived (15m), signed with `JWT_SECRET`, issuer `locksyra-api`, audience `locksyra-client`
- Refresh tokens: long-lived (7d), signed with `JWT_REFRESH_SECRET`, same issuer/audience
- **CRITICAL**: issuer and audience must match between `jwtHelper.js` and `auth.js` middleware — always use `locksyra-api` / `locksyra-client`
- Never verify access tokens with the refresh secret or vice versa

### Database
- ORM: Mongoose (MongoDB). The `database/schema.sql` is legacy/unused PostgreSQL — do not run it.
- All models live in `backend/src/models/`
- Always use `.lean()` for read-only queries for performance
- User passwords are selected with `+password` explicitly — they are excluded by default

### API Response Shape
All API responses follow this shape:
```json
{ "success": true/false, "data": {}, "message": "..." }
```
- Frontend `api.js` expects `response.data` to contain the payload
- Never change this shape without updating both backend routes and frontend `api.js`

### Encryption
- All vault passwords encrypted with AES-256-GCM before saving to MongoDB
- `ENCRYPTION_KEY` must be exactly 32 bytes (64 hex characters)
- Never log decrypted passwords — not even in development
- The `encrypt`/`decrypt` functions live in `backend/src/services/encryption.js`

### Frontend Architecture
- Auth state managed by `AuthContext` (`src/context/AuthContext.js`)
- All API calls go through `src/services/api.js` — never use raw `fetch` in components
- Navigation is screen-based (`currentScreen` state in `App.js`) — not React Router
- Tailwind utility classes only — no custom CSS except in `index.css` and `App.css`
- Lucide React for all icons — do not add other icon libraries

### Rate Limiting
Rate limiters are defined in `backend/src/middleware/rateLimiter.js`:
- `authLimiter`: login/register (IP-based, 10 req/15min)
- `apiLimiter`: general authenticated routes (user-based, 100 req/15min)
- `breachCheckLimiter`: breach checks (user-based, 20 req/min)
- `aiAnalysisLimiter`: AI calls (user-based, 15 req/hour)
- Always apply the correct limiter to new routes

### Browser Extension
- Lives in `browser-extension/` — Manifest V3
- Communicates with backend at `http://localhost:5001` (dev) or production URL
- Token storage: `chrome.storage.local` only — never `localStorage`
- Background script is a service worker — no DOM access

## Self-Annealing Loop

When something breaks:
1. Read the full error and stack trace
2. Fix the script/code
3. Test it (avoid re-running if it costs paid API credits — check with user first)
4. Update the relevant directive with what you learned
5. Document the fix so the system gets stronger

## File Organization
locksyra/
├── src/                    # React frontend
│   ├── components/         # UI components (organized by feature)
│   ├── context/            # React context (AuthContext)
│   ├── services/           # API client (api.js)
│   └── utils/              # Pure utility functions
├── backend/
│   └── src/
│       ├── config/         # DB connection
│       ├── middleware/      # auth, rateLimiter, validation, errorHandler
│       ├── models/          # Mongoose models
│       ├── routes/          # Express route handlers
│       ├── services/        # Business logic (breach, encryption)
│       └── utils/           # JWT helpers, logger, password strength
├── browser-extension/      # Chrome MV3 extension
├── directives/             # SOPs (Markdown) — agent instructions
├── execution/              # Deterministic Python scripts
├── database/               # Legacy SQL schema (unused)
├── .tmp/                   # Intermediate files — never commit
└── .env                    # Secrets — never commit

**Deliverables**: Firebase Hosting (frontend), backend on Render/Heroku/Railway
**Intermediates**: `.tmp/` — always regenerated, never committed

## Common Pitfalls to Avoid

- Do not call `api.checkEmailBreach()` — use `api.js` methods; never raw fetch in components
- Do not add `console.log` with passwords, tokens, or encrypted values in production code
- Do not use `localStorage` in the browser extension — use `chrome.storage.local`
- Do not modify `AGENTS.md` / `CLAUDE.md` / `GEMINI.md` without explicit instruction
- Do not create new Mongoose models without adding indexes for common query fields
- Do not add dependencies without checking if an existing utility already covers the need

## Summary

You sit between human intent (directives) and deterministic execution (scripts).
Read instructions → make decisions → call tools → handle errors → continuously improve.

Be pragmatic. Be reliable. Self-anneal. Never expose secrets.