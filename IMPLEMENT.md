# SpendLens — Implementation Guide

> How a cold audit request becomes a shareable savings report, end to end.

---

## Stack Decision

| Layer | Choice | Reason |
|---|---|---|
| Frontend | React + Vite + Tailwind CSS | Fast dev server, you control the bundle, no framework overhead |
| State / Persistence | Zustand + localStorage | Form state survives page reloads without a backend call |
| Backend | Node.js + Express | Thin, fast, MERN-native |
| Database | Supabase (Postgres) | Free tier, real relational DB, REST + Realtime out of the box |
| AI Summary | Anthropic API (claude-sonnet-4) | Required by brief; graceful fallback if it fails |
| Email | Resend | Simplest free-tier transactional email; one npm package |
| Hosting | Vercel (frontend) + Render (backend) | Both have generous free tiers and one-command deploy |
| Shareable URLs | UUID v4 stored in Supabase | No auth needed, strips PII on read |

---

## Repository Structure

```
spendlens/
├── client/                          # React + Vite frontend
│   ├── public/
│   ├── index.html                   # OG tags injected here for share pages
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                  # Routes: / | /audit/:uuid | /share/:uuid
│       ├── store/
│       │   └── formStore.js         # Zustand store — persisted to localStorage
│       ├── pages/
│       │   ├── Home.jsx             # Landing + multi-step form
│       │   ├── Audit.jsx            # Results page (private, full detail)
│       │   └── Share.jsx            # Public stripped result + OG tags
│       ├── components/
│       │   ├── SpendForm/
│       │   │   ├── Step1_Context.jsx     # Team size + use case
│       │   │   ├── Step2_Tools.jsx       # Add tools, plan, seats, spend
│       │   │   └── Step3_Review.jsx      # Summary before submit
│       │   ├── AuditCard.jsx            # Per-tool result card
│       │   ├── HeroSavings.jsx          # Big monthly + annual number
│       │   ├── AISummary.jsx            # 100-word Anthropic-generated paragraph
│       │   ├── LeadCapture.jsx          # Email gate modal (shown after results)
│       │   └── CredexCTA.jsx            # Shown only when savings > $500/mo
│       └── lib/
│           └── api.js               # Fetch wrappers for backend calls
│
├── server/                          # Express backend
│   ├── index.js                     # Entry point, middleware, route registration
│   ├── routes/
│   │   ├── audit.js                 # POST /api/audit
│   │   ├── leads.js                 # POST /api/leads
│   │   └── share.js                 # GET /api/share/:uuid
│   ├── engine/
│   │   ├── rules.js                 # Core audit logic — hardcoded if/else
│   │   └── pricing.js               # All pricing constants with source comments
│   ├── ai/
│   │   └── summary.js               # Anthropic API call + templated fallback
│   └── email/
│       └── sender.js                # Resend integration
│
├── tests/
│   └── engine.test.js               # Jest tests for audit engine (5+ required)
│
├── .github/
│   └── workflows/
│       └── ci.yml                   # Lint + test on push to main
│
├── PRICING_DATA.md
├── PROMPTS.md
├── OVERVIEW.md
└── IMPLEMENT.md
```

---

## Phase 1 — Pricing Data + Audit Engine

**This is the product. Build it first.**

### Step 1: `pricing.js`

Define a constant for every supported tool, every plan, and its current monthly cost per seat. Each entry gets a source comment.

```js
// server/engine/pricing.js

export const PRICING = {
  cursor: {
    hobby:      { perSeat: 0,   name: "Hobby" },
    pro:        { perSeat: 20,  name: "Pro" },
    business:   { perSeat: 40,  name: "Business" },
    enterprise: { perSeat: null, name: "Enterprise" }, // custom pricing
  },
  github_copilot: {
    individual: { perSeat: 10,  name: "Individual" },
    business:   { perSeat: 19,  name: "Business" },
    enterprise: { perSeat: 39,  name: "Enterprise" },
  },
  claude: {
    free:       { perSeat: 0,   name: "Free" },
    pro:        { perSeat: 20,  name: "Pro" },
    max:        { perSeat: 100, name: "Max" },
    team:       { perSeat: 30,  name: "Team" },
    enterprise: { perSeat: null, name: "Enterprise" },
    api:        { perSeat: null, name: "API Direct" },
  },
  // ... chatgpt, gemini, windsurf, etc.
};
```

