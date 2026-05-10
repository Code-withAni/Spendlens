import React from 'react';
import { Sparkles, Terminal } from 'lucide-react';

const AISummary = ({ text, loading }) => {
  if (loading) {
    return (
      <div className="glass bg-background/50 p-8 rounded-[2.5rem] border border-border/50 space-y-4 animate-pulse">
        <div className="flex items-center gap-2">
           <div className="w-4 h-4 bg-muted rounded-full" />
           <div className="h-4 bg-muted rounded w-32" />
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded w-full" />
          <div className="h-3 bg-muted rounded w-5/6" />
          <div className="h-3 bg-muted rounded w-4/6" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-purple-500/30 blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.6rem]" />
      
      <div className="relative glass bg-background/80 p-8 md:p-10 rounded-[2.5rem] border border-white/20 dark:border-white/5 overflow-hidden">
        <div className="absolute top-0 right-0 p-8 text-primary/10 pointer-events-none group-hover:text-primary/20 transition-colors">
          <Terminal size={120} strokeWidth={1} />
        </div>

        <div className="relative space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.3em]">
              <Sparkles size={14} /> AI Analysis Engine
            </h3>
            <div className="px-3 py-1 bg-primary/10 text-primary text-[8px] font-black rounded-full uppercase tracking-widest border border-primary/20">
              Claude 3.5 Sonnet
            </div>
          </div>
          
          <p className="text-foreground font-medium text-lg md:text-xl leading-relaxed max-w-3xl">
            {text}
          </p>
          
          <div className="flex items-center gap-2 pt-4">
             <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">System Analysis Optimal</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISummary;
