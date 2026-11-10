import { motion } from 'motion/react';
import { cn } from '@/lib/cn';
import { formatTime } from '@/lib/format';
import type { UiMessage } from '@/lib/messages';

interface MessageBubbleProps {
  message: UiMessage;
  mine: boolean;
  onRetry: (clientId: string) => void;
}

export function MessageBubble({ message, mine, onRetry }: MessageBubbleProps) {
  const failed = message.status === 'failed';
  const sending = message.status === 'sending';

  return (
    <motion.li
      layout='position'
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18 }}
      className={cn('flex', mine ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-3.5 py-2 shadow-sm sm:max-w-[70%]',
          mine
            ? 'rounded-br-md bg-brand-500 text-ink-950'
            : 'rounded-bl-md bg-white text-ink-950',
          failed && 'bg-red-50 text-red-900 ring-1 ring-red-300',
          sending && 'opacity-70'
        )}
      >
        <p
          className={cn(
            'mb-0.5 text-xs font-semibold',
            mine && !failed ? 'text-ink-800' : 'text-brand-700'
          )}
        >
          {mine ? 'Tú' : message.sender.name}
        </p>
        <p className='text-sm break-words whitespace-pre-wrap'>
          {message.body}
        </p>
        <div
          className={cn(
            'mt-1 flex items-center justify-end gap-2 text-[11px]',
            mine && !failed ? 'text-ink-700' : 'text-ink-500'
          )}
        >
          {failed ? (
            <>
              <span>No se envió</span>
              <button
                type='button'
                onClick={() => onRetry(message.clientId)}
                className='font-semibold underline'
              >
                Reintentar
              </button>
            </>
          ) : sending ? (
            <span>Enviando…</span>
          ) : (
            <time dateTime={message.createdAt}>
              {formatTime(message.createdAt)}
            </time>
          )}
        </div>
      </div>
    </motion.li>
  );
}
