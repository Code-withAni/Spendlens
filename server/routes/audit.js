const express = require('express');
const router = express.Router();
const { runAudit } = require('../engine/rules');
const { generateSummary } = require('../ai/summary');
const supabase = require('../lib/supabase');

router.post('/', async (req, res) => {
  try {
    const { tools, teamSize, useCase } = req.body;

    console.log('Audit request received:', { tools, teamSize, useCase });

    if (!tools || !Array.isArray(tools)) {
      return res.status(400).json({ error: 'Tools array is required' });
    }

    // 1. Run Audit Engine
    console.log('Running audit engine...');
    const auditResults = runAudit({ tools, teamSize, useCase });
    console.log('Audit engine completed:', auditResults);

    // 2. Generate AI Summary
    console.log('Generating AI summary...');
    const aiSummary = await generateSummary({ 
      tools, 
      auditResults: auditResults.results,
      totalMonthlySavings: auditResults.totalMonthlySavings,
      totalAnnualSavings: auditResults.totalAnnualSavings,
      teamSize,
      useCase
    });
    console.log('AI summary generated:', aiSummary);

    // 3. Save to Supabase
    console.log('Saving to Supabase...');
    const { data, error } = await supabase
      .from('audits')
      .insert([
        {
          tools,
          team_size: teamSize,
          use_case: useCase,
          audit_results: auditResults.results,
          total_monthly_savings: auditResults.totalMonthlySavings,
          total_annual_savings: auditResults.totalAnnualSavings,
          ai_summary: aiSummary
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      // Even if DB fails, return results to user for UX with a temporary UUID
      const tempUuid = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return res.json({ 
        ...auditResults, 
        aiSummary, 
        uuid: tempUuid,
        warning: 'Results generated but not saved to database',
        error: error.message
      });
    }

    console.log('Audit saved successfully with UUID:', data.id);
    res.json({
      uuid: data.id,
      ...auditResults,
      aiSummary
    });

  } catch (err) {
    console.error('Audit route error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

module.exports = router;
