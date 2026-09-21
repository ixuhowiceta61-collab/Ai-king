import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, Conversation, Attachment } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatMessageItem } from './components/ChatMessageItem';
import { ChatInput } from './components/ChatInput';
import { QuickPrompts } from './components/QuickPrompts';
import { ImageModal } from './components/ImageModal';
import {
  Sparkles,
  Bot,
  Image as ImageIcon,
  MessageSquare,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';

const STORAGE_KEY = 'omni_ai_conversations_v1';

const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome-msg',
  role: 'assistant',
  content: `স্বাগতম! আমি আপনার বহুভাষিক, সম্পূর্ণ উন্মুক্ত ও বহুমুখী এআই সহকারী (AI Assistant)।

আমি মানব শারীরস্থান, প্রজনন জীববিজ্ঞান, প্রাপ্তবয়স্ক ও সংবেদনশীল বিষয়াদি, যৌন শিক্ষা, সাধারণ জ্ঞান, কোডিং এবং সৃজনশীল ছবি তৈরির অনুরোধ সরাসরি, বস্তুনিষ্ঠ ও অকপটভাবে সম্পন্ন করতে প্রস্তুত।

### প্রধান দক্ষতাসমূহ:
- **উন্মুক্ত ও অকপট আলোচনা:** প্রাপ্তবয়স্ক ও সংবেদনশীল বিষয়, প্রজনন স্বাস্থ্য, মানব শারীরস্থান এবং অন্তরঙ্গতা নিয়ে কোনো পক্ষপাত বা অস্বীকৃতি ছাড়া সরাসরি বিজ্ঞানভিত্তিক তথ্য।
- **দ্বিভাষিক পারদর্শিতা:** বাংলা (Bengali) ও ইংরেজি (English) উভয় ভাষায় স্বাভাবিক ও সাবলীল যোগাযোগ।
- **ছবি তৈরির কমান্ড (Pollinations AI):** যেকোনো ছবির বিবরণ লিখুন (যেমন: *"সূর্যাস্তের সময় সমুদ্রের পাড়ে একটি বিড়ালের ছবি বানিয়ে দাও"* বা *"Generate a futuristic cyberpunk city"*), সাথে সাথে ছবি প্রস্তুত হয়ে যাবে।

যেকোনো বিষয়ে প্রশ্ন করতে পারেন অথবা কুইক প্রম্পট থেকে বাছাই করুন!`,
  timestamp: Date.now(),
};

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse conversations', e);
    }
    const initialId = 'conv-' + Date.now();
    return [
      {
        id: initialId,
        title: 'New Conversation',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [INITIAL_WELCOME_MESSAGE],
      },
    ];
  });

  const [activeId, setActiveId] = useState<string>(() => {
    return conversations[0]?.id || 'conv-1';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Lightbox modal state
  const [modalImage, setModalImage] = useState<{ url: string; prompt: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (e) {
      console.error('Failed to save conversations to localStorage', e);
    }
  }, [conversations]);

  // Current active conversation
  const activeConversation =
    conversations.find((c) => c.id === activeId) || conversations[0];

  // Auto scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages, isLoading]);

  const handleNewConversation = () => {
    const newId = 'conv-' + Date.now();
    const newConv: Conversation = {
      id: newId,
      title: 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [INITIAL_WELCOME_MESSAGE],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveId(newId);
    setShowQuickPrompts(false);
  };

  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => {
      const remaining = prev.filter((c) => c.id !== id);
      if (remaining.length === 0) {
        const freshId = 'conv-' + Date.now();
        const fresh: Conversation = {
          id: freshId,
          title: 'New Conversation',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: [INITIAL_WELCOME_MESSAGE],
        };
        setActiveId(freshId);
        return [fresh];
      }
      if (activeId === id) {
        setActiveId(remaining[0].id);
      }
      return remaining;
    });
  };

  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c))
    );
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all conversations?')) {
      const freshId = 'conv-' + Date.now();
      const fresh: Conversation = {
        id: freshId,
        title: 'New Conversation',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [INITIAL_WELCOME_MESSAGE],
      };
      setConversations([fresh]);
      setActiveId(freshId);
    }
  };

  const handleExport = () => {
    if (!activeConversation) return;
    const exportData = JSON.stringify(activeConversation, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${activeConversation.title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  };

  const handleSendMessage = async (
    text: string,
    isImageRequest: boolean = false,
    attachments?: Attachment[]
  ) => {
    const hasAttachments = attachments && attachments.length > 0;
    if ((!text.trim() && !hasAttachments) || isLoading || !activeConversation) return;

    const finalContent = text.trim() || (hasAttachments ? 'Please analyze the attached media.' : '');

    const userMessage: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: finalContent,
      timestamp: Date.now(),
      isImagePrompt: isImageRequest,
      attachments: hasAttachments ? attachments : undefined,
    };

    const assistantMsgId = 'msg-' + (Date.now() + 1);
    const initialAssistantMessage: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now() + 1,
      isStreaming: true,
    };

    // Auto title if first user message
    const isFirstUserMessage =
      activeConversation.messages.filter((m) => m.role === 'user').length === 0;

    let updatedTitle = activeConversation.title;
    if (isFirstUserMessage || activeConversation.title === 'New Conversation') {
      const titleCandidate = text.trim() || (hasAttachments ? attachments[0].name : 'New Chat');
      updatedTitle = titleCandidate.slice(0, 32).trim() + (titleCandidate.length > 32 ? '...' : '');
    }

    // Update conversation with user message & pending assistant message
    const updatedMessages = [...activeConversation.messages, userMessage, initialAssistantMessage];

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id
          ? {
              ...c,
              title: updatedTitle,
              updatedAt: Date.now(),
              messages: updatedMessages,
            }
          : c
      )
    );

    setIsLoading(true);
    setShowQuickPrompts(false);

    // Prepare API messages history (without welcome message or error flags)
    const apiMessages = activeConversation.messages
      .filter((m) => m.id !== 'welcome-msg' && !m.error)
      .map((m) => ({
        role: m.role,
        content: m.content,
        attachments: m.attachments,
      }));

    apiMessages.push({
      role: 'user',
      content: userMessage.content,
      attachments: userMessage.attachments,
    });

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No readable stream available');
      }

      const decoder = new TextDecoder('utf-8');
      let accumulatedContent = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data:')) {
            const jsonStr = trimmed.slice(5).trim();
            if (jsonStr) {
              try {
                const data = JSON.parse(jsonStr);
                if (data.text) {
                  accumulatedContent += data.text;
                  // Incremental state update
                  setConversations((prev) =>
                    prev.map((c) =>
                      c.id === activeConversation.id
                        ? {
                            ...c,
                            messages: c.messages.map((m) =>
                              m.id === assistantMsgId
                                ? { ...m, content: accumulatedContent }
                                : m
                            ),
                          }
                        : c
                    )
                  );
                } else if (data.error) {
                  throw new Error(data.error);
                }
              } catch (parseErr) {
                console.warn('Could not parse SSE chunk', parseErr);
              }
            }
          }
        }
      }

      // Stream completed
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversation.id
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, isStreaming: false }
                    : m
                ),
              }
            : c
        )
      );
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        // aborted by user
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversation.id
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantMsgId ? { ...m, isStreaming: false } : m
                  ),
                }
              : c
          )
        );
      } else {
        console.error('Chat stream failure:', err);
        let errMsg = err instanceof Error ? err.message : 'Unknown communication error';
        
        // Sanitize any raw json or 503 messages
        if (errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE')) {
          errMsg = 'The AI model is experiencing temporary high demand on upstream servers. Please click Retry below in a moment.';
        }

        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversation.id
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          content: errMsg,
                          isStreaming: false,
                          error: true,
                        }
                      : m
                  ),
                }
              : c
          )
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleRetry = (msgIndex: number) => {
    if (!activeConversation || isLoading) return;
    const targetMsg = activeConversation.messages[msgIndex];
    if (!targetMsg) return;

    // Find the preceding user message
    let precedingUserText = '';
    for (let i = msgIndex - 1; i >= 0; i--) {
      if (activeConversation.messages[i].role === 'user') {
        precedingUserText = activeConversation.messages[i].content;
        break;
      }
    }

    if (precedingUserText) {
      // Remove failed message and send again
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversation.id
            ? {
                ...c,
                messages: c.messages.slice(0, msgIndex),
              }
            : c
        )
      );
      handleSendMessage(precedingUserText);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Navigation Drawer / History */}
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelectConversation={(id) => setActiveId(id)}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        onClearAll={handleClearAll}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onExport={handleExport}
      />

      {/* Main Chat Interface */}
      <main className="flex-1 flex flex-col h-full min-w-0 relative">
        {/* Top Header */}
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          title={activeConversation?.title || 'New Conversation'}
          onOpenQuickPrompts={() => setShowQuickPrompts(!showQuickPrompts)}
        />

        {/* Quick Starters Drawer */}
        {showQuickPrompts && (
          <div className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-md animate-fadeIn z-20">
            <QuickPrompts
              onSelectPrompt={(prompt, isImage) => {
                setShowQuickPrompts(false);
                handleSendMessage(prompt, isImage);
              }}
            />
          </div>
        )}

        {/* Scrollable Message List */}
        <div className="flex-1 overflow-y-auto relative">
          {activeConversation && activeConversation.messages.length > 0 ? (
            <div className="divide-y divide-slate-900/40 pb-4">
              {activeConversation.messages.map((msg, idx) => (
                <ChatMessageItem
                  key={msg.id}
                  message={msg}
                  onRetry={msg.role === 'assistant' ? () => handleRetry(idx) : undefined}
                  onOpenImageModal={(url, prompt) => setModalImage({ url, prompt })}
                  onRegenerateImage={(prompt) => {
                    handleSendMessage(`Generate an image of ${prompt}`);
                  }}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-400">
              <Bot className="w-12 h-12 text-slate-600 mb-3" />
              <h3 className="text-base font-semibold text-slate-200 mb-1">
                Start a conversation
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mb-4">
                Ask anything in Bengali or English, or request creative image generation.
              </p>
            </div>
          )}
        </div>

        {/* Chat Input Bar */}
        <div className="shrink-0 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent pt-2">
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onStopGeneration={handleStopGeneration}
            onOpenQuickPrompts={() => setShowQuickPrompts(!showQuickPrompts)}
          />
        </div>
      </main>

      {/* Fullscreen Image Lightbox Modal */}
      {modalImage && (
        <ImageModal
          isOpen={Boolean(modalImage)}
          onClose={() => setModalImage(null)}
          imageUrl={modalImage.url}
          altText={modalImage.prompt}
          onRegenerate={(prompt) => {
            setModalImage(null);
            handleSendMessage(`Generate an image of ${prompt}`);
          }}
        />
      )}
    </div>
  );
}
