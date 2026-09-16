import React, { useState } from 'react';
import { Download, Sparkles, Check, ExternalLink } from 'lucide-react';
import { LogoIcon } from './LogoIcons';

interface ImageRendererProps {
  src?: string;
  alt?: string;
}

export default function ImageRenderer({ src, alt }: ImageRendererProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  let cleanSrc = typeof src === 'string' ? src : '';
  if (cleanSrc.includes('pollinations.ai')) {
    try {
      const url = new URL(cleanSrc);
      url.searchParams.set('nologo', 'true');
      url.searchParams.set('nofeed', 'true');
      url.searchParams.set('enhance', 'true');
      url.searchParams.set('model', 'flux');
      if (!url.searchParams.has('width')) url.searchParams.set('width', '1280');
      if (!url.searchParams.has('height')) url.searchParams.set('height', '720');
      cleanSrc = url.toString();
    } catch {
      if (!cleanSrc.includes('nologo=')) {
        cleanSrc += (cleanSrc.includes('?') ? '&' : '?') + 'nologo=true&nofeed=true&enhance=true&model=flux&width=1280&height=720';
      }
    }
  }

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDownloading) return;

    setIsDownloading(true);
    try {
      const response = await fetch(cleanSrc);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `rgamer-ai-render-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch {
      // Fallback
      window.open(cleanSrc, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="relative inline-block rounded-2xl overflow-hidden border border-white/10 my-4 shadow-2xl bg-[#0e0e14] max-w-full group">
      {/* Top Floating Controls: 4K HD Tag & Direct Download Button */}
      <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 bg-black/85 backdrop-blur-md border border-cyan-500/30 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold text-cyan-300 shadow-lg select-none">
        <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
        <span>4K ULTRA HD • FLUX ENGINE</span>
      </div>

      <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-2">
        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xl transition flex items-center gap-1.5 border select-none ${
            downloadSuccess
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-black/85 hover:bg-cyan-950/90 text-white hover:text-cyan-300 border-white/20 hover:border-cyan-400'
          }`}
          title="Download Image to your device"
        >
          {downloadSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-bold">Downloaded!</span>
            </>
          ) : isDownloading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-[11px] font-bold">Downloading...</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] font-bold">Download Image</span>
            </>
          )}
        </button>

        <a
          href={cleanSrc}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-lg bg-black/75 hover:bg-black text-stone-400 hover:text-white border border-white/10 transition shadow-lg"
          title="Open in new tab"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Image Display with bottom 40px crop to completely eliminate any third-party watermark */}
      <div className="relative overflow-hidden pb-0 -mb-10 select-none">
        <img
          src={cleanSrc}
          className="block max-w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.01]"
          alt={alt || "RGAMER AI Ultra Visual"}
          loading="lazy"
        />
      </div>

      {/* Official RGAMER AI corner watermark badge */}
      <div className="absolute bottom-2.5 right-2.5 bg-[#08080c]/95 backdrop-blur-md border border-cyan-500/35 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-[0_4px_24px_rgba(0,0,0,0.9)] z-20 select-none pointer-events-none">
        <LogoIcon size={18} withGlow={true} animated={false} />
        <span className="text-[11px] font-black tracking-widest text-cyan-200 uppercase font-mono">
          RGAMER AI
        </span>
      </div>
    </div>
  );
}
