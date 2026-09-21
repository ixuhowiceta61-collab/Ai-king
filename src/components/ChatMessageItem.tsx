import React, { useState } from 'react';
import { ChatMessage } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { User, Bot, Copy, Check, RotateCcw, AlertTriangle, FileVideo, FileImage } from 'lucide-react';

interface ChatMessageItemProps {
  message: ChatMessage;
  onRetry?: () => void;
  onOpenImageModal?: (url: string, prompt: string) => void;
  onRegenerateImage?: (prompt: string) => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  onRetry,
  onOpenImageModal,
  onRegenerateImage,
}) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(message.content);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = message.content;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback failed
    }
  };

  const formattedTime = new Intl.DateTimeFormat([], {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(message.timestamp));

  return (
    <div
      id={`message-${message.id}`}
      className={`group w-full py-4 px-4 sm:px-6 transition-colors ${
        isUser ? 'bg-transparent' : 'bg-slate-900/40 border-y border-slate-900/60'
      }`}
    >
      <div className="max-w-4xl mx-auto flex items-start gap-3 sm:gap-4">
        {/* Avatar */}
        <div
          className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-sm font-semibold shadow-sm ${
            isUser
              ? 'bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white'
              : 'bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white ring-1 ring-white/20'
          }`}
        >
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0">
          {/* Header info */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">
                {isUser ? 'You' : 'Assistant'}
              </span>
              <span className="text-[11px] text-slate-500">{formattedTime}</span>
              {message.isStreaming && (
                <span className="flex items-center gap-1 text-[11px] text-indigo-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                  Generating...
                </span>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleCopy}
                className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800 transition-colors"
                title="Copy text"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              {!isUser && onRetry && (
                <button
                  onClick={onRetry}
                  className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800 transition-colors"
                  title="Regenerate response"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Attached Images or Videos */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2.5 mb-2.5 mt-1">
              {message.attachments.map((att) => (
                <div
                  key={att.id}
                  className="rounded-xl overflow-hidden border border-slate-800/80 bg-slate-950/80 shadow-md max-w-sm group/att"
                >
                  {att.type === 'video' ? (
                    <div className="flex flex-col">
                      <video
                        src={att.url}
                        controls
                        className="max-h-60 rounded-t-xl bg-black w-full"
                        preload="metadata"
                      />
                      <div className="px-2.5 py-1.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                        <FileVideo className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="truncate max-w-[200px]">{att.name}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <img
                        src={att.url}
                        alt={att.name}
                        onClick={() => onOpenImageModal && onOpenImageModal(att.url, att.name)}
                        className="max-h-60 rounded-t-xl object-cover cursor-pointer hover:opacity-95 transition-opacity"
                      />
                      <div className="px-2.5 py-1.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                        <FileImage className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                        <span className="truncate max-w-[200px]">{att.name}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Message Content */}
          {message.error ? (
            <div className="flex items-center gap-2 p-3 my-2 rounded-xl bg-red-950/40 border border-red-900/50 text-red-300 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{message.content}</span>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="ml-auto px-2 py-1 bg-red-900/50 hover:bg-red-800 text-white rounded text-xs transition-colors"
                >
                  Retry
                </button>
              )}
            </div>
          ) : isUser ? (
            <div className="text-sm text-slate-100 whitespace-pre-wrap leading-relaxed font-normal">
              {message.content}
            </div>
          ) : (
            <>
              <MarkdownRenderer
                content={message.content}
                onOpenImageModal={onOpenImageModal}
                onRegenerateImage={onRegenerateImage}
              />
              {!message.isStreaming && message.content && (
                <div className="mt-2.5 flex items-center gap-2 pt-1">
                  <button
                    id={`btn-copy-response-${message.id}`}
                    onClick={handleCopy}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg font-medium transition-all border ${
                      copied
                        ? 'bg-emerald-950/70 border-emerald-600/70 text-emerald-300 shadow-sm'
                        : 'bg-slate-900/90 hover:bg-slate-800/90 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700 shadow-sm'
                    }`}
                    title="Copy response to clipboard"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  {onRetry && (
                    <button
                      id={`btn-retry-response-${message.id}`}
                      onClick={onRetry}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg text-slate-400 hover:text-slate-200 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 transition-colors shadow-sm"
                      title="Regenerate response"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                      <span>Regenerate</span>
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
