'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { useChats } from '@/hooks/useChats';
import { useAuth } from '@/hooks/useAuth';
import { usersService } from '@/services/users.service';
import { chatsService } from '@/services/chats.service';
import { createChatSchema, CHAT_NAME_MAX_LENGTH } from '@/schemas/chat';
import { validate } from '@/lib/validation';
import { getErrorMessage, isUnauthorized } from '@/lib/errors';
import { Alert } from '@/components/ui/Alert';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import type { User } from '@/types';

type UsersState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; users: User[] };

export function NewChatDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { expireSession } = useAuth();
  const { upsertChat } = useChats();
  const [usersState, setUsersState] = useState<UsersState>({
    status: 'loading',
  });
  const [attempt, setAttempt] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    usersService
      .list()
      .then((users) => !cancelled && setUsersState({ status: 'ready', users }))
      .catch((err: unknown) => {
        if (cancelled) return;
        if (isUnauthorized(err)) return expireSession();
        setUsersState({
          status: 'error',
          message: getErrorMessage(err, 'No se pudieron cargar los usuarios.'),
        });
      });
    return () => {
      cancelled = true;
    };
  }, [attempt, expireSession]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, submitting]);

  const visibleUsers = useMemo(() => {
    if (usersState.status !== 'ready') return [];
    const term = query.trim().toLowerCase();
    return usersState.users.filter(
      (u) =>
        !term ||
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
    );
  }, [usersState, query]);

  const isGroup = selected.length > 1;

  const toggle = (id: string) => {
    setError(null);
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;
    const result = validate(createChatSchema, {
      participantIds: selected,
      name: name.trim() || undefined,
    });
    if (!result.success) {
      return setError(
        result.errors.participantIds ??
          result.errors.name ??
          'Revisa los datos.'
      );
    }

    setSubmitting(true);
    setError(null);
    try {
      const chat = await chatsService.create(result.data);
      upsertChat(chat);
      onClose();
      router.push(`/chats/${chat.id}`);
    } catch (err) {
      if (isUnauthorized(err)) return expireSession();
      setError(getErrorMessage(err, 'No se pudo crear el chat.'));
      setSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='fixed inset-0 z-50 flex items-end justify-center bg-ink-900/40 p-0 sm:items-center sm:p-4'
      onMouseDown={(e) =>
        e.target === e.currentTarget && !submitting && onClose()
      }
    >
      <motion.form
        role='dialog'
        aria-modal='true'
        aria-labelledby='new-chat-title'
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        onSubmit={onSubmit}
        noValidate
        className='flex max-h-[90dvh] w-full max-w-md flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl'
      >
        <div className='border-b border-ink-200 px-5 py-4'>
          <h2
            id='new-chat-title'
            className='text-lg font-semibold text-ink-900'
          >
            Nuevo chat
          </h2>
          <p className='text-sm text-ink-500'>
            Elige una persona para un chat directo, o varias para un grupo.
          </p>
        </div>

        <div className='space-y-3 px-5 pt-4'>
          <Input
            label='Buscar'
            type='search'
            placeholder='Nombre o correo'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className='min-h-40 flex-1 scrollbar-thin overflow-y-auto px-3 py-2'>
          {usersState.status === 'loading' && (
            <ul className='space-y-2 px-2' aria-label='Cargando usuarios'>
              {[0, 1, 2, 3].map((i) => (
                <li key={i} className='flex items-center gap-3 py-2'>
                  <Skeleton className='size-9 rounded-full' />
                  <Skeleton className='h-4 w-40' />
                </li>
              ))}
            </ul>
          )}
          {usersState.status === 'error' && (
            <div className='space-y-3 px-2 py-4'>
              <Alert>{usersState.message}</Alert>
              <Button
                variant='secondary'
                onClick={() => {
                  setUsersState({ status: 'loading' });
                  setAttempt((n) => n + 1);
                }}
              >
                Reintentar
              </Button>
            </div>
          )}
          {usersState.status === 'ready' && visibleUsers.length === 0 && (
            <p className='px-2 py-6 text-center text-sm text-ink-500'>
              {usersState.users.length === 0
                ? 'Aún no hay otros usuarios registrados.'
                : 'Ningún usuario coincide con la búsqueda.'}
            </p>
          )}
          {usersState.status === 'ready' && visibleUsers.length > 0 && (
            <ul>
              {visibleUsers.map((user) => (
                <li key={user.id}>
                  <label className='flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-ink-50'>
                    <input
                      type='checkbox'
                      checked={selected.includes(user.id)}
                      disabled={submitting}
                      onChange={() => toggle(user.id)}
                      className='size-4 accent-brand-600'
                    />
                    <Avatar name={user.name} size='sm' />
                    <span className='min-w-0'>
                      <span className='block truncate text-sm font-medium text-ink-900'>
                        {user.name}
                      </span>
                      <span className='block truncate text-xs text-ink-500'>
                        {user.email}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className='space-y-3 border-t border-ink-200 px-5 py-4'>
          {isGroup && (
            <Input
              label='Nombre del grupo (opcional)'
              placeholder='Equipo de proyecto'
              maxLength={CHAT_NAME_MAX_LENGTH}
              value={name}
              disabled={submitting}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          {error && <Alert>{error}</Alert>}
          <div className='flex justify-end gap-2'>
            <Button variant='ghost' onClick={onClose} disabled={submitting}>
              Cancelar
            </Button>
            <Button
              type='submit'
              loading={submitting}
              disabled={selected.length === 0}
            >
              {isGroup ? `Crear grupo (${selected.length})` : 'Iniciar chat'}
            </Button>
          </div>
        </div>
      </motion.form>
    </motion.div>
  );
}
