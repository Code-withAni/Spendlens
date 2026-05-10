# SpendLens Architecture

## Overview
SpendLens is a decoupled MERN-style application (React + Node/Express + Postgres) designed for high performance and scalability.

## Data Flow
1. **Input:** User provides team context and tool data through a multi-step React form.
2. **Analysis:** The `server/engine/rules.js` processes the data deterministically using hardcoded pricing and logic.
3. **AI Layer:** The audit results are passed to Claude 3.5 Sonnet to generate a natural language summary.
4. **Persistence:** Audit data is stored in Supabase (Postgres).
5. **Reporting:** A unique UUID is returned, allowing the user to view their private results or share a public (PII-stripped) version.

## Core Components

### Audit Engine (`server/engine`)
The heart of the product. It avoids "black-box" AI for math, ensuring that every dollar of identified savings is defensible and traceable to specific vendor pricing rules.

### State Management (`client/src/store`)
Uses Zustand with `localStorage` persistence. This is critical for the multi-step form experience, ensuring users don't lose progress if they navigate away.

### Lead Generation Flow
Once results are shown, the `LeadCapture` component triggers a POST request to `/api/leads`. This updates the database and triggers a transactional email via Resend, closing the loop.

## Security & Privacy
- **PII Stripping:** The `/api/share/:uuid` route explicitly selects only non-identifying fields.
- **Abuse Protection:** Implements rate limiting on the audit endpoint and a honeypot field on the client.
- **No Login:** Designed for maximum conversion; state is managed via unique URLs and local storage rather than traditional authentication.
