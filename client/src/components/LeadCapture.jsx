import { useState } from 'react';
import { Mail, CheckCircle, Loader2, Send } from 'lucide-react';

const LeadCapture = ({ uuid }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid, email }),
      });

      if (response.ok) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error('Lead capture failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="glass bg-emerald-500/5 border border-emerald-500/20 rounded-[2.5rem] p-10 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto mb-6">
          <CheckCircle size={32} strokeWidth={3} />
        </div>
        <h3 className="text-3xl font-black text-foreground mb-2 tracking-tight">Report Inbound!</h3>
        <p className="text-muted-foreground font-medium">Check your inbox for the full defensible audit breakdown.</p>
      </div>
    );
  }

  return (
    <div className="glass bg-background/50 border border-border/50 rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-black/5 relative overflow-hidden group">
      {/* Subtle background decoration */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-700" />
      
      <div className="max-w-xl mx-auto text-center space-y-8 relative">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto">
          <Mail size={32} />
        </div>
        
        <div className="space-y-3">
          <h3 className="text-3xl md:text-4xl font-black text-foreground tracking-tighter leading-none">Export this Report</h3>
          <p className="text-muted-foreground font-medium leading-relaxed">
            Get a professional PDF breakdown and automated alerts whenever we find new optimization opportunities for your specific stack.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="relative group/form mt-8">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl blur opacity-0 group-focus-within/form:opacity-100 transition-opacity duration-500" />
          <div className="relative flex flex-col md:flex-row gap-3">
            <input
              type="email"
              required
              placeholder="founder@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 p-5 bg-background border border-border/50 rounded-2xl outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold text-lg"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-10 py-5 bg-foreground text-background font-black text-lg rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-3 whitespace-nowrap active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : (
                <>
                  Get Report <Send size={20} strokeWidth={3} />
                </>
              )}
            </button>
          </div>
        </form>
        
        <p className="text-[10px] text-muted-foreground/50 font-black uppercase tracking-[0.4em]">No spam. Pure financial clarity.</p>
      </div>
    </div>
  );
};

export default LeadCapture;
