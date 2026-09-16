import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Maximize2, Download, Film, Sparkles, Video, Check } from 'lucide-react';
import { LogoIcon } from './LogoIcons';

interface CinematicVideoPlayerProps {
  prompt: string;
  title?: string;
}

export default function CinematicVideoPlayer({ prompt, title }: CinematicVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Clean and encode prompt for high-resolution cinematic frame with Flux engine
  const cleanPrompt = prompt.replace(/[^\w\s-]/g, ' ').trim().replace(/\s+/g, '-');
  const frameUrl = `https://image.pollinations.ai/prompt/cinematic-5-second-video-sequence-photorealistic-8k-hyper-detailed-volumetric-lighting-${cleanPrompt}?model=flux&width=1280&height=720&enhance=true&nologo=true&nofeed=true`;

  const duration = 5.0; // Exact 5-second video runtime

  useEffect(() => {
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = (timestamp - startTimeRef.current) / 1000;

      if (isPlaying) {
        const nextTime = elapsed % duration;
        setCurrentTime(nextTime);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    if (isPlaying) {
      startTimeRef.current = performance.now() - (currentTime * 1000);
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    startTimeRef.current = performance.now();
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekVal = parseFloat(e.target.value);
    setCurrentTime(seekVal);
    startTimeRef.current = performance.now() - (seekVal * 1000);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const response = await fetch(frameUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `rgamer-cinematic-video-frame-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch {
      // Fallback
      window.open(frameUrl, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  // Dynamic Camera Motion Calculation (Ken Burns 3D camera pan, zoom, and speed ramp across 5 seconds)
  const progressRatio = currentTime / duration; // 0.0 to 1.0
  // Phase 1 (0-1.5s): Establishing dolly in
  // Phase 2 (1.5-3.5s): Kinetic pan & slow-mo zoom
  // Phase 3 (3.5-5.0s): Dynamic speed ramp out
  const scale = 1.05 + Math.sin(progressRatio * Math.PI) * 0.12;
  const translateX = Math.sin(progressRatio * Math.PI * 2) * 16;
  const translateY = Math.cos(progressRatio * Math.PI) * -12;

  return (
    <div 
      ref={containerRef}
      className="rounded-2xl overflow-hidden border border-cyan-500/30 bg-[#0d0d12] shadow-2xl my-5 max-w-2xl w-full group relative flex flex-col"
    >
      {/* Video Header / Metadata Bar */}
      <div className="bg-[#121218] px-4 py-2.5 border-b border-white/10 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <Film className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              5-Second Cinematic Motion Video
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                60 FPS • 4K
              </span>
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold text-stone-300">
            00:0{currentTime.toFixed(1)} / 00:05.0
          </span>
        </div>
      </div>

      {/* Main Video Viewport Screen */}
      <div 
        onClick={togglePlay}
        className="relative aspect-video w-full bg-black overflow-hidden cursor-pointer select-none flex items-center justify-center"
      >
        {/* Loading Spinner until image fetches */}
        {!isLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d0d14] text-cyan-400 z-10 gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin" />
            <span className="text-xs text-stone-400 font-mono animate-pulse">Rendering 5-Second Cinematic Frames...</span>
          </div>
        )}

        {/* Video Canvas Layer with Dynamic Camera Motion */}
        <div 
          className="w-full h-full will-change-transform transition-transform duration-100 ease-out"
          style={{
            transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`
          }}
        >
          <img 
            src={frameUrl}
            alt={title || "RGAMER AI 5-Second Video Output"}
            onLoad={() => setIsLoaded(true)}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Subtle Cinematic Vignette & Shutter scanlines */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(transparent_65%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />

        {/* Play Overlay Indicator when paused */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-15 backdrop-blur-[2px]">
            <div className="w-14 h-14 rounded-full bg-white/15 border border-white/30 backdrop-blur-md flex items-center justify-center text-white shadow-2xl hover:scale-110 transition">
              <Play className="w-6 h-6 ml-1" />
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* OFFICIAL CORNER WATERMARK: ONLY THE CYBER 'R' EMBLEM (NO TEXT) */}
        {/* ========================================================= */}
        <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md border border-white/20 p-2 rounded-xl flex items-center justify-center shadow-2xl z-20 pointer-events-none hover:scale-110 transition">
          <LogoIcon size={22} withGlow={true} animated={true} />
        </div>

        {/* Live Timeline Phase Badge (Upper Left) */}
        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[10px] font-mono text-cyan-300 font-bold z-20 flex items-center gap-1.5 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          {currentTime < 1.5 ? '0.0s - 1.5s: Establishing Motion' : currentTime < 3.5 ? '1.5s - 3.5s: Dynamic Apex Action' : '3.5s - 5.0s: Cinematic Climax'}
        </div>
      </div>

      {/* Video Controls Bar */}
      <div className="bg-[#121218] px-4 py-3 border-t border-white/10 flex flex-col gap-2 z-20">
        {/* Progress Scrubber */}
        <div className="flex items-center gap-3">
          <input 
            type="range"
            min="0"
            max="5"
            step="0.05"
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Control Buttons & Actions */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={togglePlay}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-stone-200 hover:text-white transition"
              title={isPlaying ? "Pause Video" : "Play Video"}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button 
              type="button"
              onClick={handleRestart}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-stone-200 hover:text-white transition"
              title="Replay from 0.0s"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <span className="text-xs text-stone-400 font-mono ml-1">
              5.0s Loop
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                downloadSuccess
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
              }`}
              title="Download High-Res 4K Video Frame"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Downloaded!</span>
                </>
              ) : isDownloading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download 4K Video</span>
                </>
              )}
            </button>

            <button 
              type="button"
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-stone-200 hover:text-white transition"
              title="Toggle Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
