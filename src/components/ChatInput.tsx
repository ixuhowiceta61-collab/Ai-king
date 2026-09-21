import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Square,
  Image as ImageIcon,
  Sparkles,
  Layers,
  Paperclip,
  X,
  FileVideo,
  FileImage,
  UploadCloud,
  AlertCircle,
} from 'lucide-react';
import { Attachment } from '../types';

interface ChatInputProps {
  onSendMessage: (text: string, isImageRequest?: boolean, attachments?: Attachment[]) => void;
  isLoading: boolean;
  onStopGeneration?: () => void;
  onOpenQuickPrompts?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  onStopGeneration,
  onOpenQuickPrompts,
}) => {
  const [text, setText] = useState('');
  const [isImageMode, setIsImageMode] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string>('none');
  const [selectedAspect, setSelectedAspect] = useState<string>('1:1');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [text]);

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const processFiles = async (files: File[]) => {
    setUploadError(null);
    setIsUploading(true);
    const newAttachments: Attachment[] = [];

    for (const file of files) {
      // 25MB max size per file limit
      if (file.size > 25 * 1024 * 1024) {
        setUploadError(`File "${file.name}" exceeds 25MB limit.`);
        continue;
      }

      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      if (!isImage && !isVideo) {
        setUploadError(`"${file.name}" is not a supported image or video.`);
        continue;
      }

      try {
        const dataUrl = await readFileAsDataURL(file);
        newAttachments.push({
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          type: isVideo ? 'video' : 'image',
          name: file.name,
          url: dataUrl,
          mimeType: file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
          size: file.size,
        });
      } catch {
        setUploadError(`Failed to load file "${file.name}".`);
      }
    }

    if (newAttachments.length > 0) {
      setAttachments((prev) => [...prev, ...newAttachments]);
    }
    setIsUploading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await processFiles(Array.from(files));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const hasContent = text.trim().length > 0;
    const hasAttachments = attachments.length > 0;

    if ((!hasContent && !hasAttachments) || isLoading) return;

    let finalPrompt = text.trim();

    if (isImageMode) {
      const isAlreadyImageRequest =
        /ছবি|image|picture|draw|generate an image|render/i.test(finalPrompt);

      let styleAddition = '';
      if (selectedStyle !== 'none') {
        styleAddition = `, style: ${selectedStyle}`;
      }
      let aspectAddition = '';
      if (selectedAspect !== '1:1') {
        aspectAddition = `, aspect ratio ${selectedAspect}`;
      }

      if (!isAlreadyImageRequest) {
        finalPrompt = `Generate an image of ${finalPrompt}${styleAddition}${aspectAddition}`;
      } else if (styleAddition || aspectAddition) {
        finalPrompt = `${finalPrompt}${styleAddition}${aspectAddition}`;
      }
    } else if (!finalPrompt && hasAttachments) {
      finalPrompt = attachments.some((a) => a.type === 'video')
        ? 'Please analyze the attached media in detail.'
        : 'Please analyze this attached image in detail.';
    }

    onSendMessage(finalPrompt, isImageMode, attachments.length > 0 ? attachments : undefined);
    setText('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4">
      {/* Hidden File Input requested by user */}
      <input
        ref={fileInputRef}
        id="file-upload-input"
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="mb-2.5 p-2 rounded-xl bg-red-950/70 border border-red-800 text-red-300 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{uploadError}</span>
          </div>
          <button
            onClick={() => setUploadError(null)}
            className="p-1 hover:bg-red-900/50 rounded text-red-400 hover:text-red-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Optional Image Options Bar when Image Mode is activated */}
      {isImageMode && (
        <div className="mb-2.5 p-2.5 rounded-xl bg-slate-900/90 border border-pink-500/30 shadow-lg flex flex-wrap items-center justify-between gap-2.5 animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-semibold text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-md">
              <Sparkles className="w-3 h-3" /> Image Generator Mode
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Prompt will be dispatched to Pollinations AI
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {/* Aspect Ratio */}
            <div className="flex items-center gap-1 bg-slate-950 px-1.5 py-1 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono">Aspect:</span>
              <select
                value={selectedAspect}
                onChange={(e) => setSelectedAspect(e.target.value)}
                className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
              >
                <option value="1:1" className="bg-slate-900 text-slate-200">1:1 Square</option>
                <option value="16:9" className="bg-slate-900 text-slate-200">16:9 Cinema</option>
                <option value="9:16" className="bg-slate-900 text-slate-200">9:16 Portrait</option>
                <option value="4:3" className="bg-slate-900 text-slate-200">4:3 Standard</option>
              </select>
            </div>

            {/* Art Style */}
            <div className="flex items-center gap-1 bg-slate-950 px-1.5 py-1 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono">Style:</span>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
              >
                <option value="none" className="bg-slate-900 text-slate-200">Auto / Natural</option>
                <option value="photorealistic 8k cinematic" className="bg-slate-900 text-slate-200">Photorealistic 8K</option>
                <option value="cyberpunk neon lighting" className="bg-slate-900 text-slate-200">Cyberpunk Neon</option>
                <option value="anime Makoto Shinkai style" className="bg-slate-900 text-slate-200">Anime Aesthetic</option>
                <option value="digital fantasy oil painting" className="bg-slate-900 text-slate-200">Fantasy Painting</option>
                <option value="3D Pixar Disney render" className="bg-slate-900 text-slate-200">3D Stylized Render</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Main Input Box with Drag & Drop */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex flex-col rounded-2xl bg-slate-900/90 border shadow-xl transition-all ${
          isDragging
            ? 'border-indigo-500 ring-2 ring-indigo-500/40 bg-indigo-950/20'
            : 'border-slate-800 focus-within:border-indigo-500/70 focus-within:ring-1 focus-within:ring-indigo-500/30'
        }`}
      >
        {/* Drag Overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-indigo-950/80 rounded-2xl z-20 flex flex-col items-center justify-center gap-2 pointer-events-none border-2 border-dashed border-indigo-400">
            <UploadCloud className="w-8 h-8 text-indigo-400 animate-bounce" />
            <p className="text-sm font-medium text-indigo-200">Drop images or videos here</p>
          </div>
        )}

        {/* Attached Files Preview Strip */}
        {attachments.length > 0 && (
          <div className="p-2.5 pb-1 flex flex-wrap items-center gap-2 border-b border-slate-800/60 bg-slate-950/40 rounded-t-2xl">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="relative group/pill flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 text-xs text-slate-200 shadow-sm"
              >
                {att.type === 'video' ? (
                  <div className="relative w-6 h-6 rounded bg-slate-800 flex items-center justify-center shrink-0">
                    <FileVideo className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                ) : (
                  <img
                    src={att.url}
                    alt={att.name}
                    className="w-6 h-6 rounded object-cover shrink-0 border border-slate-700"
                  />
                )}
                <div className="flex flex-col min-w-0 max-w-[130px]">
                  <span className="truncate text-[11px] font-medium leading-tight">{att.name}</span>
                  {att.size && (
                    <span className="text-[9px] text-slate-400 leading-tight">{formatFileSize(att.size)}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(att.id)}
                  className="p-1 rounded-md text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                  title="Remove attachment"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {isUploading && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 px-2 py-1">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                <span>Processing media...</span>
              </div>
            )}
          </div>
        )}

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          id="chat-textarea-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isImageMode
              ? 'Describe the image you want to create (বাংলা অথবা ইংরেজিতে লিখুন)...'
              : attachments.length > 0
              ? 'Add a question or instruction about the attached media...'
              : 'Ask anything in Bengali or English, upload media, or request an image...'
          }
          rows={1}
          className="w-full bg-transparent text-slate-100 placeholder:text-slate-500 px-4 pt-3.5 pb-2 text-sm focus:outline-none resize-none min-h-[48px] max-h-[200px]"
        />

        {/* Action Controls Bar */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-slate-800/60 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            {/* File Upload Button */}
            <button
              id="btn-attach-file"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors"
              title="Upload image or video"
            >
              <Paperclip className="w-3.5 h-3.5 text-indigo-400" />
              <span>Attach</span>
            </button>

            {/* Toggle Image Mode */}
            <button
              id="btn-toggle-image-mode"
              type="button"
              onClick={() => setIsImageMode(!isImageMode)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isImageMode
                  ? 'bg-pink-600/30 text-pink-300 border border-pink-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
              }`}
              title="Toggle Image Generator Mode"
            >
              <ImageIcon className={`w-3.5 h-3.5 ${isImageMode ? 'text-pink-400' : ''}`} />
              <span>{isImageMode ? 'Image Mode: ON' : 'Create Image'}</span>
            </button>

            {/* Quick Prompts Drawer button */}
            {onOpenQuickPrompts && (
              <button
                type="button"
                onClick={onOpenQuickPrompts}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 transition-colors"
                title="Open Starter Prompts"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Starters</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Enter to send, Shift+Enter for new line
            </span>

            {isLoading ? (
              <button
                id="btn-stop-generation"
                type="button"
                onClick={onStopGeneration}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium shadow-md transition-colors"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                id="btn-send-message"
                type="button"
                onClick={() => handleSubmit()}
                disabled={!text.trim() && attachments.length === 0}
                className={`flex items-center justify-center p-2 rounded-xl text-white shadow-md transition-all ${
                  text.trim() || attachments.length > 0
                    ? isImageMode
                      ? 'bg-pink-600 hover:bg-pink-500 shadow-pink-600/20'
                      : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
                title="Send Message"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
