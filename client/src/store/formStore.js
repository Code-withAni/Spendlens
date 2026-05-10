import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useFormStore = create(persist(
  (set) => ({
    step: 1,
    teamSize: null,
    useCase: null,
    tools: [],          // [{ tool, plan, seats, monthlySpend }]
    setStep: (step) => set({ step }),
    setContext: (teamSize, useCase) => set({ teamSize, useCase }),
    addTool: (tool) => set((s) => ({ tools: [...s.tools, tool] })),
    removeTool: (index) => set((s) => ({ tools: s.tools.filter((_, i) => i !== index) })),
    reset: () => set({ step: 1, teamSize: null, useCase: null, tools: [] }),
  }),
  { name: 'spendlens-form' }  // key in localStorage
))
