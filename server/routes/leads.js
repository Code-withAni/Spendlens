const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const { sendAuditReport } = require('../email/sender');

router.post('/', async (req, res) => {
  try {
    const { uuid, email, company, role } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!uuid || !email || !emailRegex.test(email)) {
      return res.status(400).json({ error: 'Valid UUID and email are required' });
    }

    // 1. Fetch audit data for the email
    const { data: audit, error: fetchError } = await supabase
      .from('audits')
      .select('*')
      .eq('id', uuid)
      .single();

    if (fetchError || !audit) {
      console.error('Fetch error:', fetchError);
      return res.status(404).json({ error: 'Audit not found' });
    }

    // 2. Update lead info
    const { error: updateError } = await supabase
      .from('audits')
      .update({ 
        email, 
        company, 
        role, 
        lead_captured: true 
      })
      .eq('id', uuid);

    if (updateError) {
      console.error('Supabase update error:', updateError);
      return res.status(500).json({ error: 'Failed to capture lead' });
    }

    // 3. Send email via Resend
   sendAuditReport({
  email,
  totalMonthlySavings: audit.total_monthly_savings,
  totalAnnualSavings:  audit.total_annual_savings,
  auditResults:        audit.audit_results,
  highSavings:         audit.high_savings,  // FIX: pass high_savings for Credex CTA
  uuid,
}).catch(err => console.error('Email send failed (non-fatal):', err.message));

   res.json({ success: true });

  } catch (err) {
    console.error('Leads route error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
