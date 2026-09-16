import React, { useState } from 'react';
import { Check, Copy, Download, FileCode, Terminal } from 'lucide-react';

interface CodeBlockProps {
  language: string;
  code: string;
}

const LANGUAGE_EXTENSIONS: Record<string, string> = {
  javascript: 'js',
  js: 'js',
  jsx: 'jsx',
  typescript: 'ts',
  ts: 'ts',
  tsx: 'tsx',
  html: 'html',
  htm: 'html',
  css: 'css',
  scss: 'scss',
  json: 'json',
  python: 'py',
  py: 'py',
  cpp: 'cpp',
  'c++': 'cpp',
  c: 'c',
  csharp: 'cs',
  cs: 'cs',
  java: 'java',
  kotlin: 'kt',
  kt: 'kt',
  swift: 'swift',
  go: 'go',
  rust: 'rs',
  rs: 'rs',
  php: 'php',
  ruby: 'rb',
  rb: 'rb',
  sql: 'sql',
  bash: 'sh',
  sh: 'sh',
  shell: 'sh',
  zsh: 'sh',
  yaml: 'yaml',
  yml: 'yaml',
  xml: 'xml',
  markdown: 'md',
  md: 'md',
  dockerfile: 'dockerfile',
  graphql: 'gql',
  txt: 'txt'
};

export default function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const cleanLang = (language || 'code').toLowerCase().trim();
  const fileExt = LANGUAGE_EXTENSIONS[cleanLang] || 'txt';
  const displayLang = cleanLang.toUpperCase();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = code;
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
      const filename = `rgamer-${cleanLang}-${Date.now()}.${fileExt}`;
      const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
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
    <div className="my-4 rounded-xl overflow-hidden border border-cyan-500/20 bg-[#0c0c12] shadow-2xl group transition-all duration-200 hover:border-cyan-500/40">
      {/* Code Header Bar with Language & Actions */}
      <div className="bg-[#14141c] px-4 py-2.5 border-b border-white/10 flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            {cleanLang === 'bash' || cleanLang === 'sh' ? (
              <Terminal className="w-3 h-3" />
            ) : (
              <FileCode className="w-3 h-3" />
            )}
          </div>
          <span className="text-[11px] font-mono font-bold tracking-wider text-cyan-300">
            {displayLang}
          </span>
          <span className="text-[10px] font-mono text-stone-500 hidden sm:inline">
            .{fileExt}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition border ${
              copied
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white border-white/10 hover:border-white/20'
            }`}
            title="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* Download Button */}
          <button
            type="button"
            onClick={handleDownload}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition border ${
              downloaded
                ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400'
                : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-200 border-cyan-500/30 hover:border-cyan-400'
            }`}
            title={`Download as .${fileExt} file`}
          >
            {downloaded ? (
              <>
                <Check className="w-3.5 h-3.5 text-cyan-300" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Text Body */}
      <div className="p-4 overflow-x-auto text-[13px] font-mono leading-relaxed text-stone-200 selection:bg-cyan-500/30">
        <pre className="!bg-transparent !p-0 !m-0 !border-0 font-mono">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
