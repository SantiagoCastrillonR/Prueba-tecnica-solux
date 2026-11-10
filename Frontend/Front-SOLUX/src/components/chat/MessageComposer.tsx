'use client';

import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { MESSAGE_MAX_LENGTH, messageSchema } from '@/schemas/chat';
import { Button } from '@/components/ui/Button';

interface MessageComposerProps {
  onSend: (body: string) => void;
}

export function MessageComposer({ onSend }: MessageComposerProps) {
  const [body, setBody] = useState('');
  const canSend = messageSchema.safeParse({ body }).success;

  function submit(event?: FormEvent) {
    event?.preventDefault();
    const result = messageSchema.safeParse({ body });
    if (!result.success) return;
    onSend(result.data.body);
    setBody('');
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <form
      onSubmit={submit}
      className='flex items-end gap-2 border-t border-ink-200 bg-white p-3'
    >
      <label htmlFor='message-body' className='sr-only'>
        Escribe un mensaje
      </label>
      <textarea
        id='message-body'
        rows={1}
        value={body}
        maxLength={MESSAGE_MAX_LENGTH}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder='Escribe un mensaje…'
        className='field-sizing-content max-h-32 min-h-11 flex-1 resize-none rounded-xl border border-ink-300 bg-white px-3.5 py-2.5 text-sm shadow-sm placeholder:text-ink-400 hover:border-ink-400'
      />
      <Button type='submit' disabled={!canSend} className='h-11 px-5'>
        Enviar
      </Button>
    </form>
  );
}
