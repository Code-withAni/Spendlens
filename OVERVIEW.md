# SpendLens — Project Overview

> **"The free Mint for AI tool spend — built for startups that are overpaying and don't know it yet."**

---

## What Is SpendLens?

SpendLens is a free web application that audits what a startup or engineering team spends on AI tools — Cursor, Claude, ChatGPT, GitHub Copilot, Gemini, and others — and tells them exactly where they're overpaying, what to switch, and how much they'd save.

No login. No credit card. No fluff. A founder or engineering manager lands on the page, fills in their tools and spend in under 3 minutes, and walks away with a specific, defensible savings number and a recommended action for every tool on their stack.

SpendLens is built as a lead-generation asset for **Credex**, which sells discounted AI infrastructure credits sourced from companies that overforecast their usage. The audit surfaces real overspend — and for users with meaningful savings opportunities, Credex is the natural next step.

---

## The Problem

Startups pay for AI tools the way they pay for SaaS subscriptions in 2019 — on autopilot. They upgrade to the Team plan because one person asked, they keep GitHub Copilot running alongside Cursor because nobody cancelled it, and they pay ChatGPT Enterprise pricing because it seemed right at the time.

There is no benchmark. There is no second opinion. There is no "Mint for AI spend."

The result: most engineering teams are overpaying by 20–40% on tools they already have, through plan mismatches, seat bloat, and overlapping capability between tools they're running simultaneously.

---

## Who It's For

**Primary user:** An Engineering Manager or CTO at a 10–50 person startup, Series A stage, currently paying $1,500–$15,000/month across 3–6 AI tools, who has never formally audited their tool stack because it felt too small to justify the time.

**Secondary user:** A founder or finance lead who just saw the AI tools line item on the monthly burn report and wants to know if it's reasonable before the next board meeting.

**Not for:** Individual developers paying $20/month for a personal plan. The tool works for them but the savings are too small to be interesting.

---

## What the Product Does

### 1. Spend Input Form
A multi-step form where users input every AI tool they pay for: the vendor, plan tier, number of seats, and monthly spend. Also captures team size and primary use case (coding / writing / research / data / mixed). Form state persists across page reloads — if you close the tab and come back, your data is still there.

**Supported tools at launch:**
- Cursor (Hobby / Pro / Business / Enterprise)
- GitHub Copilot (Individual / Business / Enterprise)
- Claude — Anthropic (Free / Pro / Max / Team / Enterprise / API direct)
- ChatGPT — OpenAI (Plus / Team / Enterprise / API direct)
- Anthropic API direct
- OpenAI API direct
- Gemini (Pro / Ultra / API)
- Windsurf (Free / Pro / Teams)

### 2. Audit Engine
A hardcoded rules engine — deliberately not AI — that evaluates four things for each tool:
- Are they on the right plan for their team size and usage?
- Is there a cheaper plan from the same vendor that fits?
- Is there a substantially cheaper alternative for their use case?
- Are they paying retail pricing when discounted credits are available?

Every recommendation has a one-sentence defensible reason and a specific dollar figure. A finance person reading the output should nod, not squint.

### 3. Audit Results Page
The output page shows:
- A **hero block** with total monthly and annual savings, large and clear — this is what gets screenshotted
- A **per-tool breakdown**: current spend → recommended action → savings + one-line reason
- A **Credex CTA** for users with >$500/month in savings opportunity
- An honest "you're spending well" message for users already close to optimal — no manufactured savings
- An **AI-generated 100-word personalized summary** via the Anthropic API (with a templated fallback if the API fails)

### 4. Lead Capture
After results are shown — never before — an optional email gate appears. Users can enter their email, company name, and role to receive a copy of their audit. High-savings leads are flagged in the database for Credex follow-up. A transactional email is sent via Resend confirming receipt.

Abuse protection: honeypot field + IP-based rate limiting. No CAPTCHA friction on the main path.

### 5. Shareable Result URL
Every audit generates a unique public URL. Identifying details (email, company name) are stripped from the public version. The tools and savings numbers remain. Open Graph and Twitter Card meta tags are generated dynamically so the link renders cleanly when shared on X, LinkedIn, or in a Slack message.

This is the viral loop: someone shares their audit result, a cold visitor sees "$1,400/month in potential savings," and clicks through to run their own.

---

## Why This Works as a Credex Asset

The audit is genuinely useful whether or not the user ever buys from Credex. That's the point. A tool that helps people first earns the right to make an offer second.

For users surfacing >$500/month in savings, the Credex prompt is not an interruption — it's the logical next step. The audit has just proved the user is overpaying. Credex offers the same products at a lower price. The conversion is a natural conclusion of the audit, not a sales pitch bolted onto the end.

For users already spending optimally, SpendLens still captures their email with a "notify me when new optimizations apply to your stack" prompt — keeping them in the Credex pipeline for when their tool usage grows.

---

## The Name — SpendLens

Clear, functional, not trying too hard. "Lens" implies clarity and focus — you're looking at your spend through a magnifying glass for the first time. No AI buzzwords, no made-up portmanteau. It's the kind of name you can say out loud in a pitch and people immediately know what it does.

---

## What This Is Not

- It is not an AI-powered audit. The savings logic is hardcoded rules, which is correct — deterministic math should not be non-deterministic. AI is used only for the personalized summary paragraph, where natural language adds value.
- It is not a subscription product. It's a free tool with a single commercial outcome: warm leads for Credex.
- It is not opinionated about which AI tools are "better." It is opinionated about which plans and combinations make financial sense for a given team size and use case.

---

## Success Looks Like

A founder posts their SpendLens result on X. The OG preview shows "$1,200/month in potential savings." Three other founders in the replies click through. One of them books a Credex consultation. That loop, repeated, is the product working.

In measurable terms: **audits completed that surface >$500/month in savings** is the North Star. Everything — the form UX, the results page design, the shareable URL — is optimized to maximize that number.
