'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema, type LoginInput } from '@/schemas/auth';
import { validate, type FieldErrors } from '@/lib/validation';
import { getErrorMessage } from '@/lib/errors';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [values, setValues] = useState<LoginInput>({ email: '', password: '' });
  const [errors, setErrors] = useState<FieldErrors<LoginInput>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const change = (field: keyof LoginInput) => (value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;
    setServerError(null);

    const result = validate(loginSchema, values);
    if (!result.success) return setErrors(result.errors);

    setSubmitting(true);
    try {
      await login(result.data);
      router.replace('/chats');
    } catch (error) {
      setServerError(getErrorMessage(error, 'No se pudo iniciar sesión.'));
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className='space-y-5'>
      <div>
        <h1 className='text-xl font-semibold text-ink-900'>Iniciar sesión</h1>
        <p className='mt-1 text-sm text-ink-500'>
          Ingresa con tu correo y contraseña.
        </p>
      </div>

      {serverError && <Alert>{serverError}</Alert>}

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
        autoComplete='current-password'
        value={values.password}
        error={errors.password}
        disabled={submitting}
        onChange={(e) => change('password')(e.target.value)}
      />

      <Button type='submit' loading={submitting} className='w-full'>
        {submitting ? 'Ingresando…' : 'Ingresar'}
      </Button>

      <p className='text-center text-sm text-ink-500'>
        ¿No tienes cuenta?{' '}
        <Link
          href='/register'
          className='font-semibold text-brand-700 hover:underline'
        >
          Regístrate
        </Link>
      </p>
    </form>
  );
}
