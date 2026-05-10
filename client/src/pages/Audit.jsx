import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import HeroSavings from '../components/HeroSavings';
import AuditCard from '../components/AuditCard';
import AISummary from '../components/AISummary';
import CredexCTA from '../components/CredexCTA';
import LeadCapture from '../components/LeadCapture';
import { Share2, ArrowLeft, Loader2, BarChart3, Clock, Check } from 'lucide-react';

const Audit = () => {
  const { uuid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(location.state?.auditData || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!data && uuid) {
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
    }
  }, [uuid, data]);

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/share/${uuid}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
          <Loader2 className="animate-spin text-primary relative z-10" size={64} strokeWidth={3} />
        </div>
        <p className="text-foreground font-black uppercase tracking-[0.2em] text-xs">Generating Financial Analysis</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto space-y-6">
        <div className="w-20 h-20 bg-destructive/10 rounded-3xl flex items-center justify-center text-destructive">
          <BarChart3 size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tight">Audit Missing</h2>
          <p className="text-muted-foreground font-medium">This report couldn't be retrieved or has expired. Let's run a fresh analysis.</p>
        </div>
        <button 
          onClick={() => navigate('/')} 
          className="w-full py-4 bg-foreground text-background font-black rounded-2xl shadow-xl active:scale-95 transition-all"
        >
          New Audit Engine
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-12 space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <button 
          onClick={() => navigate('/')} 
          className="group flex items-center gap-3 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to Stack
        </button>
        
        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 rounded-full border border-border/50">
             <Clock size={12} /> {new Date(data.created_at || new Date()).toLocaleDateString()}
          </div>
          <button 
            onClick={handleShare}
            className={`flex items-center gap-2 px-5 py-2 rounded-full font-black border transition-all active:scale-95 ${
              copied 
                ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' 
                : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
            }`}
          >
            {copied ? <Check size={14} strokeWidth={3} /> : <Share2 size={14} strokeWidth={3} />}
            {copied ? 'Copied' : 'Share Result'}
          </button>
        </div>
      </div>

      {/* Main Results */}
      <div className="space-y-12">
        <HeroSavings 
          monthly={data.totalMonthlySavings ?? data.total_monthly_savings} 
          annual={data.totalAnnualSavings ?? data.total_annual_savings} 
        />

        <AISummary text={data.aiSummary || data.ai_summary} />
      </div>

      {/* Breakdown Grid */}
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div className="space-y-1">
            <h2 className="text-4xl font-black tracking-tighter text-foreground">Audit Breakdown</h2>
            <p className="text-muted-foreground font-medium">Specific optimizations identified by our deterministic engine.</p>
          </div>
          <div className="px-4 py-2 bg-muted/50 rounded-xl border border-border/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
             Analysis Depth: Comprehensive
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(data.results || data.audit_results).map((res, idx) => (
            <AuditCard key={idx} result={res} />
          ))}
        </div>
      </div>

      {/* Conversion & Lead Capture */}
      <div className="space-y-24 pt-12">
        {(data.totalMonthlySavings ?? data.total_monthly_savings) > 200 && (
          <CredexCTA savings={data.totalMonthlySavings ?? data.total_monthly_savings} />
        )}
        <LeadCapture uuid={uuid} />
      </div>
    </div>
  );
};

export default Audit;
