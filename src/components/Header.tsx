import React from 'react';
import {
  Menu,
  Sparkles,
  Info,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  title: string;
  onOpenQuickPrompts: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  title,
  onOpenQuickPrompts,
}) => {
  const [showInfo, setShowInfo] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="flex items-center gap-3 min-w-0">
        <button
          id="btn-toggle-sidebar"
          onClick={onToggleSidebar}
          className="p-2 -ml-1 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 border border-slate-800/60 transition-colors"
          aria-label="Toggle navigation drawer"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-100 truncate flex items-center gap-2">
            {title || 'New Conversation'}
          </h2>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </span>
            <span>•</span>
            <span className="text-slate-400">Gemini 3.8 + Pollinations AI</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenQuickPrompts}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-medium text-slate-300 border border-slate-800 transition-colors cursor-pointer"
        >
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Prompts & Starters</span>
        </button>

        {/* Info button */}
        <div className="relative">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 border border-slate-800/60 transition-colors"
            title="System Capabilities & Directives"
            aria-label="Capabilities Info"
          >
            <Info className="w-4 h-4" />
          </button>

          {showInfo && (
            <div
              className="absolute right-0 mt-2 w-80 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl z-50 text-xs text-slate-300 space-y-2.5 animate-fadeIn"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Agent Specifications
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300">
                  Active
                </span>
              </div>

              <div className="space-y-2 text-[11px] leading-relaxed text-slate-300">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Unrestricted & Objective:</strong> Answers all complex, sensitive, adult, or technical topics directly without lecturing or moralizing.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Bilingual Adaptation:</strong> Automatic fluent response in Bengali (বাংলা) or English to match user query.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Image Dispatcher:</strong> Formulates detailed English prompts and outputs markdown Pollinations AI images on demand.
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowInfo(false)}
                className="w-full mt-2 py-1 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded text-center text-xs transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
