'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { registerSchema, type RegisterInput } from '@/schemas/auth';
import { validate, type FieldErrors } from '@/lib/validation';
import { ApiError } from '@/lib/api';
import { getErrorMessage } from '@/lib/errors';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const [values, setValues] = useState<RegisterInput>({
    name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FieldErrors<RegisterInput>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const change = (field: keyof RegisterInput) => (value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;
    setServerError(null);

    const result = validate(registerSchema, values);
    if (!result.success) return setErrors(result.errors);

    setSubmitting(true);
    try {
      await register(result.data);
      router.replace('/chats');
    } catch (error) {
      if (error instanceof ApiError && error.code === 'USER_ALREADY_EXISTS') {
        setErrors({ email: getErrorMessage(error) });
      } else {
        setServerError(getErrorMessage(error, 'No se pudo crear la cuenta.'));
      }
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className='space-y-5'>
      <div>
        <h1 className='text-xl font-semibold text-ink-900'>Crear cuenta</h1>
        <p className='mt-1 text-sm text-ink-500'>
          Regístrate para empezar a conversar.
        </p>
      </div>

      {serverError && <Alert>{serverError}</Alert>}

      <Input
        label='Nombre'
        autoComplete='name'
        placeholder='Tu nombre'
        value={values.name}
        error={errors.name}
        disabled={submitting}
        onChange={(e) => change('name')(e.target.value)}
      />
      <Input
        label='Correo electrónico'
        type='email'
        autoComplete='email'
        placeholder='tu@correo.com'
        value={values.email}
        error={errors.email}
        disabled={submitting}
        onChange={(e) => change('email')(e.target.value)}
      />
      <Input
        label='Contraseña'
        type='password'
        autoComplete='new-password'
        placeholder='Mínimo 8 caracteres'
        value={values.password}
        error={errors.password}
        disabled={submitting}
        onChange={(e) => change('password')(e.target.value)}
      />

      <Button type='submit' loading={submitting} className='w-full'>
        {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
      </Button>

      <p className='text-center text-sm text-ink-500'>
        ¿Ya tienes cuenta?{' '}
        <Link
          href='/login'
          className='font-semibold text-brand-700 hover:underline'
        >
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
