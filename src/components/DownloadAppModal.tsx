import React, { useState } from 'react';
import { Download, Monitor, Sparkles, X, CheckCircle, ExternalLink, ShieldCheck, Cpu } from 'lucide-react';
import { LogoIcon } from './LogoIcons';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DownloadAppModal({ isOpen, onClose }: DownloadAppModalProps) {
  const [downloadStarted, setDownloadStarted] = useState(false);

  // Official Direct 1-Click .exe Download URL (Direct binary from GitHub Release CDN)
  const directDownloadUrl = "https://github.com/Mr-RGAMER/rgamer-ai-desktop/releases/download/v1.0.0/RGAMER.AI.Setup.1.0.0.exe";
  const releasePageUrl = "https://github.com/Mr-RGAMER/rgamer-ai-desktop/releases/tag/v1.0.0";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-[#121217] border border-cyan-500/30 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl shadow-cyan-950/50 relative overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient background */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon and Badge */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-black/80 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.3)]">
            <LogoIcon size={34} animated={true} withGlow={true} />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3 text-cyan-400" /> Windows Desktop Edition
            </div>
            <h3 className="text-xl font-extrabold text-white tracking-tight">RGAMER AI for Windows</h3>
          </div>
        </div>

        {/* Promo Pitch */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 mb-5 space-y-2">
          <p className="text-xs text-stone-200 font-medium leading-relaxed">
            🚀 <strong className="text-cyan-300">Download Our App To Use Our Upcoming Power Model!</strong>
          </p>
          <p className="text-[11px] text-stone-400 leading-relaxed">
            Experience ultra-low latency, native desktop multitasking, seamless Blender 3D integration, and exclusive early access to upcoming high-compute RGAMER Power Models.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="space-y-2.5 mb-6 text-xs text-stone-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Dedicated window with hardware acceleration & zero tab clutter</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Instant Google & Firebase OAuth sign-in persistence</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Official RGAMER Neon R Icon & taskbar integration</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Exclusive early rollout channel for upcoming Power AI models</span>
          </div>
        </div>

        {/* Download Action Buttons */}
        <div className="space-y-3">
          <a
            href={directDownloadUrl}
            download="RGAMER.AI.Setup.1.0.0.exe"
            onClick={() => setDownloadStarted(true)}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-sm transition shadow-lg shadow-cyan-950/60 flex items-center justify-center gap-2 group cursor-pointer"
          >
            <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            <span>Direct Download (.exe)</span>
            <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded-full text-cyan-200 border border-white/10 font-normal">73.7 MB</span>
          </a>

          {downloadStarted && (
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-center animate-in fade-in">
              <p className="text-xs text-cyan-300 font-semibold">
                ✓ Downloading installer directly in your browser!
              </p>
              <p className="text-[10px] text-stone-400 mt-0.5">
                Run the downloaded installer to launch RGAMER AI Desktop.
              </p>
            </div>
          )}

          <div className="flex items-center justify-center text-[11px] text-stone-400 pt-1 px-1">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Official Verified Release
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
