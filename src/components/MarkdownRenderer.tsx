import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Copy,
  Check,
  Download,
  Maximize2,
  Sparkles,
  RefreshCw,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  onOpenImageModal?: (url: string, prompt: string) => void;
  onRegenerateImage?: (prompt: string) => void;
}

// Custom Pollinations Image Card
const PollinationsImageCard: React.FC<{
  src?: string;
  alt?: string;
  onOpenModal?: (url: string, prompt: string) => void;
  onRegenerate?: (prompt: string) => void;
}> = ({ src, alt = 'AI Generated Image', onOpenModal, onRegenerate }) => {
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [imageKey, setImageKey] = useState(0);

  if (!src) return null;

  // Extract prompt from URL if present
  let cleanPrompt = alt;
  try {
    if (src.includes('/prompt/')) {
      const part = src.split('/prompt/')[1]?.split('?')[0];
      if (part) {
        cleanPrompt = decodeURIComponent(part);
      }
    }
  } catch {
    // fallback
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cleanPrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleDownload = async () => {
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      const objUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objUrl;
      a.download = `pollinations-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(objUrl);
      document.body.removeChild(a);
    } catch {
      window.open(src, '_blank');
    }
  };

  const handleReload = () => {
    setHasError(false);
    setLoaded(false);
    // Add or increment random seed cache-buster
    setImageKey((prev) => prev + 1);
  };

  const resolvedSrc = imageKey > 0 ? `${src}${src.includes('?') ? '&' : '?'}seed=${imageKey * 1337}` : src;

  return (
    <div className="my-4 rounded-xl border border-slate-800/90 bg-slate-900/80 overflow-hidden shadow-lg transition-all hover:border-slate-700 max-w-xl">
      {/* Top Banner */}
      <div className="px-3.5 py-2.5 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="p-1 rounded bg-indigo-500/10 text-indigo-400">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
          <span className="text-xs font-medium text-slate-300 truncate">
            {alt || 'Generated Artwork'}
          </span>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50">
          Pollinations AI
        </span>
      </div>

      {/* Image Viewport */}
      <div className="relative min-h-[220px] bg-slate-950 flex items-center justify-center overflow-hidden group">
        {!loaded && !hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-slate-950/90 z-10">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            <div className="text-xs text-slate-400 animate-pulse">Rendering image...</div>
          </div>
        )}

        {hasError ? (
          <div className="p-8 flex flex-col items-center justify-center text-center gap-2">
            <AlertCircle className="w-8 h-8 text-amber-400" />
            <div className="text-xs text-slate-300">Unable to load image directly.</div>
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={handleReload}
                className="flex items-center gap-1 text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded"
              >
                <RefreshCw className="w-3 h-3" /> Retry
              </button>
              <a
                href={resolvedSrc}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded"
              >
                <ExternalLink className="w-3 h-3" /> Open link
              </a>
            </div>
          </div>
        ) : (
          <img
            key={imageKey}
            src={resolvedSrc}
            alt={alt}
            referrerPolicy="no-referrer"
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => {
              setLoaded(true);
              setHasError(true);
            }}
            onClick={() => onOpenModal && onOpenModal(resolvedSrc, cleanPrompt)}
            className={`w-full max-h-[460px] object-cover sm:object-contain cursor-pointer transition-opacity duration-300 ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Hover Quick Actions */}
        {loaded && !hasError && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none group-hover:pointer-events-auto">
            <button
              onClick={() => onOpenModal && onOpenModal(resolvedSrc, cleanPrompt)}
              className="p-2.5 rounded-full bg-slate-900/90 text-white hover:bg-indigo-600 shadow-md transition-colors"
              title="Fullscreen Lightbox"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2.5 rounded-full bg-slate-900/90 text-white hover:bg-indigo-600 shadow-md transition-colors"
              title="Download Image"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Prompt preview & tool bar */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800/80 flex flex-col gap-2">
        <div className="text-[11px] font-mono text-slate-300 line-clamp-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
          <span className="text-indigo-400 font-semibold mr-1.5">Prompt:</span>
          {cleanPrompt}
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedPrompt ? 'Copied' : 'Copy Prompt'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReload}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-800/60 hover:bg-slate-800 transition-colors"
              title="Refresh / Re-seed image"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Re-render</span>
            </button>

            {onRegenerate && (
              <button
                onClick={() => onRegenerate(cleanPrompt)}
                className="flex items-center gap-1 text-xs text-indigo-300 hover:text-white px-2.5 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600 transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                <span>Variation</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Custom Code Block with Copy Button
const CodeBlock: React.FC<{
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}> = ({ inline, className, children }) => {
  const [copied, setCopied] = useState(false);
  const textContent = String(children || '').replace(/\n$/, '');

  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';

  if (inline) {
    return (
      <code className="px-1.5 py-0.5 rounded bg-slate-800/80 text-amber-300 font-mono text-xs border border-slate-700/50">
        {children}
      </code>
    );
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="my-3 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden text-xs">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800/80 text-slate-400">
        <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopyCode}
          className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          title="Copy code"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto text-slate-200 leading-relaxed font-mono">
        <code>{textContent}</code>
      </pre>
    </div>
  );
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  onOpenImageModal,
  onRegenerateImage,
}) => {
  return (
    <div className="markdown-body text-slate-200 text-sm leading-relaxed space-y-2.5 break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          img: ({ src, alt }) => (
            <PollinationsImageCard
              src={src}
              alt={alt}
              onOpenModal={onOpenImageModal}
              onRegenerate={onRegenerateImage}
            />
          ),
          code: ({ inline, className, children, ...props }: any) => (
            <CodeBlock inline={inline} className={className} {...props}>
              {children}
            </CodeBlock>
          ),
          p: ({ children }) => <div className="mb-2.5 last:mb-0 leading-relaxed">{children}</div>,
          h1: ({ children }) => (
            <h1 className="text-xl font-bold text-slate-100 mt-4 mb-2 pb-1 border-b border-slate-800">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-semibold text-slate-100 mt-3.5 mb-2 pb-0.5 border-b border-slate-800/60">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-semibold text-slate-100 mt-3 mb-1.5">{children}</h3>
          ),
          ul: ({ children }) => <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-3 border-indigo-500 pl-3 py-1 my-2.5 italic text-slate-300 bg-slate-900/40 rounded-r">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 rounded-lg border border-slate-800">
              <table className="min-w-full divide-y divide-slate-800 text-left text-xs">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-slate-900/80">{children}</thead>,
          th: ({ children }) => (
            <th className="px-3 py-2 font-semibold text-slate-300 border-b border-slate-800">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-slate-300 border-b border-slate-800/60">{children}</td>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors inline-flex items-center gap-0.5"
            >
              {children}
              <ExternalLink className="w-3 h-3 inline-block ml-0.5" />
            </a>
          ),
          hr: () => <hr className="my-4 border-slate-800" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
