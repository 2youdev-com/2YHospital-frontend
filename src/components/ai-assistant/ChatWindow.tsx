'use client';

import { useRef, useEffect } from 'react';
import { Bot, User, Loader2 } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import type { ChatMessage } from '@/types';

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  accentColor?: 'blue' | 'teal';
}

export default function ChatWindow({
  messages,
  isLoading,
  emptyTitle = 'ابدأ المحادثة',
  emptyDescription = 'اكتب رسالتك للمساعد الذكي',
  accentColor = 'blue',
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const userBg = accentColor === 'teal' ? 'bg-teal-600' : 'bg-blue-600';
  const dotColor = accentColor === 'teal' ? 'border-t-teal-600' : 'border-t-blue-600';

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {messages.length === 0 && (
        <div className="text-center py-20">
          <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4',
            accentColor === 'teal' ? 'bg-teal-100' : 'bg-blue-100'
          )}>
            <Bot className={cn('w-8 h-8', accentColor === 'teal' ? 'text-teal-600' : 'text-blue-600')} />
          </div>
          <h3 className="font-semibold text-gray-800">{emptyTitle}</h3>
          <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">{emptyDescription}</p>
        </div>
      )}

      {messages.map((msg) => (
        <div key={msg.id} className={cn('flex gap-3', msg.role === 'user' && 'flex-row-reverse')}>
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
            msg.role === 'user' ? `${userBg} text-white` : 'bg-gray-100 text-gray-600'
          )}>
            {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
          </div>
          <div className={cn(
            'max-w-lg rounded-2xl px-4 py-3 text-sm leading-relaxed',
            msg.role === 'user'
              ? `${userBg} text-white rounded-tr-sm`
              : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
          )}>
            <p className="whitespace-pre-wrap">{msg.content}</p>
            <p className={cn('text-[10px] mt-1', msg.role === 'user' ? 'text-white/60' : 'text-gray-400')}>
              {formatDate(msg.createdAt, 'HH:mm')}
            </p>
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-gray-500" />
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            <span className="text-xs text-gray-400">جارٍ التفكير...</span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
