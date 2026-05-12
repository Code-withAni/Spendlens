import { TrendingDown, Sparkles } from 'lucide-react';

const HeroSavings = ({ monthly, annual }) => {
  const hasSavings = monthly > 0;

  return (
    <div className={`relative w-full p-12 md:p-24 rounded-[3.5rem] border transition-all duration-1000 overflow-hidden ${
      hasSavings 
        ? 'glass border-emerald-500/20 shadow-[0_0_50px_-12px_rgba(16,185,129,0.2)]' 
        : 'bg-muted/30 border-border/50 shadow-sm'
    }`}>
      {/* Cinematic Lighting Effects */}
      {hasSavings && (
        <>
          <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-emerald-500/10 blur-[120px] rounded-full -z-10 animate-pulse" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-400/10 blur-[80px] rounded-full -z-10" />
          {/* Glass Reflection Line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />
        </>
      )}

      {hasSavings ? (
        <div className="relative z-10 flex flex-col items-center space-y-10 animate-in fade-in zoom-in-95 duration-1000">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-[0.25em] border border-emerald-500/20">
            <TrendingDown size={14} strokeWidth={3} /> AUDIT COMPLETE: REAL OVERSPEND FOUND
          </div>
          
          <div className="flex flex-col items-center">
            {/* Large Bold Price */}
            <h1 className="flex items-baseline font-black tracking-tighter text-emerald-600 dark:text-emerald-500 drop-shadow-sm">
              <span className="text-8xl md:text-9xl leading-none">
                ${monthly.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
              <span className="text-3xl md:text-4xl font-semibold ml-2 text-emerald-500 dark:text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.6)]">
                /MO
              </span>
            </h1>
            
            {/* Reclaim Text Hierarchy */}
            <p className="mt-6 text-xl md:text-2xl font-medium text-emerald-600 dark:text-emerald-400/90 tracking-tight">
              Reclaim ${annual.toLocaleString()} annually
            </p>
          </div>

          <div className="flex justify-center items-center gap-6 pt-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-emerald-500/40" />
            <Sparkles size={20} className="text-emerald-500/70 animate-pulse" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-emerald-500/40" />
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-1000">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-muted text-muted-foreground rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-border/50">
             PERFECT OPTIMIZATION
          </div>
          
          <div className="space-y-2">
            <h1 className="text-7xl md:text-9xl font-black text-foreground tracking-tighter leading-none opacity-10">
              $0<span className="text-2xl md:text-3xl font-bold">/MO</span>
            </h1>
            <p className="text-xl md:text-2xl font-medium text-foreground tracking-tight max-w-lg mx-auto leading-relaxed">
              Your stack is <span className="text-primary font-bold">perfectly tuned</span> for your team size.
            </p>
          </div>
          
          <p className="text-muted-foreground font-medium max-w-sm mx-auto text-sm opacity-60">
            We found no redundant overlap or plan mismatches. You are paying exactly what you should be.
          </p>
        </div>
      )}
    </div>
  );
};

export default HeroSavings;
