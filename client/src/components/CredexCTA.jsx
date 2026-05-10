import React from 'react';
import { ExternalLink, CreditCard, Sparkles } from 'lucide-react';

const CredexCTA = ({ savings }) => {
  return (
    <div className="relative group">
      {/* Dynamic glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-[3.1rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
      
      <div className="relative bg-foreground text-background dark:bg-white dark:text-gray-900 rounded-[3rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden shadow-2xl">
        {/* Abstract background flare */}
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="text-center md:text-left space-y-6 max-w-xl relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-primary text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
            <Sparkles size={12} fill="white" /> Priority Access
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-[0.9] text-white dark:text-gray-900">
            You're leaving real <span className="text-primary underline decoration-primary/30 underline-offset-8">money</span> on the table.
          </h2>
          <p className="text-gray-400 dark:text-gray-500 text-lg font-medium leading-relaxed">
            Based on your monthly spend, you qualify for <span className="text-white dark:text-gray-900 font-bold">discounted AI infrastructure credits</span>. 
            Credex provides the exact same tools for a fraction of the retail cost.
          </p>
        </div>

        <div className="flex flex-col items-center gap-6 min-w-[240px] relative z-10">
          <div className="bg-white/5 dark:bg-gray-100 p-6 rounded-3xl border border-white/10 dark:border-gray-200 text-center w-full shadow-inner">
            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-[0.2em] mb-2">Estimated Annual Savings</p>
            <p className="text-4xl font-black text-primary tracking-tighter">${(savings * 0.2 * 12).toLocaleString()}</p>
          </div>
          
          <a 
            href="https://credex.ai" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="group/btn w-full flex items-center justify-center gap-3 px-10 py-5 bg-primary hover:bg-primary/90 text-white font-black text-xl rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/30"
          >
            Claim Discount <ExternalLink size={22} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </a>
          
          <div className="flex items-center gap-2 opacity-30">
             <CreditCard size={14} className="text-white dark:text-gray-900" />
             <p className="text-[10px] font-black uppercase tracking-widest text-white dark:text-gray-900">No Credit Card Required</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CredexCTA;
