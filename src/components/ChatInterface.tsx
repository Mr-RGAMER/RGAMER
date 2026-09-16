import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Trash2, 
  Code, 
  MessageSquare, 
  Plus, 
  Lock, 
  Settings, 
  Zap, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  Cpu, 
  X, 
  Menu,
  Sparkles,
  ShieldCheck,
  Globe,
  HelpCircle,
  LogOut,
  ArrowUpRight,
  Compass,
  Palette,
  Check,
  Video,
  Download,
  PauseCircle,
  ShieldAlert
} from 'lucide-react';
import { auth, db, logout } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SettingsModal from './SettingsModal';
import LogoShowcaseModal from './LogoShowcaseModal';
import DownloadAppModal from './DownloadAppModal';
import { LogoIcon } from './LogoIcons';
import CinematicVideoPlayer from './CinematicVideoPlayer';
import CodeBlock from './CodeBlock';
import MessageActions from './MessageActions';
import ImageRenderer from './ImageRenderer';
import { RGAMER_MODELS, APP_VERSION, APP_VERSION_DISPLAY } from '../data/models';
import { getOrInitializeUserPower, deductUserPower, calculatePowerCost } from '../lib/powerManager';

export default function ChatInterface() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{id: string, role: string, content: string, createdAt: any}[]>([]);
  const [sessions, setSessions] = useState<{id: string, title: string, updatedAt: any}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBlenderMode, setIsBlenderMode] = useState(false);
  const [sessionId, setSessionId] = useState<string>(''); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [settingsActiveTab, setSettingsActiveTab] = useState<'general' | 'account' | 'billing' | 'capabilities' | 'privacy'>('general');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [isInputModelSelectorOpen, setIsInputModelSelectorOpen] = useState(false);
  const [isOutOfEnergyOpen, setIsOutOfEnergyOpen] = useState(false);
  const [isUnderConstructionOpen, setIsUnderConstructionOpen] = useState(false);
  const [isPowerModelModalOpen, setIsPowerModelModalOpen] = useState(false);
  const [isOsPermissionModalOpen, setIsOsPermissionModalOpen] = useState(false);
  const [isScanningSpecs, setIsScanningSpecs] = useState(false);
  const [scannedSpecs, setScannedSpecs] = useState<any>(null);
  const [activeVersion, setActiveVersion] = useState(() => {
    return localStorage.getItem('rgamer_ai_version') || 'RGAMER ALLROUNDER';
  });
  
  const [powerState, setPowerState] = useState<any>(null);
  const [userTier, setUserTier] = useState<'free' | 'pro' | 'gamer'>('free');

  const refreshPowerState = async () => {
    if (auth.currentUser) {
      const state = await getOrInitializeUserPower(auth.currentUser.uid);
      setPowerState(state);
      setUserTier(state.tier);
    }
  };

  useEffect(() => {
    refreshPowerState();
  }, [auth.currentUser]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const modelSelectorRef = useRef<HTMLDivElement>(null);
  const inputModelSelectorRef = useRef<HTMLDivElement>(null);
  const currentUser = auth.currentUser;

  const activeModelObj = RGAMER_MODELS.find(m => m.id === activeVersion) || RGAMER_MODELS[0];

  // Nickname fallback
  const userNickname = localStorage.getItem('rgamer_user_nickname') || currentUser?.displayName?.split(' ')[0] || 'RGAMER';

  const sessionIndex = sessions.findIndex(s => s.id === sessionId);
  const isSessionFrozen = userTier === 'free' && sessionIndex >= 5;

  // Keyboard shortcut Ctrl+, or Cmd+, for settings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        setSettingsActiveTab('general');
        setIsSettingsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close user menu or model selectors on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (modelSelectorRef.current && !modelSelectorRef.current.contains(e.target as Node)) {
        setIsModelSelectorOpen(false);
      }
      if (inputModelSelectorRef.current && !inputModelSelectorRef.current.contains(e.target as Node)) {
        setIsInputModelSelectorOpen(false);
      }
    };
    if (isUserMenuOpen || isModelSelectorOpen || isInputModelSelectorOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen, isModelSelectorOpen, isInputModelSelectorOpen]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Save activeVersion changes
  const handleVersionChange = (newVersion: string) => {
    setActiveVersion(newVersion);
    localStorage.setItem('rgamer_ai_version', newVersion);
  };

  const handleModelSelect = (model: any) => {
    // Advanced Desktop Detection (Electron, Tauri, or Native Webview)
    const isDesktopApp = 
      (window && window.process && (window.process as any).type) || // Electron check
      (navigator.userAgent.toLowerCase().indexOf(' electron/') > -1) || // Electron user agent check
      (window as any).__TAURI__ || // Tauri check
      (window as any).__RGAMER_DESKTOP__; // Custom injected flag for our future native wrapper

    const isAdmin = currentUser?.email === 'rgamer202026@gmail.com';

    if (model.isUnderConstruction) {
      setIsUnderConstructionOpen(true);
    } else if (model.isPowerModel) {
      if (!isDesktopApp && !isAdmin) {
        setIsPowerModelModalOpen(true);
      } else {
        const hasPermission = localStorage.getItem('rgamer_os_permission_granted') === 'true';
        if (!hasPermission) {
          setIsOsPermissionModalOpen(true);
        } else {
          handleVersionChange(model.id);
        }
      }
    } else {
      handleVersionChange(model.id);
    }
    setIsModelSelectorOpen(false);
    setIsInputModelSelectorOpen(false);
  };

  // Load Sessions List
  useEffect(() => {
    if (!currentUser) return;
    
    const sessionsQuery = query(
      collection(db, `users/${currentUser.uid}/sessions`), 
      orderBy('updatedAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(sessionsQuery, async (snapshot) => {
      const fetchedSessions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      
      setSessions(fetchedSessions);

      // Auto-create first chat if empty
      if (fetchedSessions.length === 0) {
        const defaultId = `chat_${Date.now()}`;
        await setDoc(doc(db, `users/${currentUser.uid}/sessions/${defaultId}`), { 
          title: "New Chat", 
          updatedAt: new Date().toISOString() 
        });
        setSessionId(defaultId);
      } else if (!sessionId) {
        // Auto-select first chat on load
        setSessionId(fetchedSessions[0].id);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Load messages for active session
  useEffect(() => {
    if (!currentUser || !sessionId) return;

    const q = query(
      collection(db, `users/${currentUser.uid}/sessions/${sessionId}/messages`), 
      orderBy('createdAt', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [currentUser, sessionId]);

  const handleNewChat = async () => {
    if (!currentUser) return;
    
    // FREE TIER LIMIT LOGIC
    if (sessions.length >= 5) {
      setSettingsActiveTab('billing');
      setIsSettingsOpen(true);
      return;
    }

    let newTitle = "New Chat";
    const newChatMatches = sessions.filter(s => s.title && s.title.startsWith("New Chat"));
    if (newChatMatches.length > 0) {
      newTitle = `New Chat ${newChatMatches.length}`;
    }

    const newSessionId = `chat_${Date.now()}`;
    await setDoc(doc(db, `users/${currentUser.uid}/sessions/${newSessionId}`), { 
      title: newTitle, 
      updatedAt: new Date().toISOString() 
    });
    setSessionId(newSessionId);
  };

  const handleSend = async (messageText?: string, e?: React.FormEvent) => {
    e?.preventDefault();
    const contentToSend = (messageText || input).trim();
    if (!contentToSend || !currentUser || !sessionId) return;

    // Check user power balance in background
    const powerCost = calculatePowerCost(contentToSend, activeVersion, isBlenderMode);
    const powerState = await getOrInitializeUserPower(currentUser.uid);

    if (powerState.aiPower < powerCost) {
      setIsOutOfEnergyOpen(true);
      return;
    }

    // Deduct power silently in the background (no UI penalty or clutter)
    await deductUserPower(currentUser.uid, powerCost);

    setInput('');
    setIsLoading(true);

    // Auto-update session title based on first message
    if (messages.length === 0) {
      const title = contentToSend.length > 25 ? contentToSend.substring(0, 25) + '...' : contentToSend;
      await setDoc(doc(db, `users/${currentUser.uid}/sessions/${sessionId}`), { 
        title: title,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }

    // Save User message to Firestore
    const messagesRef = collection(db, `users/${currentUser.uid}/sessions/${sessionId}/messages`);
    await addDoc(messagesRef, {
      role: 'user',
      content: contentToSend,
      createdAt: new Date().toISOString()
    });

    // Prepare history for Backend API
    const history = messages.map(m => ({ role: m.role, content: m.content }));
    const customInstructions = localStorage.getItem('rgamer_user_instructions') || '';
    const nickname = localStorage.getItem('rgamer_user_nickname') || currentUser.displayName || 'RGAMER';

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [...history, { role: 'user', content: contentToSend }],
          isBlenderMode,
          customInstructions,
          userNickname: nickname,
          activeModel: activeVersion
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.error || `Server Error: ${res.status}`;
        console.error("API Error Response:", errorData);
        throw new Error(errorMessage);
      }

      const data = await res.json();
      const assistantMessage = data.choices?.[0]?.message?.content || "No response generated by AI.";

      // Save Assistant message to Firestore
      await addDoc(messagesRef, {
        role: 'assistant',
        content: assistantMessage,
        createdAt: new Date().toISOString()
      });

      // Update session timestamp
      await setDoc(doc(db, `users/${currentUser.uid}/sessions/${sessionId}`), { 
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // Send to Blender if in Desktop App and Power Model
      if (activeVersion === 'RGAMER POWER MODEL') {
        const isElectron = (window && window.process && (window.process as any).type) || 
                           (navigator.userAgent.toLowerCase().indexOf(' electron/') > -1);
                           
        const isTauri = (window as any).__TAURI__ || (window as any).__TAURI_INTERNALS__;
        
        const isDesktopApp = isElectron || isTauri || (window as any).__RGAMER_DESKTOP__;

        if (isDesktopApp) {
          const pyMatch = assistantMessage.match(/```python\n([\s\S]*?)```/i) || assistantMessage.match(/```\n([\s\S]*?)```/i);
          if (pyMatch && pyMatch[1]) {
             const code = pyMatch[1];
             try {
                if (isElectron) {
                  // Electron Execution
                  console.log("Sending script to Blender via Electron...");
                  const { ipcRenderer } = window.require('electron');
                  const result = await ipcRenderer.invoke('execute-blender-script', code);
                  console.log("Electron Blender Result:", result);
                } else if (isTauri) {
                  // Tauri Execution
                  const { invoke } = await import('@tauri-apps/api/core');
                  console.log("Sending script to Blender via Tauri...");
                  const result = await invoke('send_to_blender', { script: code });
                  console.log("Tauri Blender Result:", result);
                }
             } catch (e) {
                console.error("Desktop Error connecting to Blender:", e);
             }
          }
        }
      }

    } catch (err: any) {
      console.error(err);
      
      await addDoc(messagesRef, {
        role: 'assistant',
        content: `⚠️ **System Error:** I couldn't reach the AI server. \n\n*Details: ${err.message}*\n\nPlease make sure GROQ_API_KEY is configured in the Server Secrets.`,
        createdAt: new Date().toISOString()
      });
      
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = async (targetSessionId: string = sessionId) => {
    if (!currentUser) return; 
    
    // Delete messages subcollection
    const messagesRef = collection(db, `users/${currentUser.uid}/sessions/${targetSessionId}/messages`);
    const snapshot = await getDocs(messagesRef);
    snapshot.forEach(async (docSnap) => {
      await deleteDoc(docSnap.ref);
    });

    // Delete session document
    await deleteDoc(doc(db, `users/${currentUser.uid}/sessions/${targetSessionId}`));

    // If active session was deleted, reset selection
    if (targetSessionId === sessionId) {
      setSessionId('');
    }
  };

  const openSettings = (tab: 'general' | 'account' | 'billing' | 'capabilities' | 'privacy' = 'general') => {
    setSettingsActiveTab(tab);
    setIsSettingsOpen(true);
    setIsUserMenuOpen(false);
  };

  const getPromptSuggestions = () => {
    if (isBlenderMode) {
      return [
        {
          title: "Procedural 3D Terrain",
          desc: "Blender bpy mesh generation with noise",
          prompt: "Write a complete Blender Python (bpy) script that generates a procedural mountainous 3D terrain with materials using subdivision and displacement.",
          icon: Code,
          badge: "Blender 3D"
        },
        {
          title: "Hologram Shader Material",
          desc: "Glowing sci-fi emission node tree",
          prompt: "Write a Blender Python (bpy) script to create a futuristic glowing sci-fi hologram material with scanline wave textures and emission nodes.",
          icon: Sparkles,
          badge: "Shaders"
        },
        {
          title: "Cycles Render Optimization",
          desc: "Cut render times by 50% without quality loss",
          prompt: "Explain the optimal Cycles rendering settings in Blender 4.x for noise threshold, sample clamp, light bounces, and tile sizes to maximize render speed.",
          icon: Zap,
          badge: "Performance"
        },
        {
          title: "Auto Camera Orbit Rig",
          desc: "Smooth 360-degree turntable animation",
          prompt: "Write a Python script for Blender that sets up an empty tracked turntable rig and keyframes a smooth 360-degree 120-frame camera orbit.",
          icon: Video,
          badge: "Animation"
        }
      ];
    }

    if (activeVersion.includes('CODER')) {
      return [
        {
          title: "Full-Stack Landing Page",
          desc: "React + Tailwind modern dark UI",
          prompt: "Build a complete, responsive modern SaaS landing page in React with Tailwind CSS featuring a sleek dark aesthetic, sticky navigation, feature grid, and pricing cards.",
          icon: Code,
          badge: "Web Dev"
        },
        {
          title: "Mobile App Architecture",
          desc: "Cross-platform React Native / Flutter",
          prompt: "Provide a production-ready mobile app template in React Native with Expo: bottom tab navigation, dark mode theme provider, and local storage state.",
          icon: Sparkles,
          badge: "Mobile App"
        },
        {
          title: "Best Free & Paid Hostings",
          desc: "Vercel, Render, Netlify & Cloudflare guide",
          prompt: "Explain the best free and paid platforms for hosting frontend and backend web applications (Vercel, Netlify, Render, Cloudflare Pages, Supabase, Railway) with deploy steps.",
          icon: Globe,
          badge: "Deployment"
        },
        {
          title: "Blender 3D Procedural Script",
          desc: "Complex 3D geometry generator",
          prompt: "Write a clean Blender Python (bpy) script that procedurally generates a futuristic sci-fi corridor with neon light strips and beveled panel geometry.",
          icon: Zap,
          badge: "Blender 3D"
        }
      ];
    }

    if (activeVersion.includes('IMAGE')) {
      return [
        {
          title: "Cyberpunk Neon Samurai",
          desc: "8K Octane render in rainy Tokyo",
          prompt: "Generate an image of an ultra-detailed cyberpunk samurai in glowing carbon-fiber armor standing in a neon rain-soaked alleyway in futuristic Tokyo, 8K octane render.",
          icon: Palette,
          badge: "Concept Art"
        },
        {
          title: "Esports Mascot Logo",
          desc: "Vector cyber robotic wolf icon",
          prompt: "Generate an image of a professional vector esports team gaming logo: fierce robotic cyber wolf with electric blue neon aura and clean minimalist outlines on dark backdrop.",
          icon: Sparkles,
          badge: "Logo Design"
        },
        {
          title: "Cozy Anime Cafe Wallpaper",
          desc: "Warm studio Ghibli aesthetic with rain",
          prompt: "Generate an image of a cozy anime coffee shop interior on a rainy afternoon, warm indoor lighting, steam rising from ceramic mugs, potted plants, and glowing city reflections.",
          icon: Palette,
          badge: "Illustration"
        },
        {
          title: "3D Isometric Sci-Fi Room",
          desc: "Miniature high-tech gamer battlestation",
          prompt: "Generate an image of a detailed 3D isometric cutaway diorama of a futuristic gaming battlestation with curved ultra-wide monitors, holographic displays, and RGB ambient illumination.",
          icon: Zap,
          badge: "3D Visual"
        }
      ];
    }

    if (activeVersion.includes('VIDEO')) {
      return [
        {
          title: "5s Intergalactic Hyperdrive",
          desc: "Cinematic spaceship warp sequence",
          prompt: "Create a 5-second cinematic video sequence and motion storyboard of a starship entering a swirling neon warp-speed hyperspace tunnel with camera speed ramp.",
          icon: Video,
          badge: "5s Video"
        },
        {
          title: "5s Supercar Night Drift",
          desc: "Dynamic camera tracking with tire smoke",
          prompt: "Generate a 5-second dynamic action shot of a customized sports car drifting around a tight corner at night, smoke lit by red taillights and neon streetlamps.",
          icon: Video,
          badge: "Cinematic"
        },
        {
          title: "5s Gaming Hardware Teaser",
          desc: "Macro focus pull & lighting sweep",
          prompt: "Design a 5-second luxury gaming mouse teaser commercial: macro depth of field revealing metallic texture, animated RGB sweep across the logo, and dramatic bass drop finish.",
          icon: Sparkles,
          badge: "Commercial"
        },
        {
          title: "5s FPV Drone Nature Dive",
          desc: "High-speed descent down mountain waterfall",
          prompt: "Script and storyboard a 5-second high-speed FPV drone dive tracking down a towering jungle waterfall with sunbeams cutting through water vapor.",
          icon: Zap,
          badge: "FPV Action"
        }
      ];
    }

    // Default: RGAMER ALLROUNDER
    return [
      {
        title: "Full Website & Code",
        desc: "Complete production-ready code",
        prompt: "Write a complete modern web application with interactive components, clean responsive Tailwind styling, and state management.",
        icon: Code,
        badge: "Coding"
      },
      {
        title: "Visual Concept Art",
        desc: "High-resolution 8K visual rendering",
        prompt: "Generate an image of an explorer standing before glowing ancient crystal monoliths inside an underground cavern, cinematic volumetric lighting.",
        icon: Palette,
        badge: "Image Gen"
      },
      {
        title: "5-Sec Video Sequence",
        desc: "Cinematic motion storyboard & direction",
        prompt: "Create a 5-second cinematic video sequence with camera choreography, dynamic lighting transitions, and sound design recommendations.",
        icon: Video,
        badge: "Video Gen"
      },
      {
        title: "Blender 3D bpy Automation",
        desc: "Procedural 3D scene scripting",
        prompt: "Write a Blender Python (bpy) script to create a procedural crystal cluster with glass refraction shaders and three-point lighting.",
        icon: Zap,
        badge: "Blender 3D"
      }
    ];
  };

  const promptSuggestions = getPromptSuggestions();

  return (
    <div className="flex h-screen bg-[#0e0e11] text-stone-300 font-sans select-none overflow-hidden">
      {/* Sidebar (Claude & Gemini hybrid layout) */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-16'} bg-[#141417] border-r border-white/10 flex flex-col hidden md:flex transition-all duration-300 shrink-0 relative z-30`}>
        {/* App Branding */}
        <div className={`p-4 border-b border-white/10 flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
          <div 
            onClick={() => setIsLogoModalOpen(true)}
            className="flex items-center gap-2.5 cursor-pointer group"
            title="Click to view Official Brand R Logo"
          >
            <div className="w-8 h-8 shrink-0 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center shadow-md group-hover:scale-105 transition">
              <LogoIcon size={22} animated={true} withGlow={true} />
            </div>
            {isSidebarOpen && (
              <div className="overflow-hidden">
                <span className="font-bold text-white tracking-wide text-xs block truncate group-hover:text-cyan-300 transition">RGAMER AI</span>
                <span className="text-[10px] font-mono font-bold text-cyan-400 block -mt-0.5 tracking-wider">VERSION 1.0.0</span>
              </div>
            )}
          </div>
        </div>
        
        {/* New Chat Button */}
        <div className="p-3">
          <button 
            onClick={handleNewChat}
            className={`w-full flex items-center justify-center gap-2 ${isSidebarOpen ? 'px-3.5' : 'px-0'} py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-all shadow-md shadow-indigo-900/30 hover:scale-[1.02] active:scale-[0.98]`}
            title="New Chat"
          >
            <Plus className="w-4 h-4 shrink-0" />
            {isSidebarOpen && <span className="tracking-wide">New chat</span>}
          </button>
          
          {isSidebarOpen && (
            <div className="mt-3.5 flex items-center justify-between px-2 text-[10px] uppercase font-bold text-stone-500 tracking-wider">
              <span>Chats & History</span>
              <span className={sessions.length >= 5 ? 'text-amber-400 font-semibold' : ''}>
                {sessions.length} / 5
              </span>
            </div>
          )}
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1 pb-4">
          {sessions.map((session, idx) => {
            const isItemFrozen = userTier === 'free' && idx >= 5;
            return (
              <div 
                key={session.id}
                className={`group flex items-center ${isSidebarOpen ? 'justify-between px-3' : 'justify-center px-0'} w-full text-left py-2 rounded-xl text-xs transition-all cursor-pointer ${
                  sessionId === session.id 
                    ? 'bg-indigo-600/15 text-indigo-300 font-medium border border-indigo-500/30' 
                    : 'text-stone-400 hover:bg-white/5 hover:text-stone-200 border border-transparent'
                }`}
                onClick={() => setSessionId(session.id)}
                title={isItemFrozen ? 'Session Paused (Pro required)' : session.title}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  {isItemFrozen ? (
                    <Lock className={`w-3.5 h-3.5 shrink-0 ${sessionId === session.id ? 'text-indigo-400' : 'text-indigo-500/60'}`} />
                  ) : (
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${sessionId === session.id ? 'text-indigo-400' : 'text-stone-500'}`} />
                  )}
                  {isSidebarOpen && <span className={`truncate ${isItemFrozen ? 'opacity-75' : ''}`}>{session.title}</span>}
                </div>
                {isSidebarOpen && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); clearChat(session.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-stone-500 hover:text-rose-400 transition rounded shrink-0"
                    title="Delete Chat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
          
          {sessions.length >= 5 && isSidebarOpen && (
            <div 
              onClick={() => openSettings('billing')}
              className="mt-4 p-3 rounded-xl bg-gradient-to-br from-indigo-950/40 to-purple-950/40 border border-indigo-500/30 text-center cursor-pointer hover:border-indigo-400/60 transition group"
            >
              <Lock className="w-4 h-4 text-indigo-400 mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
              <p className="text-xs text-indigo-200 font-semibold">Free limit reached (5/5)</p>
              <p className="text-[11px] text-stone-400 mt-0.5">Click to upgrade for unlimited chats</p>
            </div>
          )}
        </div>

        {/* Sidebar Footer with Claude-style Floating User Popover */}
        <div className="p-3 border-t border-white/10 space-y-2 relative" ref={userMenuRef}>
          {isSidebarOpen && (
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="flex items-center gap-2 text-xs text-stone-300">
                <Code className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-medium">Blender Mode</span>
              </div>
              <button 
                onClick={() => setIsBlenderMode(!isBlenderMode)}
                className={`w-9 h-5 rounded-full relative transition-colors shrink-0 ${isBlenderMode ? 'bg-emerald-500' : 'bg-stone-700'}`}
                title="Toggle Blender Scripting Assistant"
              >
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${isBlenderMode ? 'translate-x-4' : ''}`} />
              </button>
            </div>
          )}

          {/* Floating User Menu (Screenshot 720 style) */}
          {isUserMenuOpen && (
            <div className="absolute bottom-full left-3 right-3 mb-2 bg-[#18181c] border border-white/10 rounded-2xl p-1.5 shadow-2xl shadow-black/80 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
              {/* User email header */}
              <div className="px-3 py-2 text-xs border-b border-white/10">
                <p className="font-medium text-white truncate">{userNickname}</p>
                <p className="text-[10px] text-stone-400 truncate">{currentUser?.email}</p>
              </div>

              {/* Menu items */}
              <div className="py-1 space-y-0.5">
                <button
                  onClick={() => openSettings('general')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-stone-300 hover:text-white hover:bg-white/5 transition text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Settings className="w-3.5 h-3.5 text-stone-400" />
                    <span>Settings</span>
                  </div>
                  <span className="text-[10px] font-mono text-stone-500 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">Ctrl ,</span>
                </button>

                <button
                  onClick={() => openSettings('capabilities')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-stone-300 hover:text-white hover:bg-white/5 transition text-left"
                >
                  <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="truncate">AI Engine ({activeVersion.split(' ')[1] || 'Default'})</span>
                </button>

                <button
                  onClick={() => openSettings('privacy')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-stone-300 hover:text-white hover:bg-white/5 transition text-left"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Privacy & Policies</span>
                </button>

                <div className="h-px bg-white/10 my-1" />

                <button
                  onClick={() => setIsDownloadModalOpen(true)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/10 transition text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-medium">Download Desktop App (.exe)</span>
                  </div>
                </button>

                <div className="h-px bg-white/10 my-1" />

                <button
                  onClick={() => openSettings('billing')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 transition text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-medium">Upgrade plan</span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>

                <div className="h-px bg-white/10 my-1" />

                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}

          {/* User profile button pill (Claude style) */}
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className={`w-full flex items-center ${isSidebarOpen ? 'justify-between px-2.5' : 'justify-center px-1'} py-2 rounded-xl hover:bg-white/5 transition border border-transparent hover:border-white/5 group`}
            title="Account Menu"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden shadow">
                {currentUser?.photoURL ? (
                  <img src={currentUser.photoURL} alt="User" className="w-full h-full object-cover" />
                ) : (
                  userNickname.charAt(0).toUpperCase() || <User className="w-4 h-4" />
                )}
              </div>
              {isSidebarOpen && (
                <div className="text-left truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-white truncate">{userNickname}</span>
                    <span className={`text-[9px] uppercase font-bold px-1 py-0.5 rounded ${
                      userTier === 'free' ? 'text-stone-400 bg-white/5' : 
                      userTier === 'pro' ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20' : 
                      'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                    }`}>
                      {userTier}
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-500 block truncate">{currentUser?.email}</span>
                </div>
              )}
            </div>

            {isSidebarOpen && (
              <div className="text-stone-500 group-hover:text-stone-300 transition">
                {isUserMenuOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#0b0b0e] relative overflow-hidden">
        {/* Top App Header (Claude & Gemini hybrid style) */}
        <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 md:px-8 bg-[#111115]/50 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="p-2 -ml-2 text-stone-400 hover:text-white transition rounded-xl hover:bg-white/5 hidden md:block" 
              title="Toggle Sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2.5">
              <button 
                onClick={() => setIsLogoModalOpen(true)}
                className="flex items-center gap-2 hover:opacity-85 transition group"
                title="Click to view Official Brand R Logo"
              >
                <div className="w-7 h-7 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center shadow">
                  <LogoIcon size={18} animated={true} withGlow={true} />
                </div>
                <span className="text-white font-bold text-xs md:text-sm tracking-wide group-hover:text-cyan-300 transition">
                  {isBlenderMode ? 'Blender 3D Expert' : 'RGAMER AI'}
                </span>
              </button>
              <span className="text-[10px] font-mono font-bold text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 rounded-md tracking-wider">
                VERSION 1.0.0
              </span>

              {/* Interactive Model Selector Dropdown */}
              <div className="relative" ref={modelSelectorRef}>
                <button
                  onClick={() => setIsModelSelectorOpen(!isModelSelectorOpen)}
                  className="flex items-center gap-1.5 text-[11px] font-medium text-stone-200 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 px-2.5 py-1 rounded-xl transition group"
                  title="Switch RGAMER AI Model"
                >
                  <span className={`w-2 h-2 rounded-full ${
                    activeVersion.includes('CODER') ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' :
                    activeVersion.includes('IMAGE') ? 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.6)]' :
                    activeVersion.includes('VIDEO') ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 
                    'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.6)]'
                  }`} />
                  <span className="hidden sm:inline-block font-mono text-[10px] tracking-wide">{activeModelObj.name}</span>
                  <span className="text-[9px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">v{activeModelObj.version}</span>
                  <ChevronDown className="w-3 h-3 text-stone-400 group-hover:text-white transition" />
                </button>

                {isModelSelectorOpen && (
                  <div className="absolute top-full left-0 mt-2 w-80 bg-[#18181c] border border-white/10 rounded-2xl p-2 shadow-2xl shadow-black/90 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-stone-400 tracking-wider border-b border-white/5 flex items-center justify-between">
                      <span>Select AI Model</span>
                      <span className="text-indigo-400 font-mono text-[10px]">RGAMER v1.0.0</span>
                    </div>
                    <div className="py-1 space-y-1">
                      {RGAMER_MODELS.map((model) => (
                        <button
                          key={model.id}
                          onClick={() => handleModelSelect(model)}
                          className={`w-full text-left p-2.5 rounded-xl transition flex items-start justify-between gap-2.5 ${
                            activeVersion === model.id 
                              ? 'bg-indigo-600/20 text-white border border-indigo-500/40 shadow-sm' 
                              : 'hover:bg-white/5 text-stone-300 border border-transparent'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-xs text-white truncate">{model.name}</span>
                              {activeVersion === model.id && (
                                <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                              )}
                            </div>
                            <p className="text-[10px] text-stone-400 mt-0.5 line-clamp-1">{model.description}</p>
                          </div>
                          <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white/5 text-stone-300 shrink-0 border border-white/10">
                            v{model.version}
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="mt-1 pt-1.5 border-t border-white/5 px-2 text-[10px] text-stone-500 flex items-center justify-between">
                      <span>Switch anytime during session</span>
                      <button 
                        onClick={() => {
                          setIsModelSelectorOpen(false);
                          openSettings('capabilities');
                        }}
                        className="text-indigo-400 hover:text-indigo-300"
                      >
                        Model specs →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-2.5">
            {/* Prominent Glowing Download Desktop App button with exact requested pitch */}
            <button
              onClick={() => setIsDownloadModalOpen(true)}
              className="flex items-center gap-2 text-xs font-bold text-white bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 border border-cyan-400/50 px-3 md:px-3.5 py-1.5 rounded-full transition shadow-[0_0_20px_rgba(6,182,212,0.35)] group shrink-0"
              title="Download Desktop App for Windows"
            >
              <Download className="w-3.5 h-3.5 text-cyan-200 group-hover:translate-y-0.5 transition-transform" />
              <span className="hidden xl:inline tracking-tight">DOWNLOAD OUR APP TO USE OUR UPCOMING POWER MODEL</span>
              <span className="hidden sm:inline xl:hidden tracking-tight">DOWNLOAD APP (POWER MODEL)</span>
              <span className="sm:hidden font-extrabold text-[11px]">GET APP</span>
              <span className="hidden md:inline-flex items-center text-[9px] bg-black/40 text-cyan-200 font-mono px-1.5 py-0.5 rounded-full border border-white/10 font-normal">.EXE</span>
            </button>

            {/* Brand R Logo Emblem button */}
            <button
              onClick={() => setIsLogoModalOpen(true)}
              className="hidden lg:flex items-center gap-1.5 text-xs text-cyan-300 hover:text-white bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 px-3 py-1.5 rounded-full transition group shadow-sm"
              title="Official RGAMER AI 'R' Emblem"
            >
              <LogoIcon size={16} withGlow={true} animated={true} />
              <span className="font-semibold text-[11px]">Brand &ldquo;R&rdquo; Logo</span>
            </button>

            {/* Claude-style "Free plan · Upgrade" pill button */}
            <button
              onClick={() => openSettings('billing')}
              className={`flex items-center gap-1.5 text-xs text-stone-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 px-3 py-1.5 rounded-full transition group ${userTier !== 'free' ? 'hidden md:flex' : ''}`}
            >
              <span className="text-stone-400 text-[11px] capitalize">{userTier} plan ·</span>
              <span className={`${userTier === 'free' ? 'text-amber-400' : 'text-indigo-400'} font-semibold text-[11px] group-hover:underline flex items-center gap-1`}>
                {userTier === 'free' ? 'Upgrade' : 'Manage'} <Sparkles className={`w-3 h-3 ${userTier === 'free' ? 'text-amber-400' : 'text-indigo-400'}`} />
              </span>
            </button>

            <button
              onClick={() => openSettings('general')}
              className="p-2 text-stone-400 hover:text-white transition rounded-xl hover:bg-white/5"
              title="Settings (Ctrl+,)"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button 
              onClick={() => clearChat(sessionId)} 
              className="p-2 text-stone-400 hover:text-rose-400 transition rounded-xl hover:bg-white/5" 
              title="Delete Current Chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages / Canvas */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {(() => {
            if (isSessionFrozen) {
              return (
                <div className="h-full flex flex-col items-center justify-center max-w-lg mx-auto py-8 text-center animate-in fade-in duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-5 border border-indigo-500/20 shadow-[0_0_35px_rgba(99,102,241,0.25)]">
                    <Lock className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight mb-2">
                    This Pro Session is Paused
                  </h2>
                  <p className="text-stone-400 text-sm mb-6 leading-relaxed">
                    Your project data, blender scripts, and code history are safely preserved in vault. Renew your PRO / GAMER Plan to unlock and continue building.
                  </p>
                  <button
                    onClick={() => {
                      setSettingsActiveTab('billing');
                      setIsSettingsOpen(true);
                    }}
                    className="w-full sm:w-auto px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-lg shadow-indigo-900/30 flex items-center justify-center gap-2 mx-auto"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    Renew Plan
                  </button>
                </div>
              );
            }

            return (
              <>
                {messages.length === 0 ? (
                  /* Gemini & Claude style Empty State (Screenshot 720 & 722) */
                  <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto py-8 text-center animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-2xl bg-black/60 flex items-center justify-center mb-5 border border-white/10 shadow-[0_0_35px_rgba(0,245,255,0.25)]">
                <LogoIcon size={38} animated={true} withGlow={true} />
              </div>
              
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-2">
                What's cooking, {userNickname}?
              </h2>
              <p className="text-stone-400 text-xs md:text-sm max-w-md mx-auto mb-8 leading-relaxed">
                {isBlenderMode 
                  ? "Blender 3D scripting mode active. Generate bpy Python automation, shaders, and procedural meshes."
                  : "Ask questions, write Python code, generate visual concept art, or build 3D workflows."}
              </p>

              {/* Suggestion prompt cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
                {promptSuggestions.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSend(item.prompt)}
                      className="p-3.5 rounded-2xl bg-[#141418] hover:bg-[#1a1a20] border border-white/10 hover:border-indigo-500/40 transition-all text-left flex items-start gap-3 group shadow-sm hover:shadow-indigo-950/20"
                    >
                      <div className="w-8 h-8 rounded-xl bg-white/5 text-stone-300 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 flex items-center justify-center shrink-0 transition">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-xs font-semibold text-white group-hover:text-indigo-300 transition truncate">{item.title}</span>
                        </div>
                        <p className="text-[11px] text-stone-400 leading-snug line-clamp-2">{item.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex gap-4 max-w-4xl mx-auto ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 shrink-0 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center text-white mt-1 shadow-md">
                    <LogoIcon size={20} animated={true} withGlow={true} />
                  </div>
                )}
                
                <div className={`max-w-[85%] rounded-2xl px-5 py-4 text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-[#1e1e24] text-stone-100 rounded-tr-sm border border-white/5' 
                    : 'bg-transparent text-stone-300'
                }`}>
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (() => {
                    const videoMatch = msg.content.match(/\[VIDEO:\s*([^\]]+)\]/i);
                    const videoPrompt = videoMatch ? videoMatch[1].trim() : null;
                    const cleanMarkdown = videoMatch ? msg.content.replace(/\[VIDEO:\s*([^\]]+)\]/i, '').trim() : msg.content;

                    return (
                      <div className="space-y-3">
                        {videoPrompt && (
                          <CinematicVideoPlayer prompt={videoPrompt} />
                        )}
                        <div className="markdown-body prose prose-invert max-w-none prose-pre:bg-[#16161a] prose-pre:border prose-pre:border-white/10 prose-a:text-cyan-400">
                          <Markdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              table({ children }) {
                                return (
                                  <div className="overflow-x-auto my-4 rounded-xl border border-white/10 bg-[#121218] shadow-xl">
                                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                                      {children}
                                    </table>
                                  </div>
                                );
                              },
                              thead({ children }) {
                                return <thead className="bg-[#181826] border-b border-white/10 text-cyan-300 font-semibold">{children}</thead>;
                              },
                              th({ children }) {
                                return <th className="px-4 py-3 font-bold border-b border-white/10 whitespace-nowrap text-cyan-200">{children}</th>;
                              },
                              td({ children }) {
                                return <td className="px-4 py-3 border-b border-white/5 text-stone-300">{children}</td>;
                              },
                              h1({ children }) {
                                return <h1 className="text-xl sm:text-2xl font-black text-white mt-6 mb-3 flex items-center gap-2 border-b border-white/10 pb-2">{children}</h1>;
                              },
                              h2({ children }) {
                                return <h2 className="text-lg sm:text-xl font-bold text-cyan-300 mt-5 mb-2.5 flex items-center gap-2">{children}</h2>;
                              },
                              h3({ children }) {
                                return <h3 className="text-base sm:text-lg font-bold text-indigo-300 mt-4 mb-2 flex items-center gap-2">{children}</h3>;
                              },
                              ul({ children }) {
                                return <ul className="space-y-1.5 my-3 list-disc list-inside text-stone-300">{children}</ul>;
                              },
                              ol({ children }) {
                                return <ol className="space-y-1.5 my-3 list-decimal list-inside text-stone-300">{children}</ol>;
                              },
                              li({ children }) {
                                return <li className="leading-relaxed">{children}</li>;
                              },
                              blockquote({ children }) {
                                return <blockquote className="border-l-4 border-cyan-500 bg-cyan-950/20 px-4 py-2.5 rounded-r-xl my-4 text-stone-300 italic">{children}</blockquote>;
                              },
                              pre({ children }) {
                                return <>{children}</>;
                              },
                              code({ node, className, children, ...props }: any) {
                                const match = /language-(\w+)/.exec(className || '');
                                const isInline = !match && !String(children).includes('\n');
                                if (isInline) {
                                  return (
                                    <code className="bg-white/10 text-cyan-300 font-mono text-[13px] px-1.5 py-0.5 rounded border border-white/10" {...props}>
                                      {children}
                                    </code>
                                  );
                                }
                                const codeContent = String(children).replace(/\n$/, '');
                                const language = match ? match[1] : 'code';
                                return (
                                  <CodeBlock language={language} code={codeContent} />
                                );
                              },
                              img({ node, ...props }: any) {
                                return <ImageRenderer src={props.src} alt={props.alt} />;
                              }
                            }}
                          >
                            {cleanMarkdown}
                          </Markdown>
                        </div>

                        {/* Action Toolbar for copying and downloading AI written content */}
                        <MessageActions content={msg.content} messageId={msg.id} />
                      </div>
                    );
                  })()}
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 shrink-0 rounded-full bg-indigo-600 flex items-center justify-center text-white mt-1 overflow-hidden shadow">
                    {currentUser?.photoURL ? (
                      <img src={currentUser.photoURL} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      userNickname.charAt(0).toUpperCase() || <User className="w-4 h-4" />
                    )}
                  </div>
                )}
              </div>
            ))
          )}
          </>
          );
          })()}
          {isLoading && !isSessionFrozen && (
            <div className="flex gap-4 max-w-4xl mx-auto">
              <div className="w-8 h-8 shrink-0 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center text-cyan-400 mt-1 shadow-md">
                <LogoIcon size={20} animated={true} withGlow={true} />
              </div>
              <div className="flex items-center gap-1.5 px-5 py-4">
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area (Claude & Gemini hybrid style) */}
        <div className="p-4 md:p-6 pt-0">
          <form onSubmit={(e) => handleSend(undefined, e)} className="max-w-4xl mx-auto relative">
            <div className="bg-[#141418] border border-white/10 rounded-2xl shadow-xl focus-within:border-indigo-500/60 focus-within:ring-1 focus-within:ring-indigo-500/40 transition flex flex-col p-2.5">
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!isSessionFrozen) handleSend();
                  }
                }}
                disabled={isSessionFrozen}
                placeholder={isSessionFrozen ? "Session Paused - Renew plan to continue" : (isBlenderMode ? "Describe the Blender bpy Python script or material setup you need..." : `Message RGAMER AI (${activeModelObj.name})...`)}
                className="w-full bg-transparent px-3 py-2 text-xs md:text-sm text-white placeholder-stone-500 focus:outline-none resize-none leading-relaxed disabled:opacity-50"
                style={{ minHeight: '48px', maxHeight: '180px' }}
              />

              {/* Bottom toolbar inside Send Box: Model / Version Selector & Send Button */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5 px-1">
                {/* Model & Version Selector Dropdown */}
                <div className="relative" ref={inputModelSelectorRef}>
                  <button
                    type="button"
                    onClick={() => setIsInputModelSelectorOpen(!isInputModelSelectorOpen)}
                    className="flex items-center gap-2 text-[11px] font-medium text-stone-200 bg-white/[0.04] hover:bg-white/[0.08] hover:border-indigo-500/40 border border-white/10 px-3 py-1.5 rounded-xl transition group"
                    title="Change AI Model or Version"
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      activeVersion.includes('CODER') ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' :
                      activeVersion.includes('IMAGE') ? 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.6)]' :
                      activeVersion.includes('VIDEO') ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 
                      'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.6)]'
                    }`} />
                    <span className="font-semibold text-white tracking-wide text-xs">
                      {activeModelObj.name}
                    </span>
                    <span className="font-mono text-[10px] text-indigo-300 bg-indigo-500/15 border border-indigo-500/25 px-1.5 py-0.5 rounded font-bold">
                      VERSION {activeModelObj.version}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-hover:text-white transition" />
                  </button>

                  {/* Dropdown Menu floating upwards above input */}
                  {isInputModelSelectorOpen && (
                    <div className="absolute bottom-full left-0 mb-2 w-80 sm:w-96 bg-[#18181c] border border-white/10 rounded-2xl p-2.5 shadow-2xl shadow-black/95 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
                      <div className="px-2.5 py-1.5 text-[10px] uppercase font-bold text-stone-400 tracking-wider border-b border-white/5 flex items-center justify-between">
                        <span>Select AI Model & Version</span>
                        <span className="text-indigo-400 font-mono">v1.0.0</span>
                      </div>
                      <div className="py-1 space-y-1">
                        {RGAMER_MODELS.map((model) => (
                          <button
                            key={model.id}
                            type="button"
                            onClick={() => handleModelSelect(model)}
                            className={`w-full text-left p-2.5 rounded-xl transition flex items-start justify-between gap-2.5 ${
                              activeVersion === model.id 
                                ? 'bg-indigo-600/20 text-white border border-indigo-500/40 shadow-sm' 
                                : 'hover:bg-white/5 text-stone-300 border border-transparent'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs text-white truncate">{model.name}</span>
                                {activeVersion === model.id && (
                                  <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                )}
                              </div>
                              <p className="text-[10px] text-stone-400 mt-0.5 line-clamp-1">{model.description}</p>
                            </div>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 shrink-0 border border-indigo-500/20">
                              VERSION {model.version}
                            </span>
                          </button>
                        ))}
                      </div>
                      <div className="mt-1 pt-2 border-t border-white/5 px-2 text-[10px] text-stone-500 flex items-center justify-between">
                        <span>Built by RGAMER • Reyansh Verma</span>
                        <button 
                          type="button"
                          onClick={() => {
                            setIsInputModelSelectorOpen(false);
                            openSettings('capabilities');
                          }}
                          className="text-indigo-400 hover:text-indigo-300 font-medium"
                        >
                          Specs & Details →
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Send Button */}
                <button 
                  type="submit"
                  disabled={!input.trim() || isLoading || !sessionId || isSessionFrozen}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl disabled:opacity-40 disabled:hover:bg-indigo-600 transition-all hover:scale-105 active:scale-95 shadow-md shadow-indigo-900/30 flex items-center gap-2"
                  title="Send message"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </form>
          
          <div className="flex items-center justify-center gap-3 text-center mt-2 text-[10px] text-stone-500">
            <span className="font-mono text-indigo-400 font-semibold">RGAMER AI VERSION 1.0.0</span>
            <span>•</span>
            <span>Verify important code or 3D commands</span>
            <span>•</span>
            <button onClick={() => openSettings('privacy')} className="hover:text-stone-400 underline">Policies</button>
            <span>•</span>
            <button onClick={() => setIsDownloadModalOpen(true)} className="hover:text-cyan-300 underline text-cyan-400 font-medium flex items-center gap-1">
              <Download className="w-3 h-3"/> Download App (.exe) for Power Models
            </button>
          </div>
        </div>
      </div>

      {/* Out of Energy Modal (Silent Energy System notification) */}
      {isOutOfEnergyOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#18181c] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Daily AI Power Exhausted</h3>
            <p className="text-xs text-stone-400 leading-relaxed mb-6">
              You have used up your daily AI energy quota for this request. Free accounts receive an automatic refill of <span className="text-emerald-400 font-semibold">+1,000 Power (100 daily chats)</span> every single day (up to the 1,500 maximum cap).
              <br /><br />
              Need to generate unlimited complex code, 5-second videos, or images without waiting? Upgrade your plan for instant power refills.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsOutOfEnergyOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 text-xs font-medium transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setIsOutOfEnergyOpen(false);
                  openSettings('billing');
                }}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-900/30 flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Upgrade Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Under Construction Modal */}
      {isUnderConstructionOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#18181c] border border-white/10 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Currently Under Construction</h3>
            <p className="text-sm text-stone-400 leading-relaxed mb-6">
              The <strong>Video Generation Model</strong> is currently under development. Our team is working hard to bring you the best cinematic AI experience soon.
              <br/><br/>
              Please check back later or use one of our other available AI models!
            </p>
            <div className="flex items-center justify-center">
              <button
                onClick={() => setIsUnderConstructionOpen(false)}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition shadow-lg shadow-indigo-900/30"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OS Permission Modal for Desktop App */}
      {isOsPermissionModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#121215] border border-amber-500/30 rounded-2xl max-w-lg w-full p-8 shadow-[0_0_80px_rgba(245,158,11,0.15)] text-center animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500"></div>
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl"></div>
            
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-6 border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
              <ShieldAlert className="w-8 h-8" />
            </div>
            
            <h3 className="text-2xl font-black text-white mb-3 tracking-tight">⚠️ SYSTEM ACCESS REQUIRED</h3>
            
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm text-stone-300 leading-relaxed mb-3">
                <strong>RGAMER Power Model</strong> is a highly advanced AI that can execute code directly on your computer and control software like Blender.
              </p>
              <div className="flex items-start gap-2 pt-3 border-t border-white/10">
                <Cpu className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-stone-400 leading-relaxed">
                  It requires explicit permission to <strong className="text-emerald-400">read/write local files</strong> and <strong className="text-emerald-400">run Python scripts</strong> natively on your operating system.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setIsOsPermissionModalOpen(false)}
                className="flex-1 py-3.5 rounded-xl bg-transparent hover:bg-white/5 border border-white/10 text-stone-300 text-sm font-bold transition"
              >
                Deny Access
              </button>
              <button
                onClick={async () => {
                  setIsOsPermissionModalOpen(false);
                  setIsScanningSpecs(true);
                  
                  let specs = null;
                  try {
                    // Try to get specs via Electron IPC
                    // @ts-ignore
                    const { ipcRenderer } = window.require('electron');
                    specs = await ipcRenderer.invoke('get-system-specs');
                  } catch (e) {
                    // Fallback for browser preview or if electron is unavailable
                    specs = {
                      cpu: 'Intel Core i9 / AMD Ryzen 9 (Simulated)',
                      cores: 16,
                      ram: '32 GB',
                      os: 'Windows 11 (x64)'
                    };
                  }
                  
                  // Simulate scan time for visual effect
                  setTimeout(() => {
                    setScannedSpecs(specs);
                    localStorage.setItem('rgamer_os_permission_granted', 'true');
                    localStorage.setItem('rgamer_system_specs', JSON.stringify(specs));
                    
                    // Show success briefly before unlocking
                    setTimeout(() => {
                      setIsScanningSpecs(false);
                      handleVersionChange('RGAMER POWER MODEL');
                    }, 2500);
                  }, 2000);
                }}
                className="flex-1 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold transition shadow-lg shadow-amber-900/40 flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" /> Grant OS Permission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hardware Scanning Modal */}
      {isScanningSpecs && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#121215] border border-emerald-500/30 rounded-2xl max-w-md w-full p-8 shadow-[0_0_80px_rgba(16,185,129,0.15)] text-center animate-in fade-in duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500"></div>
            
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              {scannedSpecs ? <ShieldCheck className="w-8 h-8 animate-in zoom-in" /> : <Cpu className="w-8 h-8 animate-pulse" />}
            </div>
            
            <h3 className="text-xl font-black text-white mb-2 tracking-tight">
              {scannedSpecs ? 'HARDWARE PROFILED' : 'SCANNING HARDWARE...'}
            </h3>
            
            <p className="text-sm text-stone-400 mb-6">
              {scannedSpecs 
                ? 'Optimizing RGAMER Power Model for your specific system capabilities.' 
                : 'Detecting CPU, RAM, and OS to safely scale AI output for your PC...'}
            </p>

            {scannedSpecs ? (
              <div className="bg-black/50 border border-white/5 rounded-xl p-4 text-left animate-in slide-in-from-bottom-4">
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-stone-500">OS</span>
                    <span className="text-emerald-400 text-right">{scannedSpecs.os}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">CPU</span>
                    <span className="text-emerald-400 text-right">{scannedSpecs.cpu} ({scannedSpecs.cores} Cores)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">RAM</span>
                    <span className="text-emerald-400 text-right">{scannedSpecs.ram}</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 text-center text-xs text-stone-400">
                  Model unlocking...
                </div>
              </div>
            ) : (
              <div className="w-full bg-stone-900 rounded-full h-1.5 mb-2 overflow-hidden">
                <div className="bg-emerald-500 h-1.5 rounded-full w-2/3 animate-[pulse_1s_ease-in-out_infinite]"></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Power Model Restriction Modal */}
      {isPowerModelModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#121215] border border-rose-500/30 rounded-2xl max-w-lg w-full p-8 shadow-[0_0_80px_rgba(244,63,94,0.15)] text-center animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500"></div>
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl"></div>
            
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-6 border border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.2)]">
              <Cpu className="w-8 h-8" />
            </div>
            
            <h3 className="text-2xl font-black text-white mb-3 tracking-tight">POWER MODEL REQUIRES DESKTOP APP</h3>
            
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm text-stone-300 leading-relaxed">
                To unleash the full potential of direct hardware-level integration and prevent your browser from freezing, please use our official <strong className="text-rose-400">.exe</strong> application.
              </p>
              <div className="flex items-start gap-2 mt-3 pt-3 border-t border-white/10">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-stone-400 leading-relaxed">
                  <strong className="text-stone-300">Note:</strong> This model is highly recommended for Blender Users and 3D Artists only. For standard coding or chat, please continue using the Web models.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => setIsPowerModelModalOpen(false)}
                className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold transition shadow-lg shadow-rose-900/40 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Download RGAMER AI (.exe)
              </button>
              <button
                onClick={() => setIsPowerModelModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-transparent hover:bg-white/5 text-stone-400 hover:text-stone-300 text-xs font-medium transition"
              >
                Continue using Web Models
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Claude & Gemini Inspired Full Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentUser={currentUser}
        activeTab={settingsActiveTab}
        chatCount={sessions.length}
        maxChats={5}
        activeVersion={activeVersion}
        setActiveVersion={handleVersionChange}
        onLogout={logout}
        onClearChats={() => clearChat(sessionId)}
      />

      {/* Official Brand Logo Showcase & Watermark Modal */}
      <LogoShowcaseModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
      />

      {/* Official Download App (.exe) Modal */}
      <DownloadAppModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />
    </div>
  );
}

