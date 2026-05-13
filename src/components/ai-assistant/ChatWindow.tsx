'use client';

import { useRef, useEffect } from 'react';
import { Bot, Loader2, User } from 'lucide-react';
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

  const accent = accentColor === 'teal'
    ? 'from-teal-600 to-blue-600'
    : 'from-blue-600 to-slate-900';

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/80 p-4 sm:p-6">
      {messages.length === 0 && (
        <div className="mx-auto flex max-w-md flex-col items-center justify-center py-20 text-center">
          <div className={`mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-sm`}>
            <Bot className="h-8 w-8" />
          </div>
          <h3 className="text-base font-black text-slate-950">{emptyTitle}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">{emptyDescription}</p>
        </div>
      )}

      <div className="mx-auto max-w-4xl space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div key={msg.id} className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
              <div className={cn(
                'grid h-9 w-9 flex-shrink-0 place-items-center rounded-full border shadow-sm',
                isUser ? 'border-slate-900 bg-slate-950 text-white' : 'border-slate-200 bg-white text-teal-700',
              )}>
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={cn(
                'max-w-2xl rounded-2xl px-4 py-3 text-sm leading-7 shadow-sm',
                isUser
                  ? 'rounded-tr-sm bg-slate-950 text-white'
                  : 'rounded-tl-sm border border-slate-200 bg-white text-slate-800',
              )}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <p className={cn('mt-2 text-[10px]', isUser ? 'text-white/55' : 'text-slate-400')}>
                  {formatDate(msg.createdAt, 'HH:mm')}
                </p>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3">
            <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-teal-700 shadow-sm">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              جار التفكير...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
