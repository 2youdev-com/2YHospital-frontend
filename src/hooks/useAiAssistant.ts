import { useState, useCallback } from 'react';
import { aiAssistantService } from '@/services/ai-assistant.service';
import type { ChatMessage } from '@/types';

type AiAssistantRole = 'patient' | 'doctor' | 'admin';

interface UseAiAssistantOptions {
  role?: AiAssistantRole;
  patientId?: string;
}

export function useAiAssistant(options: UseAiAssistantOptions = {}) {
  const { role = 'patient', patientId } = options;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);

  const sendMessage = useCallback(async (content: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = role === 'doctor'
        ? await aiAssistantService.doctorChat(content, patientId)
        : role === 'admin'
          ? await aiAssistantService.adminChat(content)
          : await aiAssistantService.chat(content, sessionId);
      if (res.sessionId) setSessionId(res.sessionId);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.response ?? res.message ?? res.reply ?? 'تمت معالجة الطلب، لكن لم يصل رد قابل للعرض.',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: 'عذراً، حدث خطأ. حاول مرة أخرى.', createdAt: new Date().toISOString() },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [role, patientId, sessionId]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setSessionId(undefined);
  }, []);

  return { messages, isLoading, sendMessage, clearMessages };
}
