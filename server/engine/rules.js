// server/engine/rules.js
const { PRICING } = require('./pricing');

function auditTool({ tool, plan, seats, monthlySpend }) {
  const toolPricing  = PRICING[tool];
  const currentPlan  = toolPricing ? toolPricing[plan] : null;
  const spendNum     = parseFloat(monthlySpend) || 0;

  const result = {
    tool,
    plan,
    seats,
    monthlySpend: spendNum,
    currentSpendCalculated: currentPlan && currentPlan.perSeat !== null
      ? currentPlan.perSeat * seats
      : spendNum,
    recommendation: null,
    recommendedPlan: null,
    savings: 0,
    reason: "",
    flag: "ok",
  };

  if (!toolPricing || !currentPlan) return result;

  // ── Rule 1: GitHub Copilot Business → Individual (small teams) ──────────
  if (tool === "github_copilot" && plan === "business" && seats <= 3 && result.flag === "ok") {
    const diff = PRICING.github_copilot.business.perSeat - PRICING.github_copilot.individual.perSeat;
    result.flag            = "downgrade";
    result.recommendation  = `Downgrade to GitHub Copilot Individual ($10/seat)`;
    result.recommendedPlan = "individual";
    result.savings         = diff * seats;
    result.reason          = `Individual plan covers all core coding features. Business tier adds policy controls and audit logs — only necessary for compliance-driven teams of 4+.`;
  }

  // ── Rule 2: Cursor Business → Pro (small teams) ──────────────────────────
  if (tool === "cursor" && plan === "business" && seats <= 2 && result.flag === "ok") {
    const diff = PRICING.cursor.business.perSeat - PRICING.cursor.pro.perSeat;
    result.flag            = "downgrade";
    result.recommendation  = `Downgrade to Cursor Pro ($20/seat)`;
    result.recommendedPlan = "pro";
    result.savings         = diff * seats;
    result.reason          = `Pro includes unlimited completions and fast requests. Business adds SSO and admin controls — overkill for 1–2 person teams.`;
  }

  // ── Rule 3: Claude Team minimum seat trap ───────────────────────────────
  if (tool === "claude" && plan === "team" && seats < 5 && result.flag === "ok") {
    const ghostSeats = 5 - seats;
    result.flag            = "downgrade";
    result.recommendation  = `Switch to Claude Pro per user ($20/seat)`;
    result.recommendedPlan = "pro";
    result.savings         = ghostSeats * PRICING.claude.team.perSeat;
    result.reason          = `Claude Team has a 5-seat minimum. With ${seats} active seat(s), you're effectively paying for ${ghostSeats} unused seat(s) at $30/each.`;
  }

  // ── Rule 4: Claude Max → Pro (unless hitting limits) ────────────────────
  if (tool === "claude" && plan === "max" && result.flag === "ok") {
    const diff = PRICING.claude.max.perSeat - PRICING.claude.pro.perSeat;
    result.flag            = "downgrade";
    result.recommendation  = `Evaluate switching to Claude Pro ($20/seat)`;
    result.recommendedPlan = "pro";
    result.savings         = diff * seats;
    result.reason          = `Claude Max provides 5× usage limits over Pro. This is only cost-effective if users consistently hit Pro's daily limits. If not, you're paying $80/seat/mo for unused capacity.`;
  }

  // ── Rule 5: ChatGPT Team for solo user ──────────────────────────────────
  if (tool === "chatgpt" && plan === "team" && seats === 1 && result.flag === "ok") {
    const diff = PRICING.chatgpt.team.perSeat - PRICING.chatgpt.plus.perSeat;
    result.flag            = "downgrade";
    result.recommendation  = `Switch to ChatGPT Plus ($20/seat)`;
    result.recommendedPlan = "plus";
    result.savings         = diff;
    result.reason          = `ChatGPT Team is built for shared workspaces and admin controls. A single user gets identical GPT-4o access on Plus at $10/seat less.`;
  }

  // ── Rule 6: High spend → Credits opportunity ─────────────────────────────
  if (spendNum >= 200 && result.flag === "ok") {
    result.flag           = "credits";
    result.recommendation = `Explore Credex discounted credits for this tool`;
    result.savings        = Math.max(0, Math.round(spendNum * 0.2));
    result.reason         = `At $${spendNum}/mo, discounted AI credits via Credex could reduce this bill by ~20% with no plan or workflow changes.`;
  }

  return result;
}

function runAudit({ tools, teamSize, useCase }) {
  let results = tools.map(t => auditTool({ ...t, teamSize, useCase, allTools: tools }));

  // ── Global Rule A: Cursor + GitHub Copilot overlap ───────────────────────
  const hasCursor   = results.some(r => r.tool === "cursor");
  const copilotIdx  = results.findIndex(r => r.tool === "github_copilot");

  if (hasCursor && copilotIdx !== -1) {
    const copilot          = results[copilotIdx];
    // Always flag copilot as redundant when cursor is present — overrides downgrade
    copilot.flag           = "redundant";
    copilot.recommendation = "Consider cancelling GitHub Copilot";
    copilot.savings        = copilot.monthlySpend;
    copilot.reason         = `Cursor includes high-performance autocomplete and AI chat. Running GitHub Copilot alongside it duplicates ~80% of functionality. Most teams that switch to Cursor drop Copilot within 30 days.`;
  }

  // ── Global Rule B: Cursor + Windsurf overlap ─────────────────────────────
  const hasWindsurf = results.some(r => r.tool === "windsurf");
  const cursorIdx   = results.findIndex(r => r.tool === "cursor");

  if (hasWindsurf && cursorIdx !== -1) {
    const cursor           = results[cursorIdx];
    cursor.flag            = "redundant";
    cursor.recommendation  = "Drop one — Cursor or Windsurf";
    cursor.savings         = cursor.monthlySpend;
    cursor.reason        = `Cursor and Windsurf are near-identical AI code editors. Running both is paying twice for the same core capability. Pick the one your team prefers and cancel the other.`;
  }

  const totalMonthlySavings = results.reduce((sum, r) => sum + r.savings, 0);
  const totalAnnualSavings  = totalMonthlySavings * 12;

  return { results, totalMonthlySavings, totalAnnualSavings };
}

module.exports = { runAudit, auditTool };