import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings as SettingsIcon, 
  User, 
  ShieldCheck, 
  CreditCard, 
  Cpu, 
  Sun, 
  Moon, 
  Monitor, 
  Check, 
  Zap, 
  Lock, 
  Sparkles, 
  Code, 
  FileText, 
  Search,
  ExternalLink,
  ChevronRight,
  LogOut,
  Shield,
  FileCheck,
  CheckCircle2,
  Info,
  Award,
  Video
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { RGAMER_POLICIES } from '../data/policies';
import { RGAMER_MODELS } from '../data/models';
import { LogoIcon } from './LogoIcons';
import { UserPowerState, updateUserPlanTier } from '../lib/powerManager';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FirebaseUser | null;
  activeTab?: string;
  chatCount: number;
  maxChats: number;
  activeVersion: string;
  setActiveVersion: (v: string) => void;
  onLogout: () => void;
  onClearChats: () => void;
  userPowerState?: UserPowerState | null;
  onPlanChanged?: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  currentUser,
  activeTab: initialTab = 'general',
  chatCount,
  maxChats,
  activeVersion,
  setActiveVersion,
  onLogout,
  onClearChats,
  userPowerState,
  onPlanChanged
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>('privacy');
  const [searchQuery, setSearchQuery] = useState('');
  const [upgradingTier, setUpgradingTier] = useState<string | null>(null);

  const currentTier = userPowerState?.tier || 'free';

  const handleUpgrade = async (tier: 'free' | 'pro' | 'gamer') => {
    if (!currentUser) return;
    try {
      setUpgradingTier(tier);
      await updateUserPlanTier(currentUser.uid, tier);
      onPlanChanged?.();
    } catch (err) {
      console.error("Failed to update plan tier:", err);
    } finally {
      setUpgradingTier(null);
    }
  };

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Persistent user preferences in localStorage
  const [fullName, setFullName] = useState(() => {
    return localStorage.getItem('rgamer_user_fullname') || currentUser?.displayName || 'RGAMER';
  });
  const [nickname, setNickname] = useState(() => {
    return localStorage.getItem('rgamer_user_nickname') || currentUser?.displayName || 'RGAMER';
  });
  const [workRole, setWorkRole] = useState(() => {
    return localStorage.getItem('rgamer_user_role') || '3D Artist & Blender Developer';
  });
  const [customInstructions, setCustomInstructions] = useState(() => {
    return localStorage.getItem('rgamer_user_instructions') || '';
  });
  const [appearance, setAppearance] = useState<'dark' | 'light' | 'system'>(() => {
    return (localStorage.getItem('rgamer_theme') as any) || 'dark';
  });
  const [saveNotification, setSaveNotification] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = () => {
    localStorage.setItem('rgamer_user_fullname', fullName);
    localStorage.setItem('rgamer_user_nickname', nickname);
    localStorage.setItem('rgamer_user_role', workRole);
    localStorage.setItem('rgamer_user_instructions', customInstructions);
    localStorage.setItem('rgamer_theme', appearance);
    setSaveNotification(true);
    setTimeout(() => setSaveNotification(false), 2500);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon, description: 'Profile, custom instructions & preferences' },
    { id: 'account', label: 'Account', icon: User, description: 'Email, usage quota & session data' },
    { id: 'billing', label: 'Billing & Plans', icon: CreditCard, description: 'Free Tier, PRO & GAMER Tier' },
    { id: 'capabilities', label: 'AI Capabilities', icon: Cpu, description: 'Models, Blender scripts & Image Gen' },
    { id: 'privacy', label: 'Privacy & Policies', icon: ShieldCheck, description: 'Safety rules & data isolation' },
  ];

  const filteredTabs = tabs.filter(t => 
    t.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div 
        className="bg-[#121214] border border-white/10 rounded-2xl w-full max-w-4xl h-[620px] max-h-[92vh] flex flex-col md:flex-row overflow-hidden shadow-2xl shadow-black/80"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Navigation Sidebar (Claude style) */}
        <div className="w-full md:w-64 bg-[#18181b] border-r border-white/10 flex flex-col shrink-0">
          {/* Search bar */}
          <div className="p-4 border-b border-white/10">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search settings..."
                className="w-full bg-[#202024] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 transition"
              />
            </div>
          </div>

          {/* Tab Categories */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
            <div className="px-3 pt-2 pb-1 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
              Settings
            </div>

            {filteredTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left group ${
                    isActive 
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' 
                      : 'text-stone-400 hover:text-stone-200 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-indigo-400' : 'text-stone-400'}`} />
                  <span className="truncate">{tab.label}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-indigo-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Quick Account Footer inside Settings Nav */}
          <div className="p-3 border-t border-white/10 bg-[#141416] flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center text-xs font-bold shrink-0">
                {currentUser?.displayName?.charAt(0) || 'R'}
              </div>
              <div className="truncate text-xs">
                <p className="text-white font-medium truncate">{nickname || 'RGAMER'}</p>
                <p className="text-stone-500 text-[10px] truncate">{currentUser?.email}</p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="p-1.5 text-stone-400 hover:text-rose-400 hover:bg-white/5 rounded-lg transition"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col bg-[#111113] overflow-hidden">
          {/* Header */}
          <div className="h-14 px-6 border-b border-white/10 flex items-center justify-between bg-[#141417]">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wide">
                {tabs.find(t => t.id === activeTab)?.label || 'Settings'}
              </h2>
              {saveNotification && (
                <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full animate-in fade-in">
                  <Check className="w-3 h-3" /> Saved
                </span>
              )}
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content per Tab */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            {/* TAB: GENERAL (Claude style) */}
            {activeTab === 'general' && (
              <div className="space-y-6 max-w-xl">
                <div>
                  <h3 className="text-sm font-semibold text-white tracking-wide uppercase text-[11px] text-stone-400 mb-3">Profile</h3>
                  
                  {/* Avatar row */}
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xl font-bold text-indigo-300 shrink-0 overflow-hidden shadow-inner">
                      {currentUser?.photoURL ? (
                        <img src={currentUser.photoURL} alt="User" className="w-full h-full object-cover" />
                      ) : (
                        nickname.charAt(0).toUpperCase() || 'R'
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{nickname || 'RGAMER User'}</h4>
                      <p className="text-xs text-stone-400 mt-0.5">{currentUser?.email || 'No email attached'}</p>
                      <p className="text-[11px] text-indigo-400 mt-1">Profile synced with your Google account</p>
                    </div>
                  </div>

                  {/* Inputs */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-stone-300 mb-1.5">Full name</label>
                      <input 
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-[#1c1c20] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/80 transition"
                        placeholder="e.g. RGAMER"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone-300 mb-1.5">What should RGAMER AI call you?</label>
                      <input 
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="w-full bg-[#1c1c20] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/80 transition"
                        placeholder="e.g. Reyansh, Boss, RGAMER"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone-300 mb-1.5">What best describes your work?</label>
                      <select 
                        value={workRole}
                        onChange={(e) => setWorkRole(e.target.value)}
                        className="w-full bg-[#1c1c20] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/80 transition"
                      >
                        <option value="3D Artist & Blender Developer">3D Artist & Blender Developer</option>
                        <option value="Indie Game Developer">Indie Game Developer</option>
                        <option value="Software Engineer & Coder">Software Engineer & Coder</option>
                        <option value="Student & Learner">Student & Learner</option>
                        <option value="Content Creator & Designer">Content Creator & Designer</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Custom Instructions (Claude / Gemini style) */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-medium text-stone-300">Instructions for RGAMER AI</label>
                        <span className="text-[10px] text-stone-500">Persisted across all chats</span>
                      </div>
                      <p className="text-[11px] text-stone-400 mb-2">
                        RGAMER AI will keep these in mind for every prompt and response you generate.
                      </p>
                      <textarea
                        rows={3}
                        value={customInstructions}
                        onChange={(e) => setCustomInstructions(e.target.value)}
                        placeholder="e.g. Keep code explanations brief, always use bpy module for Blender 4.x, prioritize clean formatting..."
                        className="w-full bg-[#1c1c20] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-indigo-500/80 transition resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                </div>

                {/* Preferences section */}
                <div className="pt-4 border-t border-white/10">
                  <h3 className="text-sm font-semibold text-white tracking-wide uppercase text-[11px] text-stone-400 mb-3">Preferences</h3>

                  {/* Appearance */}
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-stone-300 mb-2">Appearance</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setAppearance('dark')}
                        className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition ${
                          appearance === 'dark' 
                            ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-200' 
                            : 'bg-white/[0.02] border-white/5 text-stone-400 hover:bg-white/[0.05]'
                        }`}
                      >
                        <Moon className="w-3.5 h-3.5" /> Dark Mode
                      </button>
                      <button
                        type="button"
                        onClick={() => setAppearance('light')}
                        className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition ${
                          appearance === 'light' 
                            ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-200' 
                            : 'bg-white/[0.02] border-white/5 text-stone-400 hover:bg-white/[0.05]'
                        }`}
                      >
                        <Sun className="w-3.5 h-3.5" /> Light Mode
                      </button>
                      <button
                        type="button"
                        onClick={() => setAppearance('system')}
                        className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition ${
                          appearance === 'system' 
                            ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-200' 
                            : 'bg-white/[0.02] border-white/5 text-stone-400 hover:bg-white/[0.05]'
                        }`}
                      >
                        <Monitor className="w-3.5 h-3.5" /> System Default
                      </button>
                    </div>
                  </div>

                  {/* AI Version Selector */}
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1.5">AI Engine & Model Version</label>
                    <select
                      value={activeVersion}
                      onChange={(e) => setActiveVersion(e.target.value)}
                      className="w-full bg-[#1c1c20] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/80 transition"
                    >
                      <option value="RGAMER ALLROUNDER">RGAMER ALLROUNDER (Default - High Speed & General Code)</option>
                      <option value="RGAMER CODER">RGAMER CODER (Python & Blender bpy Specialist)</option>
                      <option value="RGAMER VISION">RGAMER VISION (Visual generation & image prompt engineering)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSaveProfile}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition shadow-lg shadow-indigo-900/30 flex items-center gap-2"
                  >
                    <Check className="w-3.5 h-3.5" /> Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* TAB: ACCOUNT */}
            {activeTab === 'account' && (
              <div className="space-y-6 max-w-xl">
                <div>
                  <h3 className="text-sm font-semibold text-white tracking-wide uppercase text-[11px] text-stone-400 mb-3">Account Details</h3>
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-stone-400">Email Address</span>
                      <span className="text-white font-mono">{currentUser?.email}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-stone-400">Account ID (UID)</span>
                      <span className="text-stone-300 font-mono text-[11px] truncate max-w-[200px]">{currentUser?.uid}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-stone-400">Current Plan</span>
                      <span className="text-indigo-400 font-semibold uppercase text-[11px] bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">Free Tier</span>
                    </div>
                  </div>
                </div>

                {/* Chat Quota progress */}
                <div>
                  <h3 className="text-sm font-semibold text-white tracking-wide uppercase text-[11px] text-stone-400 mb-3">Storage & Chat Quota</h3>
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-stone-300 font-medium">Saved Chats Usage</span>
                      <span className="text-indigo-300 font-bold">{chatCount} / {maxChats} Used</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${chatCount >= maxChats ? 'bg-amber-500' : 'bg-indigo-500'}`}
                        style={{ width: `${Math.min(100, (chatCount / maxChats) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      Free tier accounts can store up to {maxChats} simultaneous chat sessions with isolated message history. Upgrade to PRO for unlimited concurrent chats.
                    </p>
                  </div>
                </div>

                {/* Session management */}
                <div className="pt-2">
                  <h3 className="text-sm font-semibold text-rose-400 tracking-wide uppercase text-[11px] mb-3">Danger Zone</h3>
                  <div className="p-4 rounded-xl bg-rose-500/[0.04] border border-rose-500/20 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-white">Clear Active Chat Data</h4>
                      <p className="text-[11px] text-stone-400 mt-0.5">Delete all messages from current chat session permanently.</p>
                    </div>
                    <button
                      onClick={() => {
                        onClearChats();
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-medium transition"
                    >
                      Delete Chat
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: BILLING & PLANS (Claude & Gemini style) */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-white tracking-wide uppercase text-[11px] text-stone-400 mb-1">Subscriptions</h3>
                  <p className="text-xs text-stone-400 mb-4">Choose the plan that fits your 3D workflow and coding volume.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {/* Free Plan */}
                  <div className="bg-[#18181c] border border-white/10 rounded-2xl p-5 flex flex-col relative">
                    <div className="mb-4">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 bg-white/5 px-2 py-0.5 rounded">Standard</span>
                      <h4 className="text-base font-bold text-white mt-2">Free Plan</h4>
                      <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-2xl font-black text-white">$0</span>
                        <span className="text-xs text-stone-400">/ forever</span>
                      </div>
                    </div>
                    <ul className="text-xs text-stone-300 space-y-2.5 mb-6 flex-1">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="font-semibold text-emerald-300">1,500 Starting Power (Cap: 1,500)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-stone-300">+100 Daily Refill (up to cap)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Up to 5 persistent chats</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>All 4 Specialized RGAMER AI Models</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Blender 3D bpy & Code generator</span>
                      </li>
                    </ul>
                    {currentTier === 'free' ? (
                      <button className="w-full py-2 bg-stone-800 border border-white/5 text-stone-300 rounded-xl font-medium text-xs cursor-default">
                        Active Plan
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleUpgrade('free')}
                        disabled={upgradingTier !== null}
                        className="w-full py-2 bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white rounded-xl font-medium text-xs transition"
                      >
                        {upgradingTier === 'free' ? 'Switching...' : 'Switch to Free'}
                      </button>
                    )}
                  </div>

                  {/* PRO Plan */}
                  <div className={`bg-gradient-to-b from-indigo-950/40 to-[#18181c] border ${currentTier === 'pro' ? 'border-indigo-400 ring-2 ring-indigo-500/50' : 'border-indigo-500/40'} rounded-2xl p-5 flex flex-col relative shadow-lg shadow-indigo-950/30`}>
                    <div className="absolute -top-2.5 right-4 bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow">
                      {currentTier === 'pro' ? 'Active Tier' : 'Popular'}
                    </div>
                    <div className="mb-4">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">Pro Coder</span>
                      <h4 className="text-base font-bold text-white mt-2">PRO</h4>
                      <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-2xl font-black text-white">$9.99</span>
                        <span className="text-xs text-stone-400">/ month</span>
                      </div>
                    </div>
                    <ul className="text-xs text-stone-300 space-y-2.5 mb-6 flex-1">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="font-semibold text-indigo-300">2,500 Starting Power (Cap: 2,500)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="text-white font-medium">+666 Daily Refill (up to cap)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="font-semibold text-white">Unlimited persistent chats</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>Priority GPU compute queue</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>High-res 4K visual generation</span>
                      </li>
                    </ul>
                    <button 
                      onClick={() => handleUpgrade('pro')}
                      disabled={currentTier === 'pro' || upgradingTier !== null}
                      className={`w-full py-2 ${currentTier === 'pro' ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 cursor-default' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-900/30'} rounded-xl font-medium text-xs transition`}
                    >
                      {currentTier === 'pro' ? 'Current Active Plan' : upgradingTier === 'pro' ? 'Upgrading...' : 'Upgrade to PRO'}
                    </button>
                  </div>

                  {/* GAMER Tier */}
                  <div className={`bg-gradient-to-b from-amber-950/30 to-[#18181c] border ${currentTier === 'gamer' ? 'border-amber-400 ring-2 ring-amber-500/50' : 'border-amber-500/40'} rounded-2xl p-5 flex flex-col relative shadow-lg shadow-amber-950/20`}>
                    <div className="mb-4">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1 w-fit">
                        <Zap className="w-3 h-3 text-amber-400" /> {currentTier === 'gamer' ? 'Active Tier' : 'Ultimate'}
                      </span>
                      <h4 className="text-base font-bold text-white mt-2">GAMER Tier</h4>
                      <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-2xl font-black text-white">$19.99</span>
                        <span className="text-xs text-stone-400">/ month</span>
                      </div>
                    </div>
                    <ul className="text-xs text-stone-300 space-y-2.5 mb-6 flex-1">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="font-semibold text-amber-300">5,000 Starting Power (Cap: 5,000)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="text-white font-medium">+999 Daily Refill (up to cap)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="font-semibold text-white">Everything in PRO</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Maximum GPU compute speed</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>VIP Creator badge</span>
                      </li>
                    </ul>
                    <button 
                      onClick={() => handleUpgrade('gamer')}
                      disabled={currentTier === 'gamer' || upgradingTier !== null}
                      className={`w-full py-2 ${currentTier === 'gamer' ? 'bg-amber-500/30 text-amber-200 border border-amber-500/40 cursor-default' : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 shadow-md shadow-amber-900/30'} font-bold text-xs rounded-xl transition`}
                    >
                      {currentTier === 'gamer' ? 'Current Active Tier' : upgradingTier === 'gamer' ? 'Upgrading...' : 'Get GAMER Tier'}
                    </button>
                  </div>
                </div>

                {/* Power Consumption Specs Card */}
                <div className="mt-6 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200">Power Consumption Rules</h4>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-black/20 border border-white/5">
                      <p className="text-stone-400 text-[11px]">Normal Chat</p>
                      <p className="text-white font-bold text-sm mt-0.5">10 Power</p>
                    </div>
                    <div className="p-3 rounded-lg bg-black/20 border border-white/5">
                      <p className="text-stone-400 text-[11px]">Image Generation</p>
                      <p className="text-purple-400 font-bold text-sm mt-0.5">15 Power</p>
                    </div>
                    <div className="p-3 rounded-lg bg-black/20 border border-white/5">
                      <p className="text-stone-400 text-[11px]">5s Video Generation</p>
                      <p className="text-amber-400 font-bold text-sm mt-0.5">20 Power</p>
                    </div>
                    <div className="p-3 rounded-lg bg-black/20 border border-white/5">
                      <p className="text-stone-400 text-[11px]">Code Generation</p>
                      <p className="text-emerald-400 font-bold text-sm mt-0.5">25 Power</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-3 leading-relaxed">
                    * Power deductions occur seamlessly in the background. If balance reaches zero, the session halts until next day's automatic refill or tier upgrade.
                  </p>
                </div>
              </div>
            )}

            {/* TAB: CAPABILITIES */}
            {activeTab === 'capabilities' && (
              <div className="space-y-4 max-w-xl">
                <div>
                  <h3 className="text-sm font-semibold text-white tracking-wide uppercase text-[11px] text-stone-400 mb-1">Active AI Engines & Specialized Models</h3>
                  <p className="text-xs text-stone-400 mb-4">RGAMER AI includes 4 world-class tailored models trained by RGAMER & Reyansh Verma from India.</p>
                </div>

                <div className="space-y-3">
                  {RGAMER_MODELS.map((model) => (
                    <div key={model.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{model.name}</h4>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${model.badgeColor}`}>
                              {model.tag}
                            </span>
                          </div>
                          <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                            {model.description}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono font-semibold text-stone-300 bg-white/5 px-2.5 py-1 rounded-full border border-white/10 shrink-0">
                          VERSION {model.version}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-2 border-t border-white/5 mt-3">
                        {model.capabilities.map((cap, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-[11px] text-stone-400">
                            <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span className="truncate">{cap}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: PRIVACY & POLICIES */}
            {activeTab === 'privacy' && (() => {
              const currentPolicy = RGAMER_POLICIES.find(p => p.id === selectedPolicyId) || RGAMER_POLICIES[0];

              return (
                <div className="space-y-6 max-w-2xl">
                  {/* Top Header */}
                  <div>
                    <h3 className="text-sm font-semibold text-white tracking-wide uppercase text-[11px] text-stone-400 mb-1">
                      Legal, Privacy & Safety Center
                    </h3>
                    <p className="text-xs text-stone-400">
                      Transparency, complete data isolation, and responsible AI practices for RGAMER AI.
                    </p>
                  </div>

                  {/* 4 Trust Highlights */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                      <Lock className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
                      <p className="text-[11px] font-semibold text-white">100% Isolated</p>
                      <p className="text-[9px] text-stone-400">Locked to your UID</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                      <p className="text-[11px] font-semibold text-white">Zero Selling</p>
                      <p className="text-[9px] text-stone-400">No ad brokers</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                      <Award className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                      <p className="text-[11px] font-semibold text-white">Watermark Rule</p>
                      <p className="text-[9px] text-stone-400">Made by RGAMER AI</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
                      <Sparkles className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                      <p className="text-[11px] font-semibold text-white">Family-Safe</p>
                      <p className="text-[9px] text-stone-400">Strict 18+ filter</p>
                    </div>
                  </div>

                  {/* Policy Category Navigation Pills */}
                  <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-[#18181c] border border-white/10">
                    {RGAMER_POLICIES.map((policy) => {
                      const isActive = selectedPolicyId === policy.id;
                      return (
                        <button
                          key={policy.id}
                          onClick={() => setSelectedPolicyId(policy.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition ${
                            isActive 
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30' 
                              : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
                          }`}
                        >
                          {policy.id === 'privacy' && <ShieldCheck className="w-3.5 h-3.5" />}
                          {policy.id === 'commercial' && <Award className="w-3.5 h-3.5" />}
                          {policy.id === 'terms' && <FileText className="w-3.5 h-3.5" />}
                          {policy.id === 'safety' && <Lock className="w-3.5 h-3.5" />}
                          {policy.id === 'credits' && <Sparkles className="w-3.5 h-3.5" />}
                          <span>{policy.title}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Policy Header */}
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-base font-bold text-white">{currentPolicy.title}</h4>
                        <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                          {currentPolicy.badge}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400">{currentPolicy.description}</p>
                    </div>
                    <span className="text-[10px] text-stone-500 shrink-0 font-mono">
                      Last updated: {currentPolicy.lastUpdated}
                    </span>
                  </div>

                  {/* Mandatory Watermark / Commercial Notice Callout Banner */}
                  {currentPolicy.id === 'commercial' && (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                      <Award className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-amber-300">
                          Commercial Use & Watermark Attribution Requirement
                        </p>
                        <p className="text-xs text-stone-300 leading-relaxed">
                          When using AI-generated images, renders, or videos for commercial monetization or video productions, you <strong>must not remove the RGAMER AI watermark</strong>. If the watermark is removed or not visible, you are legally required to show the official RGAMER AI logo or prominently include the credit: <strong>&ldquo;Made by RGAMER AI&rdquo;</strong> (or <strong>&ldquo;Powered by RGAMER AI&rdquo;</strong>) on the screen or in product credits.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Render All Policy Articles & Points */}
                  <div className="space-y-4">
                    {currentPolicy.items.map((item, index) => (
                      <div 
                        key={index}
                        className="p-4 rounded-xl bg-[#16161a] border border-white/5 space-y-2 hover:border-white/10 transition"
                      >
                        <h5 className="text-xs font-bold text-white flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                          {item.title}
                        </h5>
                        <p className="text-xs text-stone-300 leading-relaxed pl-3.5">
                          {item.text}
                        </p>
                        
                        {item.points && item.points.length > 0 && (
                          <div className="pt-2 pl-3.5 space-y-1.5">
                            {item.points.map((point, pIdx) => (
                              <div key={pIdx} className="flex items-start gap-2 text-xs text-stone-400">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                <span className="leading-snug">{point}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Creator Signature Note */}
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-black border border-indigo-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-black/60 flex items-center justify-center border border-white/10 shadow">
                        <LogoIcon size={20} animated={true} withGlow={true} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white flex items-center gap-1.5">
                          RGAMER AI Platform
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">BRAND R</span>
                        </p>
                        <p className="text-[10px] text-stone-400">Created with dedication by Reyansh Verma (RGAMER)</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                      Active &amp; Protected
                    </span>
                  </div>
                </div>
              );
            })()}

          </div>
        </div>
      </div>
    </div>
  );
}
