const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendAuditReport({ email, totalMonthlySavings, totalAnnualSavings, auditResults, uuid, highSavings }) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your_resend_api_key') {
    console.warn('Resend API key missing, skipping email.');
    return;
  }

  const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const reportUrl = `${baseUrl}/share/${uuid}`;

  const hasSavings = totalMonthlySavings > 0;
  const subject = hasSavings
    ? `Your AI Spend Audit — $${totalMonthlySavings}/mo in potential savings found`
    : `Your AI Spend Audit — your stack is optimized`;

  try {
    console.log(`[EMAIL] Attempting to send audit report to ${email}...`);

    const { data, error } = await resend.emails.send({
      from: 'SpendLens <onboarding@resend.dev>',
      to: [email],
      subject,
      html: buildEmailHtml({
        totalMonthlySavings,
        totalAnnualSavings,
        auditResults,
        reportUrl,
        highSavings,
      }),
    });

    if (error) {
      console.error('[EMAIL] Resend returned an error:', error);
      return;
    }

    // ← confirmation log — you'll see this in the server terminal on success
    console.log(`[EMAIL] Sent successfully! Resend ID: ${data.id}`);
    console.log(`[EMAIL] Delivered to: ${email}`);
    console.log(`[EMAIL] Subject: ${subject}`);

    return data;

  } catch (err) {
    console.error('[EMAIL] Failed to send:', err.message);
  }
}

function buildEmailHtml({ totalMonthlySavings, totalAnnualSavings, auditResults, reportUrl, highSavings }) {
  const hasSavings = totalMonthlySavings > 0;

  const toolRows = auditResults.map(r => `
    <tr>
      <td style="padding:10px 0; border-bottom:1px solid #f3f4f6; font-weight:600; text-transform:capitalize;">
        ${r.tool.replace(/_/g, ' ')}
      </td>
      <td style="padding:10px 0; border-bottom:1px solid #f3f4f6; color:#6b7280; font-size:13px;">
        ${r.plan} · ${r.seats} seat${r.seats > 1 ? 's' : ''}
      </td>
      <td style="padding:10px 0; border-bottom:1px solid #f3f4f6; text-align:right; font-weight:700; color:${r.savings > 0 ? '#059669' : '#6b7280'};">
        ${r.savings > 0 ? `-$${r.savings}/mo` : 'Optimal'}
      </td>
    </tr>
  `).join('');

  const credexBlock = highSavings ? `
    <div style="background:#4c1d95; border-radius:12px; padding:24px; margin:24px 0; text-align:center;">
      <p style="color:#e9d5ff; margin:0 0 8px; font-size:13px; text-transform:uppercase; letter-spacing:0.1em;">Unlock More Savings</p>
      <h3 style="color:white; margin:0 0 12px; font-size:20px;">Credex can reduce your bill further</h3>
      <p style="color:#c4b5fd; margin:0 0 20px; font-size:14px; line-height:1.6;">
        Credex sells discounted AI infrastructure credits — the same tools you're using, at a lower price.
        Based on your spend, you qualify for a savings consultation.
      </p>
      <a href="https://credex.ai" style="display:inline-block; background:white; color:#7c3aed; padding:12px 28px; border-radius:8px; font-weight:700; text-decoration:none;">
        Book Free Consultation →
      </a>
    </div>
  ` : '';

  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; max-width:600px; margin:0 auto; background:#fff; border-radius:16px; overflow:hidden; border:1px solid #e5e7eb;">

      <div style="background:#0d0d1a; padding:32px; text-align:center;">
        <div style="display:inline-block; width:40px; height:40px; background:#7c3aed; border-radius:10px; line-height:40px; color:white; font-weight:900; font-size:18px; margin-bottom:12px;">S</div>
        <h1 style="color:white; margin:0; font-size:22px; font-weight:900; letter-spacing:-0.5px;">SpendLens Audit Report</h1>
      </div>

      <div style="padding:32px; text-align:center; background:${hasSavings ? '#f0fdf4' : '#f9fafb'}; border-bottom:1px solid #e5e7eb;">
        <p style="margin:0 0 4px; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:${hasSavings ? '#059669' : '#6b7280'};">
          ${hasSavings ? 'Savings Found' : 'Stack Optimized'}
        </p>
        <p style="margin:0; font-size:52px; font-weight:900; color:${hasSavings ? '#059669' : '#111827'}; line-height:1;">
          $${totalMonthlySavings}<span style="font-size:20px; font-weight:600;">/mo</span>
        </p>
        ${hasSavings
          ? `<p style="margin:8px 0 0; color:#065f46; font-weight:700;">= $${totalAnnualSavings} reclaimed annually</p>`
          : `<p style="margin:8px 0 0; color:#6b7280;">You're paying exactly what you should be.</p>`
        }
      </div>

      <div style="padding:32px;">
        <h2 style="margin:0 0 16px; font-size:16px; font-weight:800; color:#111827;">Per-Tool Breakdown</h2>
        <table style="width:100%; border-collapse:collapse;">
          <thead>
            <tr>
              <th style="text-align:left; font-size:11px; text-transform:uppercase; color:#9ca3af; padding-bottom:8px;">Tool</th>
              <th style="text-align:left; font-size:11px; text-transform:uppercase; color:#9ca3af; padding-bottom:8px;">Plan</th>
              <th style="text-align:right; font-size:11px; text-transform:uppercase; color:#9ca3af; padding-bottom:8px;">Savings</th>
            </tr>
          </thead>
          <tbody>${toolRows}</tbody>
        </table>

        ${credexBlock}

        <div style="text-align:center; margin:28px 0 0;">
          <a href="${reportUrl}" style="display:inline-block; background:#7c3aed; color:white; padding:14px 32px; border-radius:10px; font-weight:800; text-decoration:none; font-size:15px;">
            View Full Interactive Report →
          </a>
        </div>
      </div>

      <div style="padding:20px 32px; background:#f9fafb; border-top:1px solid #e5e7eb; text-align:center;">
        <p style="margin:0; font-size:12px; color:#9ca3af;">
          Sent by SpendLens in partnership with <a href="https://credex.ai" style="color:#7c3aed;">Credex</a>.
          Your data is never sold or shared.
        </p>
      </div>
    </div>
  `;
}

module.exports = { sendAuditReport };