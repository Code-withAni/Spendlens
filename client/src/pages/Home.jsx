import React from 'react';
import { useFormStore } from '../store/formStore';
import Step1_Context from '../components/SpendForm/Step1_Context';
import Step2_Tools from '../components/SpendForm/Step2_Tools';
import Step3_Review from '../components/SpendForm/Step3_Review';
import { Search, ShieldCheck, Zap, BarChart3 } from 'lucide-react';

const Home = () => {
  const { step } = useFormStore();

  return (
    <div className="flex-1 flex flex-col items-center px-4">
      {/* Hero Section */}
      <div className="max-w-4xl w-full text-center mt-8 md:mt-16 mb-16 space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20 animate-in fade-in zoom-in duration-500">
          <Search size={14} /> The Mint for AI Tool Spend
        </div>
        
        <div className="space-y-4 relative">
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.95] text-foreground">
            Stop overpaying for <span className="text-gradient">AI tools.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
            Get a defensible, data-driven audit of your startup's AI stack in 3 minutes. Average teams reclaim <span className="text-foreground font-bold">20-40%</span> of their monthly budget.
          </p>
        </div>

        {/* Benefits Grid - only on step 1 */}
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <div className="glass p-6 rounded-2xl text-left border border-white/10 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-600 mb-4">
                <Zap size={20} />
              </div>
              <h3 className="font-bold text-foreground mb-1">Instant Insights</h3>
              <p className="text-sm text-muted-foreground">Real-time savings calculation based on current vendor pricing.</p>
            </div>
            <div className="glass p-6 rounded-2xl text-left border border-white/10 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-600 mb-4">
                <ShieldCheck size={20} />
              </div>
              <h3 className="font-bold text-foreground mb-1">Privacy First</h3>
              <p className="text-sm text-muted-foreground">No login required. Audit results are PII-stripped for sharing.</p>
            </div>
            <div className="glass p-6 rounded-2xl text-left border border-white/10 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-600 mb-4">
                <BarChart3 size={20} />
              </div>
              <h3 className="font-bold text-foreground mb-1">Lead Generation</h3>
              <p className="text-sm text-muted-foreground">Direct access to discounted credits for qualifying stacks.</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Form Container */}
      <div className="w-full max-w-2xl relative">
        {/* Decorative elements around the form */}
        <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-purple-500/20 blur-2xl opacity-50 rounded-[3rem] -z-10" />
        
        <div className="glass w-full rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-black/10 border border-white/20 dark:border-white/5 relative overflow-hidden group">
          {/* Progress Indicator */}
          <div className="absolute top-0 left-0 w-full h-1 bg-muted/30">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-out" 
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>

          <div className="animate-in fade-in duration-500">
            {step === 1 && <Step1_Context />}
            {step === 2 && <Step2_Tools />}
            {step === 3 && <Step3_Review />}
          </div>
        </div>
      </div>

      {/* Trust Logos */}
      {step === 1 && (
        <div className="mt-20 mb-12 text-center space-y-6 opacity-60">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Supporting the Modern AI Stack</p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
             <div className="font-black text-2xl tracking-tighter italic">Cursor</div>
             <div className="font-black text-2xl tracking-tighter italic">Claude</div>
             <div className="font-black text-2xl tracking-tighter italic">ChatGPT</div>
             <div className="font-black text-2xl tracking-tighter italic">GitHub</div>
             <div className="font-black text-2xl tracking-tighter italic">Gemini</div>
             <div className="font-black text-2xl tracking-tighter italic">Codeium</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
