import React from 'react';
import { ArrowDownRight, TrendingDown, CheckCircle2, AlertTriangle, Info, Zap } from 'lucide-react';

const AuditCard = ({ result }) => {
  const { tool, plan, seats, monthlySpend, recommendation, recommendedPlan, savings, reason, flag } = result;

  const statusConfig = {
    ok: { 
      color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20', 
      icon: CheckCircle2, 
      label: 'Optimal',
      savingsColor: 'text-muted-foreground/30'
    },
    downgrade: { 
      color: 'text-amber-600 bg-amber-500/10 border-amber-500/20', 
      icon: TrendingDown, 
      label: 'Downgrade',
      savingsColor: 'text-emerald-600'
    },
    switch: { 
      color: 'text-primary bg-primary/10 border-primary/20', 
      icon: Zap, 
      label: 'Switch',
      savingsColor: 'text-emerald-600'
    },
    redundant: { 
      color: 'text-rose-600 bg-rose-500/10 border-rose-500/20', 
      icon: AlertTriangle, 
      label: 'Redundant',
      savingsColor: 'text-emerald-600'
    },
    credits: { 
      color: 'text-blue-600 bg-blue-500/10 border-blue-500/20', 
      icon: Info, 
      label: 'Credits',
      savingsColor: 'text-emerald-600'
    }
  };

  const status = statusConfig[flag] || statusConfig.ok;
  const Icon = status.icon;

  return (
    <div className="glass bg-background/50 border border-border/50 rounded-[2rem] p-8 shadow-lg hover:shadow-xl hover:border-primary/20 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center font-black text-foreground/40 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            {tool.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="font-black text-xl text-foreground capitalize leading-tight">{tool.replace('_', ' ')}</h3>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{plan} • {seats} SEATS</p>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${status.color}`}>
          <Icon size={12} strokeWidth={3} /> {status.label}
        </div>
      </div>

      <div className="flex items-center justify-between py-6 border-y border-border/50">
        <div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Current Spend</p>
          <p className="text-2xl font-black text-foreground tracking-tighter">${parseFloat(monthlySpend).toFixed(0)}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Est. Savings</p>
          <p className={`text-2xl font-black tracking-tighter ${status.savingsColor}`}>
            {savings > 0 ? `-$${savings.toFixed(0)}` : '$0'}
          </p>
        </div>
      </div>

      <div className="mt-6">
        {recommendation || recommendedPlan ? (
          <div className="p-5 bg-muted/30 rounded-2xl border border-border/50 space-y-2">
             <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest">
                <Zap size={14} fill="currentColor" /> Recommended Action
             </div>
             <p className="text-foreground font-bold text-sm">
               {recommendation || `Switch to the ${recommendedPlan.toUpperCase()} plan`}
             </p>
             <p className="text-xs text-muted-foreground font-medium leading-relaxed">
               {reason}
             </p>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground/50 p-2">
            <CheckCircle2 size={14} />
            <p className="text-xs font-bold uppercase tracking-widest">Stack Optimized</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditCard;
