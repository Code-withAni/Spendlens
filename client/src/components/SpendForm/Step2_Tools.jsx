import React, { useState, useRef, useEffect } from 'react';
import { useFormStore } from '../../store/formStore';
import { Plus, Trash2, ChevronLeft, CreditCard, Layers, UserPlus, DollarSign, ArrowRight, ChevronDown, Check } from 'lucide-react';

const TOOLS_CONFIG = {
  cursor:        { name: 'Cursor',         plans: ['hobby', 'pro', 'business', 'enterprise'] },
  github_copilot:{ name: 'GitHub Copilot', plans: ['free', 'individual', 'business', 'enterprise'] },
  claude:        { name: 'Claude',          plans: ['free', 'pro', 'max', 'team', 'enterprise', 'api'] },
  chatgpt:       { name: 'ChatGPT',         plans: ['plus', 'team', 'enterprise', 'api'] },
  gemini:        { name: 'Gemini',          plans: ['pro', 'ultra', 'api'] },
  windsurf:      { name: 'Windsurf',        plans: ['free', 'pro', 'teams'] },
  anthropic_api: { name: 'Anthropic API',   plans: ['direct'] },
  openai_api:    { name: 'OpenAI API',      plans: ['direct'] },
};

// ── Custom Dropdown ──────────────────────────────────────────────────────────
// Replaces native <select> which can't be themed on dark backgrounds.
// Renders a styled button + absolute list that matches the site's dark theme.
const CustomSelect = ({ value, onChange, options, placeholder, disabled = false }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div ref={ref} className="relative w-full">
      {/* Trigger button — looks like an input field */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(o => !o)}
        className={`
          w-full flex items-center justify-between
          p-4 rounded-2xl border font-bold text-left
          transition-all duration-200
          ${disabled
            ? 'opacity-30 cursor-not-allowed bg-muted/20 border-border/30 text-muted-foreground'
            : 'bg-background border-border/50 text-foreground hover:border-primary/50 cursor-pointer'
          }
          ${open ? 'border-primary/70 ring-2 ring-primary/20' : ''}
        `}
      >
        {/* Show selected label or placeholder */}
        <span className={selected ? 'text-foreground' : 'text-muted-foreground font-medium'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-muted-foreground transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown list — rendered in dark background matching site theme */}
      {open && (
        <div className="
          absolute z-50 top-full left-0 right-0 mt-2
          bg-[hsl(224,71.4%,6%)] border border-border/50
          rounded-2xl shadow-2xl shadow-black/50
          overflow-hidden max-h-64 overflow-y-auto custom-scrollbar
        ">
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`
                w-full flex items-center justify-between
                px-4 py-3 text-left font-bold text-sm
                transition-colors duration-150
                ${value === opt.value
                  ? 'bg-primary/20 text-primary'
                  : 'text-foreground hover:bg-muted/40'
                }
              `}
            >
              {opt.label}
              {/* Checkmark on selected option */}
              {value === opt.value && <Check size={14} strokeWidth={3} className="text-primary flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────
const Step2_Tools = () => {
  const { tools, addTool, removeTool, setStep } = useFormStore();
  const [currentTool, setCurrentTool] = useState({ tool: '', plan: '', seats: '', monthlySpend: '' });

  // Build option arrays for the custom selects
  const toolOptions = Object.entries(TOOLS_CONFIG).map(([id, cfg]) => ({
    value: id,
    label: cfg.name,
  }));

  const planOptions = currentTool.tool
    ? TOOLS_CONFIG[currentTool.tool].plans.map(p => ({
        value: p,
        label: p.charAt(0).toUpperCase() + p.slice(1),
      }))
    : [];

  const handleAdd = () => {
    if (currentTool.tool && currentTool.plan) {
      addTool({ ...currentTool, seats: parseInt(currentTool.seats) || 1, monthlySpend: parseFloat(currentTool.monthlySpend) || 0 });
      setCurrentTool({ tool: '', plan: '', seats: '', monthlySpend: '' });
    }
  };

  // Reset plan when tool changes
  const handleToolChange = (value) => {
    setCurrentTool(prev => ({ ...prev, tool: value, plan: '' }));
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setStep(1)}
          className="p-3 bg-muted/50 hover:bg-muted rounded-2xl transition-all hover:scale-110 active:scale-90"
        >
          <ChevronLeft size={20} className="text-foreground" />
        </button>
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight text-foreground">AI Stack</h2>
          <p className="text-muted-foreground font-medium text-sm">Add every tool you currently pay for.</p>
        </div>
      </div>

      {/* Add Tool Form */}
      <div className="bg-muted/30 p-8 rounded-[2rem] border border-border/50 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Tool selector */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <Layers size={12} /> Tool
            </label>
            <CustomSelect
              value={currentTool.tool}
              onChange={handleToolChange}
              options={toolOptions}
              placeholder="Select tool..."
            />
          </div>

          {/* Plan selector — disabled until tool is chosen */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <CreditCard size={12} /> Plan Tier
            </label>
            <CustomSelect
              value={currentTool.plan}
              onChange={(value) => setCurrentTool(prev => ({ ...prev, plan: value }))}
              options={planOptions}
              placeholder="Select plan..."
              disabled={!currentTool.tool}
            />
          </div>

          {/* Seats */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <UserPlus size={12} /> Seats
            </label>
            <input
              type="number"
              min="1"
              placeholder="1"
              value={currentTool.seats}
              onChange={(e) => setCurrentTool(prev => ({ ...prev, seats: e.target.value }))}
              className="w-full p-4 bg-background border border-border/50 rounded-2xl outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold text-foreground"
            />
          </div>

          {/* Monthly Spend */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <DollarSign size={12} /> Monthly Spend
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-black">$</span>
              <input
                type="number"
                placeholder="0.00"
                min="0"
                value={currentTool.monthlySpend}
                onChange={(e) => setCurrentTool(prev => ({ ...prev, monthlySpend: e.target.value }))}
                className="w-full p-4 pl-8 bg-background border border-border/50 rounded-2xl outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold text-foreground"
              />
            </div>
          </div>
        </div>

        {/* Add button — only requires tool + plan, spend can be 0 for free tiers */}
        <button
          onClick={handleAdd}
          disabled={!currentTool.tool || !currentTool.plan}
          className="w-full flex items-center justify-center gap-2 py-4 bg-foreground text-background font-black rounded-2xl hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-30 disabled:active:scale-100"
        >
          <Plus size={18} strokeWidth={3} /> Add Tool to Stack
        </button>
      </div>

      {/* Added Tools List */}
      {tools.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-border/50">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Current Stack</h3>
            <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full uppercase tracking-widest">
              {tools.length} {tools.length === 1 ? 'Tool' : 'Tools'} Added
            </span>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {tools.map((t, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-5 bg-background border border-border/50 rounded-2xl shadow-sm group animate-in slide-in-from-right-4 duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-xs uppercase">
                    {t.tool.substring(0, 2)}
                  </div>
                  <div>
                    {/* Fix: replace ALL underscores */}
                    <p className="font-black text-foreground capitalize">{t.tool.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-muted-foreground font-bold">{t.plan.toUpperCase()} • {t.seats} SEAT{t.seats > 1 ? 'S' : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-black text-foreground text-lg">${parseFloat(t.monthlySpend).toFixed(0)}</p>
                  <button
                    onClick={() => removeTool(idx)}
                    className="text-destructive opacity-30 group-hover:opacity-100 p-2 hover:bg-destructive/10 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setStep(3)}
            className="w-full py-5 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
          >
            Review Audit <ArrowRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Step2_Tools;