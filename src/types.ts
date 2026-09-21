export type MessageRole = 'user' | 'assistant';

export interface Attachment {
  id: string;
  type: 'image' | 'video';
  name: string;
  url: string; // base64 data URL
  mimeType: string;
  size?: number;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  error?: boolean;
  isImagePrompt?: boolean;
  attachments?: Attachment[];
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

export interface ImageGenerationOptions {
  width?: number;
  height?: number;
  seed?: number;
  model?: string;
  enhance?: boolean;
}

export type PreferredLanguage = 'auto' | 'bn' | 'en';
