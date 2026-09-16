import React, { useState, useEffect } from 'react';
import { Bot, Terminal, Sparkles, LogIn, ArrowRight } from 'lucide-react';
import { auth, signInWithGoogle } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import ChatInterface from './components/ChatInterface';
import { LogoIcon } from './components/LogoIcons';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed", error);
      alert("Login failed. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (isAuthChecking) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" /></div>;
  }

  if (user) {
    return <ChatInterface />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-stone-300 font-sans selection:bg-indigo-500/30">
      {/* Navbar */}
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-black/60 border border-white/15 flex items-center justify-center shadow-lg">
              <LogoIcon size={26} animated={true} withGlow={true} />
            </div>
            <span className="font-bold text-lg tracking-wide text-white">RGAMER AI</span>
          </div>
          
          <button 
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition text-sm font-medium border border-white/10 text-white disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            {isLoggingIn ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col items-center text-center relative overflow-hidden">
        
        {/* Background Glow Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-8 relative z-10">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Next-Gen 3D & Coding Assistant</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 relative z-10 leading-tight">
          Intelligence for <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400">
            Creators & Coders.
          </span>
        </h1>
        
        <p className="text-stone-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed relative z-10">
          RGAMER AI is your personal, independent AI. Built to write Blender Python scripts, solve complex coding bugs, and boost your 3D workflow.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto relative z-10">
          <button onClick={handleLogin} className="px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all duration-200 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center justify-center gap-2 cursor-pointer">
            <Terminal className="w-5 h-5" />
            Open AI Chat
          </button>
          <button onClick={handleLogin} className="px-8 py-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold border border-stone-700 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer">
            View Pricing <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Feature Highlights */}
        <div className="flex justify-center mt-20 w-full relative z-10">
          <div className="max-w-md w-full p-6 rounded-2xl bg-stone-900/50 border border-white/5 backdrop-blur-sm text-left">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Blender Expert</h3>
            <p className="text-stone-400 text-sm leading-relaxed">Specialized in generating bpy Python scripts and 3D modeling workflows instantly.</p>
          </div>
        </div>

      </main>
    </div>
  );
}
