import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Audit from './pages/Audit';
import Share from './pages/Share';
import { AlertCircle } from 'lucide-react';

function App() {
  const [serverOnline, setServerOnline] = useState(true);

  useEffect(() => {
    const checkServerHealth = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      try {
        const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
        const response = await fetch(`${base}/health`, { 
          method: 'GET',
          signal: controller.signal
        });
        setServerOnline(response.ok);
      } catch (err) {
        setServerOnline(false);
      } finally {
        clearTimeout(timeoutId);
      }
    };

    // Check on mount
    checkServerHealth();

    // Check every 10 seconds
    const interval = setInterval(checkServerHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      <div className="min-h-screen flex flex-col transition-colors duration-500 overflow-x-hidden">
        {/* Server Offline Banner */}
        {!serverOnline && (
          <div className="fixed top-0 left-0 right-0 z-[100] bg-destructive/90 text-white px-6 py-3 flex items-center justify-center gap-3 animate-in slide-in-from-top duration-300">
            <AlertCircle size={18} strokeWidth={2.5} />
            <span className="font-semibold text-sm">Backend server is offline. Please start the server to use the audit feature.</span>
          </div>
        )}

        {/* Ambient background effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-float" />
          <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-blue-500/10 blur-[120px] rounded-full animate-float" style={{ animationDelay: '-2s' }} />
          <div className="absolute -bottom-[10%] left-[20%] w-[35%] h-[35%] bg-pink-500/10 blur-[120px] rounded-full animate-float" style={{ animationDelay: '-4s' }} />
        </div>

        <header className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-center transition-all duration-300 ${!serverOnline ? 'pt-16' : 'pt-4'}`}>
          <nav className="glass w-full max-w-5xl px-6 py-3 rounded-2xl flex justify-between items-center border border-white/20 dark:border-white/10 shadow-lg shadow-black/5">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20 group-hover:rotate-12 transition-all duration-300">S</div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">SpendLens</span>
            </Link>
            
            <div className="flex items-center gap-8">
              <div className="hidden md:flex items-center gap-6">
                <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How it works</a>
                <a href="https://credex.ai" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Credex</a>
              </div>
              <Link to="/" className="text-sm font-bold bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20">
                Run Audit
              </Link>
            </div>
          </nav>
        </header>

        <main className={`flex-1 flex flex-col pb-12 relative z-10 transition-all duration-300 ${!serverOnline ? 'pt-32' : 'pt-24'}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/audit/:uuid" element={<Audit />} />
            <Route path="/share/:uuid" element={<Share />} />
          </Routes>
        </main>

        <footer className="relative z-10 w-full max-w-5xl mx-auto px-6 py-12 border-t border-border/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">© 2025 SpendLens by</span>
                <a href="https://credex.ai" className="text-sm font-bold text-foreground hover:text-primary transition-colors">Credex</a>
              </div>
              <p className="text-xs text-muted-foreground max-w-xs text-center md:text-left">
                Empowering startups to optimize their AI infrastructure spend with data-driven clarity.
              </p>
            </div>
            
            <div className="flex items-center gap-8 text-sm font-medium text-muted-foreground">
              <Link to="/" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link to="/" className="hover:text-foreground transition-colors">Terms</Link>
              <Link to="/" className="hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
