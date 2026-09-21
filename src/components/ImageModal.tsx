import React, { useState } from 'react';
import { X, Download, Copy, ExternalLink, ZoomIn, ZoomOut, Check, Sparkles } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  altText?: string;
  onRegenerate?: (prompt: string) => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  altText = 'Generated Image',
  onRegenerate,
}) => {
  const [scale, setScale] = useState(1);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  // Extract prompt from pollination url if possible
  let extractedPrompt = altText;
  try {
    if (imageUrl.includes('/prompt/')) {
      const parts = imageUrl.split('/prompt/')[1];
      const cleanPart = parts.split('?')[0];
      extractedPrompt = decodeURIComponent(cleanPart);
    }
  } catch {
    // fallback
  }

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(extractedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-image-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      // Direct fallback
      window.open(imageUrl, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      id="image-lightbox-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        id="image-lightbox-content"
        className="relative max-w-5xl w-full max-h-[92vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur">
          <div className="flex items-center gap-2.5 min-w-0 pr-4">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-200 truncate">
                {altText || 'AI Generated Image'}
              </h3>
              <p className="text-xs text-slate-400 truncate">Pollinations AI Engine</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              id="btn-zoom-in"
              onClick={() => setScale((s) => Math.min(s + 0.25, 3))}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-colors"
              title="Zoom In"
              aria-label="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              id="btn-zoom-out"
              onClick={() => setScale((s) => Math.max(s - 0.25, 0.5))}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-colors"
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              id="btn-download-image"
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              title="Download Image"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'Downloading...' : 'Download'}</span>
            </button>
            <a
              id="btn-external-link"
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-colors"
              title="Open Original"
              aria-label="Open original image"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              id="btn-close-modal"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors ml-1"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Image Display Area */}
        <div className="relative flex-1 flex items-center justify-center p-4 bg-slate-950/60 overflow-auto min-h-[320px] max-h-[65vh]">
          <img
            src={imageUrl}
            alt={altText}
            referrerPolicy="no-referrer"
            style={{ transform: `scale(${scale})`, transition: 'transform 0.15s ease-out' }}
            className="max-h-[60vh] w-auto object-contain rounded-lg shadow-lg"
          />
        </div>

        {/* Footer info & prompt copy */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-300 max-w-2xl">
            <span className="text-slate-400 font-semibold block mb-0.5">Prompt:</span>
            <p className="line-clamp-2 text-slate-200 font-mono text-[11px] leading-relaxed">
              {extractedPrompt}
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              id="btn-copy-prompt"
              onClick={handleCopyPrompt}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700/60"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Copied' : 'Copy Prompt'}</span>
            </button>

            {onRegenerate && (
              <button
                id="btn-modal-regenerate"
                onClick={() => {
                  onClose();
                  onRegenerate(extractedPrompt);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Use Prompt</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