**Verify every number against the official pricing page this week. Log the URL and date in `PRICING_DATA.md`.**

---

### Step 2: `rules.js`

The audit engine is pure JavaScript logic. For each tool + plan the user inputs, it returns a recommendation object. No AI. No guesswork. Deterministic.

```js
// server/engine/rules.js

export function auditTool({ tool, plan, seats, monthlySpend, useCase, teamSize }) {
  const current = PRICING[tool][plan];
  const result = {
    tool,
    plan,
    seats,
    monthlySpend,
    currentSpendCalculated: current.perSeat * seats,
    recommendation: null,
    savings: 0,
    reason: "",
    flag: "ok", // ok | downgrade | switch | credits
  };

  // Rule 1: Plan-fit check (too many seats for the plan tier)
  // Rule 2: Cheaper plan from same vendor
  // Rule 3: Alternative tool for use case
  // Rule 4: Credits opportunity (spend > $200/mo threshold)

  return result;
}

export function runAudit({ tools, teamSize, useCase }) {
  const results = tools.map(t => auditTool({ ...t, teamSize, useCase }));
  const totalMonthlySavings = results.reduce((sum, r) => sum + r.savings, 0);
  const totalAnnualSavings = totalMonthlySavings * 12;
  return { results, totalMonthlySavings, totalAnnualSavings };
}
```

**Example rule — GitHub Copilot seat-fit:**
```js
if (tool === "github_copilot" && plan === "business" && seats <= 3) {
  result.recommendation = "individual";
  result.savings = (PRICING.github_copilot.business.perSeat - PRICING.github_copilot.individual.perSeat) * seats;
  result.reason = `Individual plan ($10/seat) covers solo and small team usage. Business features (policy controls, audit logs) are unnecessary for teams under 4.`;
  result.flag = "downgrade";
}
```

Every rule follows this pattern: specific condition → specific recommendation → specific dollar figure → one defensible sentence.

---

## Phase 2 — Backend (Express + Supabase)

### Supabase Schema

```sql
-- audits table
create table audits (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  tools jsonb not null,
  team_size int,
  use_case text,
  audit_results jsonb not null,
  total_monthly_savings numeric,
  total_annual_savings numeric,
  ai_summary text,
  email text,           -- null until lead captured
  company text,
  role text,
  lead_captured boolean default false
);
```

### `POST /api/audit`

1. Validate input (express-validator)
2. Check rate limit (express-rate-limit: 5 requests / IP / hour)
3. Check honeypot field (if `website` field is populated → bot, reject silently)
4. Run `runAudit()` from rules engine
5. Call `generateSummary()` from Anthropic integration
6. Save to Supabase, get back UUID
7. Return: `{ uuid, results, totalMonthlySavings, totalAnnualSavings, aiSummary }`

### `POST /api/leads`

1. Validate email (basic format check)
2. Update Supabase row by UUID: set email, company, role, lead_captured = true
3. Flag in DB if totalMonthlySavings > 500 (for Credex follow-up)
4. Send transactional email via Resend
5. Return: `{ success: true }`

### `GET /api/share/:uuid`

1. Fetch audit by UUID from Supabase
2. Strip PII: remove email, company, role
3. Return tools + savings numbers only
4. Frontend uses this to render the public share page with OG tags

---

## Phase 3 — Frontend

### Form State (Zustand)

```js
// src/store/formStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useFormStore = create(persist(
  (set) => ({
    step: 1,
    teamSize: null,
    useCase: null,
    tools: [],          // [{ tool, plan, seats, monthlySpend }]
    setStep: (step) => set({ step }),
    setContext: (teamSize, useCase) => set({ teamSize, useCase }),
    addTool: (tool) => set((s) => ({ tools: [...s.tools, tool] })),
    removeTool: (index) => set((s) => ({ tools: s.tools.filter((_, i) => i !== index) })),
    reset: () => set({ step: 1, teamSize: null, useCase: null, tools: [] }),
  }),
  { name: 'spendlens-form' }  // key in localStorage
))
```

