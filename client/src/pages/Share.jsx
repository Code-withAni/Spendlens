import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import HeroSavings from '../components/HeroSavings';
import AuditCard from '../components/AuditCard';
import AISummary from '../components/AISummary';
import { Loader2, ArrowRight, Share2, Check } from 'lucide-react';

const Share = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        const response = await fetch(`/api/share/${uuid}`);
        if (!response.ok) throw new Error('Audit not found');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAudit();
  }, [uuid]);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
        <Loader2 className="animate-spin text-primary" size={48} strokeWidth={3} />
        <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">Loading Shared Report</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto space-y-6">
        <h2 className="text-3xl font-black tracking-tight">Report Expired</h2>
        <p className="text-muted-foreground font-medium">This shared link is no longer active. You can generate a new audit for your team in under 3 minutes.</p>
        <button onClick={() => navigate('/')} className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all">
          Start Free Audit
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-12 space-y-16 animate-in fade-in duration-700">
      <div className="text-center space-y-6">
        <div className="flex justify-center items-center gap-4">
          <div className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-primary/20">
             Public Financial Audit
          </div>
          <button 
            onClick={handleCopy}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              copied ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {copied ? <Check size={12} strokeWidth={3} /> : <Share2 size={12} strokeWidth={3} />}
            {copied ? 'Link Copied' : 'Share This report'}
          </button>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter leading-none">
          AI spend audit for a <span className="text-gradient capitalize">{data.team_size} team</span>.
        </h1>
      </div>

      <HeroSavings 
        monthly={data.total_monthly_savings} 
        annual={data.total_annual_savings} 
      />

      <AISummary text={data.ai_summary} />

      <div className="space-y-8">
        <h2 className="text-3xl font-black tracking-tighter text-foreground">Optimization Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.audit_results.map((res, idx) => (
            <AuditCard key={idx} result={res} />
          ))}
        </div>
      </div>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-[3.5rem] blur opacity-25 group-hover:opacity-60 transition duration-1000" />
        <div className="relative glass bg-primary rounded-[3rem] p-12 md:p-20 text-center text-white space-y-8 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -mr-32 -mt-32" />
          
          <div className="relative z-10 space-y-4">
            <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter leading-none">How much could YOU save?</h2>
            <p className="text-primary-foreground/80 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
              Run a free, deterministic audit of your AI tool stack. No login. No credit card. Just pure financial clarity.
            </p>
            <div className="pt-8">
              <Link 
                to="/" 
                className="inline-flex items-center gap-3 px-12 py-6 bg-white text-primary font-black text-2xl rounded-2xl hover:bg-primary-foreground transition-all hover:scale-105 active:scale-95 shadow-2xl"
              >
                Run My Free Audit <ArrowRight size={28} strokeWidth={3} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Share;
