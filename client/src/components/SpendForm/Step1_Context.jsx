import React from 'react';
import { useFormStore } from '../../store/formStore';
import { ArrowRight, Users, Lightbulb } from 'lucide-react';

const Step1_Context = () => {
  const { teamSize, useCase, setContext, setStep } = useFormStore();

  const handleNext = () => {
    if (teamSize && useCase) {
      setStep(2);
    }
  };

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h2 className="text-3xl font-black tracking-tight text-foreground">Basic Context</h2>
        <p className="text-muted-foreground font-medium">We use this to benchmark your spend against similar teams.</p>
      </div>
      
      <div className="space-y-8">
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">
            <Users size={16} /> Team Size
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {['1', '2-5', '6-15', '16-50', '50+'].map((option) => (
              <button
                key={option}
                onClick={() => setContext(option, useCase)}
                className={`p-4 rounded-2xl border-2 transition-all font-bold text-sm ${
                  teamSize === option 
                    ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10' 
                    : 'border-transparent bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
              >
                {option === '1' ? 'Solo (1)' : 
                 option === '2-5' ? 'Small (2-5)' :
                 option === '6-15' ? 'Mid (6-15)' :
                 option === '16-50' ? 'Large (16-50)' : 'Enterprise (50+)'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">
            <Lightbulb size={16} /> Primary Use Case
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { id: 'coding', label: 'Coding & Engineering' },
              { id: 'writing', label: 'Writing & Content' },
              { id: 'research', label: 'Research & Analysis' },
              { id: 'mixed', label: 'Mixed / General' }
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setContext(teamSize, option.id)}
                className={`p-4 rounded-2xl border-2 transition-all font-bold text-sm text-left ${
                  useCase === option.id 
                    ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10' 
                    : 'border-transparent bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleNext}
        disabled={!teamSize || !useCase}
        className="w-full group flex items-center justify-center gap-3 py-5 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-white font-black text-lg rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-primary/20"
      >
        Next: Your Tools <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

export default Step1_Context;