### Multi-Step Form Flow

```
Step 1: Context
  ├── "How big is your team?" (dropdown: 1, 2–5, 6–15, 16–50, 50+)
  └── "Primary use case?" (coding / writing / research / data / mixed)

Step 2: Add Tools
  ├── Select tool (dropdown of 8 supported tools)
  ├── Select plan (dynamic — options change based on tool selected)
  ├── Number of seats (number input)
  ├── Monthly spend $ (number input — what they actually pay)
  └── [+ Add Another Tool] button

Step 3: Review
  ├── Summary of all added tools with totals
  ├── [Run Audit →] button
  └── Calls POST /api/audit on submit
```

### Results Page Components

**`HeroSavings.jsx`**
- Large font monthly savings + annual savings
- Color coded: green for meaningful savings, neutral for already-optimal
- This is what gets screenshotted — make it visually clean

**`AuditCard.jsx`** (one per tool)
- Tool name + current plan
- Current monthly spend
- → Arrow to recommended action
- Savings amount (bold)
- One-line reason (muted text)
- Flag badge: DOWNGRADE / SWITCH / CREDITS / OPTIMAL

**`AISummary.jsx`**
- 100-word paragraph from Anthropic API
- Show skeleton loader while fetching
- Falls back to templated string if API fails

**`LeadCapture.jsx`**
- Modal — appears after user has seen results for 3+ seconds OR on scroll past 60%
- Fields: Email (required), Company (optional), Role (optional)
- CTA: "Email me this report"
- Never appears before results are shown

**`CredexCTA.jsx`**
- Only renders when `totalMonthlySavings > 500`
- "You could save $X,XXX/year. Credex can get you the same tools at a lower price."
- [Book a Free Consultation →] button

---

## Phase 4 — AI Summary

```js
// server/ai/summary.js
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function generateSummary({ tools, totalMonthlySavings, useCase }) {
  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 200,
      messages: [{
        role: "user",
        content: buildPrompt({ tools, totalMonthlySavings, useCase })
      }]
    });
    return response.content[0].text;
  } catch (err) {
    console.error("Anthropic API failed:", err.message);
    return buildFallbackSummary({ tools, totalMonthlySavings });
  }
}

function buildFallbackSummary({ tools, totalMonthlySavings }) {
  if (totalMonthlySavings < 100) {
    return `Your AI tool stack is well-optimized. You're paying for the right plans at the right tier for your team size. Keep your current setup and revisit in 90 days as your usage grows.`;
  }
  return `Based on your current stack, SpendLens identified $${totalMonthlySavings.toFixed(0)}/month in potential savings across ${tools.length} tool${tools.length > 1 ? 's' : ''}. The biggest opportunity is plan rightsizing — you're paying for seat counts and feature tiers your team doesn't fully use. Implementing these recommendations could save $${(totalMonthlySavings * 12).toFixed(0)} annually.`;
}
```

**Full prompt lives in `PROMPTS.md`.** Key principles for the prompt:
- Give it the tool list, plan, seats, savings per tool, and use case
- Ask for exactly ~100 words
- Ask it to be specific, not generic
- Tell it to not manufacture savings if there are none

---

## Phase 5 — Shareable URL + Open Graph

### Backend: Strip PII on Share Route

```js
// server/routes/share.js
router.get('/:uuid', async (req, res) => {
  const { data } = await supabase
    .from('audits')
    .select('tools, audit_results, total_monthly_savings, total_annual_savings, ai_summary, use_case, team_size')
    // NOTE: deliberately NOT selecting email, company, role
    .eq('id', req.params.uuid)
    .single();

  res.json(data);
});
```

### Frontend: OG Tags on Share Page

On `/share/:uuid`, inject dynamic meta tags into `<head>` using React Helmet or via Vite's SSR-lite approach:

```html
<meta property="og:title" content="We found $1,240/mo in AI tool savings 🔍" />
<meta property="og:description" content="Free AI spend audit — see where your stack is overpaying. Takes 3 minutes." />
<meta property="og:url" content="https://spendlens.app/share/[uuid]" />
<meta name="twitter:card" content="summary_large_image" />
```

The savings number in the OG title is pulled dynamically from the audit result — this is what makes the share link interesting enough to click.

---

## Phase 6 — Tests

```js
// tests/engine.test.js (Jest)

