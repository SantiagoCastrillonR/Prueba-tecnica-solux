import Link from 'next/link';
import { cn } from '@/lib/cn';
import { chatTitle, formatListTime } from '@/lib/format';
import { Avatar } from '@/components/ui/Avatar';
import type { Chat } from '@/types';

interface ChatListItemProps {
  chat: Chat;
  currentUserId: string;
  active: boolean;
}

export function ChatListItem({
  chat,
  currentUserId,
  active,
}: ChatListItemProps) {
  const title = chatTitle(chat, currentUserId);
  const last = chat.lastMessage;
  const preview = last
    ? `${last.sender.id === currentUserId ? 'Tú' : last.sender.name.split(' ')[0]}: ${last.body}`
    : 'Aún no hay mensajes';

  return (
    <Link
      href={`/chats/${chat.id}`}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex items-center gap-3 rounded-xl px-3 py-3 transition-colors',
        active ? 'bg-brand-50' : 'hover:bg-ink-100'
      )}
    >
      <Avatar name={title} />
      <div className='min-w-0 flex-1'>
        <div className='flex items-baseline justify-between gap-2'>
          <p className='truncate text-sm font-semibold text-ink-900'>{title}</p>
          <time
            dateTime={last?.createdAt}
            className='shrink-0 text-xs text-ink-400'
          >
            {last ? formatListTime(last.createdAt) : ''}
          </time>
        </div>
        <p className='truncate text-sm text-ink-500'>{preview}</p>
      </div>
    </Link>
  );
}
