# SpendLens

> **"The free Mint for AI tool spend — built for startups that are overpaying and don't know it yet."**

SpendLens is a free web application that audits what a startup or engineering team spends on AI tools (Cursor, Claude, ChatGPT, GitHub Copilot, etc.) and tells them exactly where they're overpaying.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Zustand, Lucide React
- **Backend:** Node.js, Express, Supabase (Postgres)
- **AI:** Anthropic API (Claude 3.5 Sonnet)
- **Email:** Resend
- **Testing:** Jest

## Key Features

- **Multi-step Form:** Easy-to-use form to input your tool stack.
- **Rules Engine:** Deterministic audit logic for plan-fit and redundancy detection.
- **AI Summary:** Personalized 100-word analysis of your savings opportunities.
- **Shareable Reports:** Secure, PII-stripped public URLs for sharing results.
- **Lead Capture:** Integrated flow to receive PDF reports and Credex offers.

## Getting Started

### Prerequisites
- Node.js 20+
- Supabase Account
- Anthropic API Key
- Resend API Key

### Installation

1. Clone the repository
2. Set up environment variables in `server/.env` (see `.env.example`)
3. Install dependencies:
   ```bash
   # Server
   cd server
   npm install
   
   # Client
   cd client
   npm install
   ```
4. Run the development servers:
   ```bash
   # Server
   cd server
   npm start
   
   # Client
   cd client
   npm run dev
   ```

## Testing
Run the audit engine tests:
```bash
cd server
npm test
```

## Deployment
- **Frontend:** Deploy to Vercel.
- **Backend:** Deploy to Render or any Node.js host.
- **Database:** Supabase.
