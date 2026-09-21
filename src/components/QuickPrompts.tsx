import React, { useState } from 'react';
import { PRESET_PROMPTS, PromptPreset } from '../data/prompts';
import { Image, Code, Feather, HelpCircle, Globe } from 'lucide-react';

interface QuickPromptsProps {
  onSelectPrompt: (prompt: string, isImage?: boolean) => void;
}

export const QuickPrompts: React.FC<QuickPromptsProps> = ({ onSelectPrompt }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'image' | 'coding' | 'creative' | 'knowledge'>('all');
  const [languageFilter, setLanguageFilter] = useState<'all' | 'bn' | 'en'>('all');

  const filtered = PRESET_PROMPTS.filter((p) => {
    const matchTab = activeTab === 'all' || p.category === activeTab;
    const matchLang = languageFilter === 'all' || p.lang === languageFilter;
    return matchTab && matchLang;
  });

  const getCategoryIcon = (category: PromptPreset['category']) => {
    switch (category) {
      case 'image':
        return <Image className="w-3.5 h-3.5 text-pink-400" />;
      case 'coding':
        return <Code className="w-3.5 h-3.5 text-cyan-400" />;
      case 'creative':
        return <Feather className="w-3.5 h-3.5 text-amber-400" />;
      case 'knowledge':
        return <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <div id="quick-prompts-container" className="w-full max-w-4xl mx-auto px-4 py-3">
      {/* Category Tabs & Language Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-1">
          <button
            id="tab-all"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            All Prompts
          </button>
          <button
            id="tab-image"
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors font-medium whitespace-nowrap ${
              activeTab === 'image'
                ? 'bg-pink-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Image className="w-3.5 h-3.5 text-pink-300" />
            <span>Image Generation</span>
          </button>
          <button
            id="tab-coding"
            onClick={() => setActiveTab('coding')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors font-medium whitespace-nowrap ${
              activeTab === 'coding'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Code className="w-3.5 h-3.5 text-cyan-300" />
            <span>Coding</span>
          </button>
          <button
            id="tab-creative"
            onClick={() => setActiveTab('creative')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors font-medium whitespace-nowrap ${
              activeTab === 'creative'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Feather className="w-3.5 h-3.5 text-amber-300" />
            <span>Creative</span>
          </button>
          <button
            id="tab-knowledge"
            onClick={() => setActiveTab('knowledge')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors font-medium whitespace-nowrap ${
              activeTab === 'knowledge'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-300" />
            <span>Analysis</span>
          </button>
        </div>

        {/* Language Filter */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
          <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
          <button
            onClick={() => setLanguageFilter('all')}
            className={`px-2 py-1 rounded transition-colors ${
              languageFilter === 'all' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Both
          </button>
          <button
            onClick={() => setLanguageFilter('bn')}
            className={`px-2 py-1 rounded transition-colors ${
              languageFilter === 'bn' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            বাংলা
          </button>
          <button
            onClick={() => setLanguageFilter('en')}
            className={`px-2 py-1 rounded transition-colors ${
              languageFilter === 'en' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Prompts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {filtered.map((item) => (
          <button
            key={item.id}
            id={`preset-card-${item.id}`}
            onClick={() => onSelectPrompt(item.prompt, item.category === 'image')}
            className="flex flex-col text-left p-3 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 transition-all hover:scale-[1.01] group cursor-pointer"
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1.5">
                {getCategoryIcon(item.category)}
                <span className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                  {item.label}
                </span>
              </div>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/40">
                {item.lang === 'bn' ? 'বাংলা' : 'EN'}
              </span>
            </div>
            <p className="text-xs text-slate-400 group-hover:text-slate-300 line-clamp-2 leading-relaxed">
              {item.prompt}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
