# SkyportCare internal support desk (v1 prototype)

Lightweight, **AI-first** internal ticketing for SkyportCare — not a Zendesk replacement. This module is intentionally small: clear boundaries for swapping storage and model calls.

## Operating model & access

1. **Ownership** — Configured for a small internal group: primary owner + optional backup inboxes via env (`config/operatingModel.js`). Not everyone checks the app daily; **email-style interruption** is required for new work (see notifications).

2. **Notifications (required behavior)** — On **ticket created**, **owner assignment changed**, and **public form submit with customer email**, the client calls `notifications/outboundEmails.js`:
   - If `VITE_SUPPORT_DESK_NOTIFY_WEBHOOK_URL` is set → `POST` JSON payload for a serverless / automation (Zapier, n8n, Logic App) that sends **real email** and deep-links into the app.
   - If unset → `console.info` in dev only (no silent failure in production builds: still log in dev so integrators see the contract).
   - **Email = alert; web app = work** — the UI copy on ticket detail reinforces this.
   - **`ticket.customer_confirmation`** — payload includes `toCustomer` and `emailTemplate` hints; your mailer must send the actual confirmation (ticket ID + “we’re reviewing”). Customers never sign into the desk; follow-up is **email only**.

3. **Authentication (v1)** — **Not** enterprise SSO inside this module:
   - `auth/supportDeskSession.js` + `RequireSupportDeskSession.jsx` gate all desk routes except `login` and `auth/verify`.
   - **Magic link (simulated):** user enters work email → if `VITE_SUPPORT_DESK_MAGIC_SECRET` (8+ chars) is set, a signed URL is shown (production: mail this URL via your webhook/mailer). Opening `auth/verify` sets a **sessionStorage** session.
   - **Domain allowlist:** `VITE_SUPPORT_DESK_ALLOWED_EMAIL_DOMAINS` (comma-separated, e.g. `daikincomfort.com,daikin.com`).
   - **Dev only:** `VITE_SUPPORT_DESK_AUTH_DEV_ANY_EMAIL=true` allows any valid email when domains are empty (local demos); do not enable in production.
   - **SSO later:** keep global `RequireAuth` (MSAL/backend) as the org shell; this desk session is an **additional** internal layer you can replace with JWT from the same IdP later without changing ticket APIs.

4. **Workflow** — Notify → open app from link → review AI → edit/approve response → close. Lighter than Jira; no SLAs in v1.

## Routes

- **`/support/request`** — **public** customer ticket form (no account). Collects email, product, description, optional attachment; creates a ticket with `source: customer_web` and triggers internal `ticket.created` plus customer `ticket.customer_confirmation` when webhook is set. Same `SitePasswordGate` as the rest of the site if `VITE_SITE_PASSWORD` is configured.
- `/internal/support-desk/login` — email sign-in (magic link or dev trust)
- `/internal/support-desk/auth/verify` — consume magic link token
- `/internal/support-desk` → redirects to `…/tickets` (after session)
- `/internal/support-desk/tickets` — list + filters
- `/internal/support-desk/tickets/new` — intake form (runs triage on submit)
- `/internal/support-desk/tickets/:ticketId` — detail, assignment, AI panel, draft editor, lifecycle actions
- `/internal/support-desk/knowledge` — doc list + add (local)
- `/internal/support-desk/analytics` — volume, gaps, distributions

Nav: **Support ▾ → Internal · Support desk** → sign-in (visible when support nav is on).

## Data model

Canonical enums and helpers: `model/types.js` (`TicketStatus`, `SupportProduct`, `IssueCategory`, `TicketSource`, `nextTicketId`).

**Ticket (persisted JSON)**

