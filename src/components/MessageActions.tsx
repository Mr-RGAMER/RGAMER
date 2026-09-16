import React, { useState } from 'react';
import { Copy, Check, Download, FileText } from 'lucide-react';

interface MessageActionsProps {
  content: string;
  messageId: string;
}

export default function MessageActions({ content, messageId }: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const cleanContent = content.replace(/\[VIDEO:\s*[^\]]+\]/gi, '').trim();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cleanContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = cleanContent;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    try {
      const filename = `rgamer-ai-response-${Date.now()}.txt`;
      const blob = new Blob([cleanContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  return (
    <div className="flex items-center gap-2 pt-2 mt-2 border-t border-white/5 select-none">
      {/* Copy Response Button */}
      <button
        type="button"
        onClick={handleCopy}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition border ${
          copied
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
            : 'bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white border-white/5 hover:border-white/10'
        }`}
        title="Copy complete response to clipboard"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Text</span>
          </>
        )}
      </button>

      {/* Download Response File Button */}
      <button
        type="button"
        onClick={handleDownload}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition border ${
          downloaded
            ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400 font-bold'
            : 'bg-white/5 hover:bg-cyan-500/15 text-stone-400 hover:text-cyan-300 border-white/5 hover:border-cyan-500/30'
        }`}
        title="Download response as a .txt file"
      >
        {downloaded ? (
          <>
            <Check className="w-3.5 h-3.5 text-cyan-300" />
            <span>Saved .txt!</span>
          </>
        ) : (
          <>
            <Download className="w-3.5 h-3.5" />
            <span>Download .txt</span>
          </>
        )}
      </button>
    </div>
  );
}
