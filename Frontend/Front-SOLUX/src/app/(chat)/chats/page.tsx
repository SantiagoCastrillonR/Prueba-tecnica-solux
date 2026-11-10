import type { Metadata } from 'next';
import { Logo } from '@/components/ui/Logo';

export const metadata: Metadata = { title: 'Chats' };

export default function ChatsPage() {
  return (
    <div className='flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center'>
      <Logo tone='light' tagline className='text-4xl' />
      <p className='max-w-xs text-sm text-ink-500'>
        Selecciona una conversación de la lista o crea un chat nuevo para
        empezar.
      </p>
    </div>
  );
}