| Field | Purpose |
|--------|---------|
| `id` | `SC-YYYY-#####` |
| `createdAt` | ISO timestamp |
| `issueDescription` | Free text |
| `product` | Reporter-selected product |
| `issueCategory` | Effective category (AI, then human) |
| `issueCategoryConfidence` | 0..1 |
| `status` | `new` → `in_review` → `responded` → `closed` |
| `owner` | Optional assignee string |
| `source` | `web` \| `email` \| `internal` \| `customer_web` (public form) |
| `customerEmail` | Set for `customer_web` intake — reply channel for agents |
| `customerAttachments` | Optional array `{ filename, mimeType, sizeBytes, dataUrl }` (v1 demo: stored in localStorage; cap size in UI; production should ingest server-side) |
| `aiAnalysis` | Classification + similar ids + doc ids + gap flag |
| `draftResponse` | AI suggestion (`text`, `generatedAt`, `sourcesUsed[]`) |
| `finalResponse` | Human-approved text (`editedFromDraft`) |
| `humanCategoryOverride` | Optional audit field when category corrected |
| `firstResponseAt`, `closedAt` | Simple SLA-free timing |
| `reopenedCount` | Integer |
| `assignedAt` | ISO when `owner` last set to a new non-empty value |

**Knowledge doc**

| Field | Purpose |
|--------|---------|
| `id` | Stable id |
| `title`, `product`, `bodyMarkdown` | Chunk for grounding |

Resolved tickets are **implicitly** part of the knowledge corpus for similarity (see `mockTriage.js`); a future server can index `finalResponse` + issue text into the same vector store as docs.

## API surface (`api/supportDeskApi.js`)

Designed to map 1:1 to REST later:

| Method | Role |
|--------|------|
| `listTickets({ status, product, q })` | Filtered list |
| `getTicket(id)` | Ticket + doc library for citations |
| `createTicket({ issueDescription, product, source, owner, customerEmail?, customerAttachments? })` | Persist + run triage; `customer_web` requires `customerEmail` |
| `updateTicket(id, patch)` | Status, responses, overrides |
| `regenerateDraft(id)` | Re-run triage/draft |
| `listKnowledgeDocs()` | All chunks |
| `addKnowledgeDoc({ title, product, bodyMarkdown })` | Extend KB |
| `analyticsSnapshot()` | Aggregates for dashboard |

**v1 storage:** `storage/localTicketStore.js` → `localStorage` key `skyportcare-support-desk:v1`.

## AI orchestration

**Prompt contracts (human/LLM):** `ai/promptTemplates.js`

- `CLASSIFICATION_SYSTEM_PROMPT` + `classificationUserPrompt(...)`
- `RESPONSE_DRAFT_SYSTEM_PROMPT` + `responseDraftUserPrompt(..., contextBlocks)`
- `embeddingQueryForTicket(ticket)` — text for your embedder

**Demo “AI”:** `ai/mockTriage.js` — deterministic keyword triage + Jaccard similarity over tickets/docs. Replace with:

1. Embed `embeddingQueryForTicket`
2. Retrieve top-k docs + resolved tickets
3. Call LLM with prompts above → parse JSON
4. Write `aiAnalysis` + `draftResponse` (never auto-send)

**Human vs AI boundary**

- **AI suggests:** `aiAnalysis`, `draftResponse`, linked ids
- **Human commits:** `finalResponse`, status changes, `humanCategoryOverride` / edited category

The UI states this explicitly on the ticket detail page.

## Non-goals (honored in v1)

No sprints, deep RBAC, customer portal, approvals, or Jira/CRM integrations — see product brief in the original spec.

## Extension checklist

- [ ] Move `supportDeskApi` to fetch(`/api/...`) + auth
- [ ] **Server-issued magic links** (short-lived JWT) — stop embedding `VITE_SUPPORT_DESK_MAGIC_SECRET` in the client bundle for production
- [ ] Postgres / Dynamo models mirroring the ticket shape
- [ ] Background worker: email ingestion → `createTicket`; same worker sends `ticket.created` / `ticket.assigned` mail
- [ ] Vector DB for docs + resolved tickets; store citation ids on `draftResponse`
- [ ] PM read-only: gate routes by role; analytics API read replica

## Environment variables

See root `.env.example` (Support desk block): allowlist domains, magic secret, optional webhook URL, owner inboxes for payload metadata, dev-only trust flag.
