import React from 'react';
import { TrendingDown, Sparkles, TrendingUp } from 'lucide-react';

const HeroSavings = ({ monthly, annual }) => {
  const hasSavings = monthly > 0;

  return (
    <div className={`relative w-full p-10 md:p-16 rounded-[3rem] border-2 text-center transition-all duration-700 ${
      hasSavings 
        ? 'bg-emerald-500/5 border-emerald-500/20 shadow-2xl shadow-emerald-500/10' 
        : 'bg-muted/30 border-border/50 shadow-sm'
    }`}>
      {/* Decorative background flare */}
      {hasSavings && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-emerald-500/10 blur-[100px] rounded-full -z-10 animate-pulse" />
      )}

      {hasSavings ? (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-black uppercase tracking-[0.2em] border border-emerald-500/20">
            <TrendingDown size={14} strokeWidth={3} /> Audit Complete: Real Overspend Found
          </div>
          
          <div className="space-y-2">
            <h1 className="text-7xl md:text-9xl font-black text-emerald-600 dark:text-emerald-500 tracking-tighter leading-none">
              ${monthly.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              <span className="text-2xl md:text-3xl font-bold text-emerald-600/50">/MO</span>
            </h1>
            <p className="text-xl md:text-2xl font-black text-emerald-700 dark:text-emerald-400/80 tracking-tight">
              Reclaim <span className="underline decoration-4 decoration-emerald-500/30 underline-offset-8">${annual.toLocaleString()}</span> annually
            </p>
          </div>

          <div className="flex justify-center items-center gap-4">
            <div className="h-1.5 w-12 bg-emerald-500/30 rounded-full" />
            <Sparkles size={20} className="text-emerald-500 animate-spin" style={{ animationDuration: '4s' }} />
            <div className="h-1.5 w-12 bg-emerald-500/30 rounded-full" />
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-700">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-muted text-muted-foreground rounded-full text-xs font-black uppercase tracking-[0.2em] border border-border/50">
             Perfect Optimization
          </div>
          
          <div className="space-y-2">
            <h1 className="text-7xl md:text-9xl font-black text-foreground tracking-tighter leading-none opacity-20">
              $0<span className="text-2xl md:text-3xl font-bold">/MO</span>
            </h1>
            <p className="text-xl md:text-2xl font-black text-foreground tracking-tight max-w-lg mx-auto leading-relaxed">
              Your stack is <span className="text-primary">perfectly tuned</span> for your team size.
            </p>
          </div>
          
          <p className="text-muted-foreground font-medium max-w-sm mx-auto text-sm">
            We found no redundant overlap or plan mismatches. You are paying exactly what you should be.
          </p>
        </div>
      )}
    </div>
  );
};

export default HeroSavings;