// Test 1: Small team on Copilot Business should flag downgrade
// Test 2: Two overlapping coding tools should surface redundancy
// Test 3: User with optimal spend should return savings = 0
// Test 4: High spender (>$500/mo) should return flag for credits
// Test 5: Enterprise plan (null perSeat) should not crash the engine
// Test 6: Annual savings = monthly savings × 12 exactly
// Test 7: Use case mismatch — Gemini Ultra for coding should suggest Cursor
```

Run with: `npm test` from root.

---

## Phase 7 — CI/CD

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
        working-directory: server
      - run: npm run lint
        working-directory: server
      - run: npm test
        working-directory: server
```

---

## Abuse Protection

**Choice: Honeypot + Rate Limiting**

- **Honeypot:** A hidden `<input name="website">` field in the form. Real users never fill it. If the server receives a non-empty `website` field, the request is silently rejected (return 200 with fake success — don't tip off the bot).
- **Rate limiting:** `express-rate-limit` set to 5 audit requests per IP per hour. This allows genuine use while blocking scraping.

**Why not hCaptcha:** CAPTCHA adds friction before value is delivered — which hurts the conversion rate on the main flow. Honeypot is invisible to real users and catches the vast majority of automated submissions.

---

## Environment Variables

```bash
# server/.env
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
ANTHROPIC_API_KEY=
RESEND_API_KEY=
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX=5

# client/.env
VITE_API_BASE_URL=https://your-render-backend.onrender.com
```

---

## Deployment

### Frontend → Vercel
```bash
cd client
vercel --prod
# Set VITE_API_BASE_URL in Vercel dashboard
```

### Backend → Render
- New Web Service → connect GitHub repo
- Root directory: `server`
- Build command: `npm install`
- Start command: `node index.js`
- Add all env vars in Render dashboard

---

## 7-Day Build Schedule

| Day | Focus | Git Commits |
|---|---|---|
| Day 1 | Research + `pricing.js` + `rules.js` (engine) | `feat: add pricing constants for all 8 tools`, `feat: implement audit engine core rules` |
| Day 2 | Supabase schema + Express routes (audit, leads, share) | `feat: add supabase schema`, `feat: implement POST /api/audit route` |
| Day 3 | Frontend form — Zustand store, Step 1 + Step 2 | `feat: add zustand form store with localStorage persistence`, `feat: build tool selection form step` |
| Day 4 | Frontend results page — HeroSavings, AuditCard, CredexCTA | `feat: build audit results page components`, `feat: add credex CTA for high-savings audits` |
| Day 5 | AI summary integration + fallback + LeadCapture + Resend email | `feat: integrate anthropic API for audit summary`, `feat: add lead capture modal and resend email` |
| Day 6 | Shareable URL + OG tags + tests + CI | `feat: shareable public audit URL with PII stripped`, `test: add 7 engine unit tests`, `ci: add github actions workflow` |
| Day 7 | All docs (PRICING_DATA, PROMPTS, GTM, ECONOMICS, LANDING_COPY, METRICS, ARCHITECTURE, README), polish, deploy | `docs: add all required project documentation`, `chore: deploy to vercel and render` |

---

## Key Decisions Summary

| Decision | Choice | Why |
|---|---|---|
| Audit logic | Hardcoded rules, not AI | Deterministic math should not be non-deterministic. AI is wrong sometimes; savings calculations cannot be. |
| Email gate | After results, never before | Users must see value first. Gating before results would crater completion rate. |
| Abuse protection | Honeypot + rate limit | No CAPTCHA friction on the main path. Most bots are caught by honeypot alone. |
| Shareable URL | UUID, PII stripped server-side | Public URLs must be safe to share. Stripping PII on the read route is simpler and more reliable than client-side filtering. |
| State persistence | Zustand + localStorage | Users abandon multi-step forms. Persistence is table stakes. |
| Database | Supabase over MongoDB | This data is relational. Audits have leads. Postgres is the right tool. |
