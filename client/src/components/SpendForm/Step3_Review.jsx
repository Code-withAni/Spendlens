import { useState, useEffect } from 'react';
import { useFormStore } from '../../store/formStore';
import { ChevronLeft, Loader2, BarChart2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Step3_Review = () => {
  const { tools, teamSize, useCase, setStep } = useFormStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // FIX: was missing — errors were swallowed silently
  const [serverOnline, setServerOnline] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkServer = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      try {
        const response = await fetch('/health', { signal: controller.signal });
        setServerOnline(response.ok);
      } catch {
        setServerOnline(false);
      } finally {
        clearTimeout(timeoutId);
      }
    };
    checkServer();
    const interval = setInterval(checkServer, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async () => {
    // FIX: guard empty tool list — server validates too, but fail fast on frontend
    if (tools.length === 0) {
      setError('Please add at least one tool before running the audit.');
      return;
    }

    setLoading(true);
    setError(null); // FIX: clear stale error on every new attempt

    try {
      // FIX: use relative URL — Vite proxy routes /api → localhost:5001
      // Do NOT hardcode the full URL here; proxy handles it in dev, and in prod
      // the frontend and backend will be on the same origin or reverse-proxied
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tools,
          teamSize,
          useCase,
          website: '', // honeypot — bots fill this, humans don't
        }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || `Server error: HTTP ${response.status}`);
      }

      if (data.uuid) {
        navigate(`/audit/${data.uuid}`, { state: { auditData: data } });
      } else {
        // FIX: use setError instead of alert() — alert blocks the thread
        setError('Audit completed but no ID returned. Check console for details.');
      }
    } catch (err) {
      console.error('Audit failed:', err);
      // FIX: use setError instead of alert() — renders inline, doesn't block
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalSpend = tools.reduce((sum, t) => sum + (parseFloat(t.monthlySpend) || 0), 0);

  return (
    <div className="space-y-10">
      {/* Honeypot — invisible to real users, bots fill it */}
      <input
        type="text"
        name="website"
        style={{ display: 'none' }}
        tabIndex={-1}
        autoComplete="off"
        readOnly
      />

      <div className="flex items-center gap-4">
        <button
          onClick={() => setStep(2)}
          className="p-3 bg-muted/50 hover:bg-muted rounded-2xl transition-all hover:scale-110 active:scale-90"
        >
          <ChevronLeft size={20} className="text-foreground" />
        </button>
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight text-foreground">Review Stack</h2>
          <p className="text-muted-foreground font-medium text-sm">One last look before we calculate your savings.</p>
        </div>
      </div>

      <div className="bg-background border-2 border-primary/20 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary/5">
        <div className="p-8 border-b border-border/50 bg-primary/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">Total Monthly Budget</p>
            <p className="text-5xl font-black text-foreground tracking-tighter">${totalSpend.toFixed(0)}</p>
          </div>
          <div className="flex gap-4">
            <div className="px-4 py-2 bg-background border border-border/50 rounded-xl text-center">
              <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Team</p>
              <p className="text-xs font-black text-foreground">{teamSize}</p>
            </div>
            <div className="px-4 py-2 bg-background border border-border/50 rounded-xl text-center">
              <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Focus</p>
              <p className="text-xs font-black text-foreground capitalize">{useCase}</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-4 max-h-[240px] overflow-y-auto pr-4 custom-scrollbar">
          {/* FIX: empty state when no tools added */}
          {tools.length === 0 ? (
            <p className="text-sm text-muted-foreground italic text-center py-4">
              No tools added. Go back and add at least one.
            </p>
          ) : (
            tools.map((t, idx) => (
              <div key={idx} className="flex justify-between items-center py-3 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-muted/50 rounded-lg flex items-center justify-center text-[10px] font-black uppercase">
                    {t.tool.substring(0, 2)}
                  </div>
                  <div>
                    {/* FIX: replace all underscores, not just the first */}
                    <p className="font-bold capitalize text-foreground text-sm">{t.tool.replace(/_/g, ' ')}</p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                      {t.plan} • {t.seats} seat{t.seats > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <p className="font-black text-foreground">${parseFloat(t.monthlySpend || 0).toFixed(0)}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className={`text-[10px] font-black uppercase tracking-widest text-center py-1 rounded-lg ${serverOnline ? 'text-emerald-500' : 'text-destructive'}`}>
          ● Server: {serverOnline ? 'Online' : 'Offline'}
        </div>

        {!serverOnline && (
          <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive">
            <AlertCircle size={18} strokeWidth={2.5} />
            <span className="text-sm font-semibold">Backend server is offline. Run: cd server && npm run dev</span>
          </div>
        )}

        <button
          onClick={handleSubmit}
          // FIX: also disable when tools list is empty
          disabled={loading || tools.length === 0}
          className="w-full py-6 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-white font-black text-xl rounded-[1.5rem] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-primary/30 flex items-center justify-center gap-3"
        >
          {loading ? (
            <><Loader2 className="animate-spin" /> Calculating Savings...</>
          ) : (
            <><BarChart2 size={24} /> Run Audit Engine</>
          )}
        </button>

        {/* FIX: render error inline instead of alert() */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive">
            <AlertCircle size={18} strokeWidth={2.5} />
            <span className="text-sm font-semibold">{error}</span>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <div className="h-px flex-1 bg-border/50" />
          <p className="text-[10px] font-bold uppercase tracking-widest px-2">Secure & Private Audit</p>
          <div className="h-px flex-1 bg-border/50" />
        </div>
      </div>
    </div>
  );
};

export default Step3_Review;
