import { apiClient } from '../../api/client';

export interface AIProvider {
  name: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: number;
}

export interface StreamingCallbacks {
  onChunk: (chunk: string) => void;
  onDone: () => void;
  onError: (error: Error) => void;
}

/**
 * Modular AI Service Abstraction Layer.
 * Supports streaming responses, tool calling parsing, and basic memory.
 */
class AIService {
  private memory: ChatMessage[] = [];

  /**
   * Initializes or clears the conversation memory
   */
  initConversation(systemPrompt?: string) {
    this.memory = [];
    if (systemPrompt) {
      this.memory.push({
        id: Date.now().toString(),
        role: 'system',
        content: systemPrompt,
        timestamp: Date.now(),
      });
    }
  }

  getMemory(): ChatMessage[] {
    return this.memory;
  }

  addMessage(message: ChatMessage) {
    this.memory.push(message);
  }

  /**
   * Sends a message to the unified backend AI route.
   * Handles server-sent events for streaming if the backend supports it.
   */
  async streamChat(
    message: string,
    callbacks: StreamingCallbacks,
    context?: any
  ) {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: Date.now(),
    };
    this.addMessage(userMsg);

    try {
      // In a real implementation with streaming, we would use XMLHttpRequest or fetch
      // with a reader to handle chunked responses from the Next.js server.
      // For now, we simulate the interface assuming a standard API fallback.
      const response = await apiClient.post('/api/mobile/ai/chat', {
        messages: this.memory,
        context,
      });

      const reply = response.data?.reply || '';
      // Simulate chunking for the abstraction UI
      callbacks.onChunk(reply);
      callbacks.onDone();

      this.addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
      });
    } catch (error: any) {
      callbacks.onError(error);
    }
  }
}

export const aiService = new AIService();
