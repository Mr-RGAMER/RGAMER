import React, { useState } from 'react';
import { X, Check, Sparkles, Layers, ShieldCheck, Download, Code, Gamepad2, Palette } from 'lucide-react';
import { LogoIcon } from './LogoIcons';

interface LogoShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LogoShowcaseModal({
  isOpen,
  onClose
}: LogoShowcaseModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div 
        className="bg-[#121216] border border-white/10 rounded-2xl w-full max-w-4xl h-[650px] max-h-[92vh] flex flex-col overflow-hidden shadow-2xl shadow-black/90"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#16161b]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center shadow-inner">
              <LogoIcon size={28} animated={true} withGlow={true} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                RGAMER AI — Official Brand "R" Identity
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                  OFFICIAL EMBLEM
                </span>
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                The unified, animated Cyber &ldquo;R&rdquo; crest for Coders, Gamers, and 3D / Video Creators.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white hover:bg-white/10 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Main Hero Emblem Presentation */}
          <div className="rounded-2xl p-6 border border-cyan-500/30 bg-gradient-to-br from-[#121220] via-[#101018] to-[#0c0c12] relative overflow-hidden shadow-xl shadow-cyan-950/30">
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
              {/* Animated Giant Logo Emblem */}
              <div className="w-40 h-40 shrink-0 rounded-2xl bg-[#09090e] border border-white/15 flex items-center justify-center relative shadow-2xl group">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-indigo-500/20 to-purple-500/20 filter blur-lg opacity-75" />
                <LogoIcon size={96} animated={true} withGlow={true} />
              </div>

              {/* Identity details */}
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>The Official Cyber &ldquo;R&rdquo; Crest</span>
                </div>
                <h3 className="text-2xl font-extrabold text-white tracking-wide">
                  RGAMER AI Brand Symbol
                </h3>
                <p className="text-xs text-stone-300 mt-2 leading-relaxed max-w-xl">
                  Featuring the signature <strong>Cyber &ldquo;R&rdquo; Monogram</strong>, flanked by precision coding brackets <code className="text-cyan-400">&lt; &gt;</code>, gaming battlestation neon shield, and titanium aerodynamic kick blade.
                </p>

                {/* Color Palette breakdown */}
                <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-white/10">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Brand Palette:</span>
                  <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
                    <span className="w-3 h-3 rounded-full bg-[#00F5FF] shadow-[0_0_6px_#00F5FF]" />
                    <span className="text-[11px] font-mono text-cyan-300">#00F5FF (Neon Cyan)</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
                    <span className="w-3 h-3 rounded-full bg-[#6366F1] shadow-[0_0_6px_#6366F1]" />
                    <span className="text-[11px] font-mono text-indigo-300">#6366F1 (Electric Indigo)</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
                    <span className="w-3 h-3 rounded-full bg-[#A855F7] shadow-[0_0_6px_#A855F7]" />
                    <span className="text-[11px] font-mono text-purple-300">#A855F7 (Cyber Violet)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Deep Breakdown: Why Coders, Gamers & Creators relate to the "R" */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Coders */}
            <div className="bg-[#14141a] border border-white/10 rounded-2xl p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs">
                <Code className="w-4 h-4" />
                <span>For Coders & Developers</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                Interlocking code brackets <code className="text-cyan-300">&lt; &gt;</code> and sharp algorithmic geometry signal high-performance terminal speed, clean syntax, and developer craftsmanship.
              </p>
            </div>

            {/* Gamers */}
            <div className="bg-[#14141a] border border-white/10 rounded-2xl p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
                <Gamepad2 className="w-4 h-4" />
                <span>For Gamers & Streamers</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                Aerodynamic esports shield with the iconic &ldquo;R&rdquo; for Reyansh Verma (RGAMER). Equipped with pulse-glow RGB battlestation lighting.
              </p>
            </div>

            {/* Image & Video Creators */}
            <div className="bg-[#14141a] border border-white/10 rounded-2xl p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs">
                <Layers className="w-4 h-4" />
                <span>For 3D, Image &amp; Video Creators</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                Precision specular chrome edges and volumetric neon gradients reflect Blender Cycles 3D procedural lighting and 5-second cinematic video render perfection.
              </p>
            </div>
          </div>

          {/* Real-time Watermark Simulation on an Image and Video */}
          <div className="bg-[#14141a] border border-white/10 rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  Live Watermark Appearance on AI Images &amp; Video Renders
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Applied automatically to all generated images, 3D renders, and video animations.
                </p>
              </div>

              <div className="flex items-center bg-[#181820] border border-white/10 px-3 py-1.5 rounded-xl text-xs text-cyan-300 font-mono">
                Official Cyber &ldquo;R&rdquo; Watermark
              </div>
            </div>

            {/* Simulated Visual Canvas */}
            <div className="relative rounded-2xl overflow-hidden border border-white/10 h-64 bg-gradient-to-tr from-slate-950 via-indigo-950/70 to-slate-900 shadow-2xl flex items-center justify-center group">
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#00f5ff_1px,transparent_1px)] [background-size:18px_18px]" />
              
              <div className="text-center z-10 p-4">
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/[0.04] border border-white/10 mb-2">
                  <LogoIcon size={48} animated={true} withGlow={true} />
                </div>
                <p className="text-sm font-semibold text-white">Generated 8K Visual, 3D Render &amp; 5-Second Video Output</p>
                <p className="text-xs text-stone-400 mt-1">
                  Protected with your official animated Cyber &ldquo;R&rdquo; emblem watermark (clean, text-free icon badge)!
                </p>
              </div>

              {/* Watermark in bottom right corner: ONLY the official Cyber 'R' Logo */}
              <div className="absolute bottom-3 right-3 bg-black/80 border border-white/20 p-2 rounded-xl flex items-center justify-center shadow-2xl z-20 backdrop-blur-md hover:scale-110 transition duration-300">
                <LogoIcon size={22} withGlow={true} animated={true} />
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#16161b] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LogoIcon size={22} withGlow={true} />
            <span className="text-xs text-stone-300 font-medium">
              Official Identity: <strong className="text-white">RGAMER AI &ldquo;R&rdquo; Logo</strong>
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-cyan-900/40"
          >
            Done &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
}
