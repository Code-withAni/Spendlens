require('dotenv').config();
const express = require('express');
const cors = require('cors');
const supabase = require('./lib/supabase');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:4173'],
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// ── Supabase connection check on startup ─────────────────────────────────
async function checkSupabaseConnection() {
  console.log('\n🔌 Checking Supabase connection...');
  console.log('   URL:', process.env.SUPABASE_URL || '❌ NOT SET');
  console.log('   Key:', process.env.SUPABASE_SERVICE_KEY 
    ? `✅ Set (starts with: ${process.env.SUPABASE_SERVICE_KEY.substring(0, 10)}...)` 
    : '❌ NOT SET');

  try {
    const { data, error } = await supabase.from('audits').select('count').limit(1);
    if (error) {
      console.log('   Status: ❌ FAILED -', error.message);
      console.log('   Hint:', error.hint || 'Check your SUPABASE_SERVICE_KEY and table exists');
    } else {
      console.log('   Status: ✅ CONNECTED - audits table found');
    }
  } catch (err) {
    console.log('   Status: ❌ ERROR -', err.message);
  }
  console.log('');
}

// Basic health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test Supabase connection on demand
app.get('/test-supabase', async (req, res) => {
  console.log('\n🔌 Manual Supabase test triggered...');
  try {
    const { data, error } = await supabase.from('audits').select('count').limit(1);

    if (error) {
      console.log('   ❌ FAILED:', error.message);
      return res.status(500).json({ 
        status: '❌ disconnected', 
        message: error.message,
        hint: error.hint || 'Check your SUPABASE_SERVICE_KEY and that the audits table exists',
        code: error.code
      });
    }

    console.log('   ✅ CONNECTED');
    res.json({ 
      status: '✅ connected', 
      message: 'Supabase is working correctly',
    });
  } catch (err) {
    console.log('   ❌ ERROR:', err.message);
    res.status(500).json({ status: '❌ error', message: err.message });
  }
});

// Routes
app.use('/api/audit', require('./routes/audit'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/share', require('./routes/share'));

const server = app.listen(PORT,'0.0.0.0' ,async () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  await checkSupabaseConnection();
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please try a different port.`);
  } else {
    console.error('Server error:', err.message);
  }
  process.exit(1);
});
