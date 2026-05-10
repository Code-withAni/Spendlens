const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');

router.get('/:uuid', async (req, res) => {
  try {
    const { uuid } = req.params;

    const { data, error } = await supabase
      .from('audits')
      .select('tools, audit_results, total_monthly_savings, total_annual_savings, ai_summary, use_case, team_size, created_at')
      // NOTE: Deliberately NOT selecting email, company, role to protect PII
      .eq('id', uuid)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(404).json({ error: 'Audit not found' });
    }

    res.json(data);

  } catch (err) {
    console.error('Share route error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
