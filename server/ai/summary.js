// server/ai/summary.js

const OpenAI = require('openai');

// Client only instantiated if key exists
let client = null;
if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key') {
  client = new OpenAI({ apiKey: process.env.ANTHROPIC_API_KEY });
}

async function generateSummary({ tools, auditResults, totalMonthlySavings, totalAnnualSavings, teamSize, useCase }) {
  if (!client) {
    console.warn('API key missing — using fallback summary.');
    return buildFallbackSummary({ tools, totalMonthlySavings, totalAnnualSavings });
  }

  // Timeout so a slow API call never hangs the audit route
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('API timed out')), 8000)
  );

  try {
    const toolListText = tools
      .map(t => `- ${t.tool} (${t.plan}, ${t.seats} seats): $${t.monthlySpend}/mo`)
      .join('\n');

    const resultsText = auditResults
      .map(r => `- ${r.tool}: ${r.flag.toUpperCase()} — ${r.reason} (Savings: $${r.savings}/mo)`)
      .join('\n');

    const apiCall = client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 300,
      messages: [
        {
          // FIX: system message goes INSIDE the messages array, not at top level
          // This was the bug — OpenAI SDK silently ignores unknown top-level params
          role: 'system',
          content: 'You are a senior financial auditor specializing in SaaS and AI infrastructure spend for startups. Provide concise, high-signal audit summaries.',
        },
        {
          role: 'user',
          content: `Analyze the following AI tool stack audit for a team of ${teamSize} focused on ${useCase}.

Current Tools:
${toolListText}

Total Potential Monthly Savings: $${totalMonthlySavings}
Total Potential Annual Savings: $${totalAnnualSavings}

Audit Results:
${resultsText}

Instructions:
1. Provide a personalized summary of approximately 100 words.
2. Be specific about where the biggest savings are (plan downgrades, redundancy, or credits).
3. If savings are $0, congratulate them on a well-optimized stack and explain why it's efficient.
4. Do NOT manufacture savings that aren't in the audit results.
5. Format the output as a single paragraph of natural language.`,
        },
      ],
    });

    // Race API call against timeout — whichever resolves first wins
    const response = await Promise.race([apiCall, timeoutPromise]);

    // FIX: correct response path for OpenAI SDK
    return response.choices[0].message.content;

  } catch (err) {
    console.error('OpenAI API failed:', err.message);
    return buildFallbackSummary({ tools, totalMonthlySavings, totalAnnualSavings });
  }
}

function buildFallbackSummary({ tools, totalMonthlySavings, totalAnnualSavings }) {
  if (totalMonthlySavings < 1) {
    return `Your AI tool stack is exceptionally well-optimized. You've selected the appropriate plans and seat counts for your team size, with no redundant overlapping capabilities identified. We recommend maintaining this configuration and re-auditing in 90 days as your team or usage scales.`;
  }
  return `Based on your current stack, SpendLens identified $${totalMonthlySavings.toFixed(0)}/month in potential savings across ${tools.length} tool${tools.length > 1 ? 's' : ''}. The primary opportunity lies in plan rightsizing and eliminating redundancies — specifically where seat counts or feature tiers exceed your actual team requirements. Implementing these recommendations would result in $${totalAnnualSavings.toFixed(0)} in annual reclaimed budget.`;
}

module.exports = { generateSummary };