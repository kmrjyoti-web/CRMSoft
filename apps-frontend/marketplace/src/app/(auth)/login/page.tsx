'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '../../../lib/validators';
import { useLogin } from '../../../hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema) as any,
  });

  const onSubmit = async (data: LoginInput) => {
    await login.mutateAsync(data);
    router.replace('/feed');
  };

  return (
    <div className="flex flex-col flex-1 px-6 py-12">
      {/* Logo */}
      <div className="mb-10 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-orange-200">
          <span className="text-white font-bold text-2xl">M</span>
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">CRMSoft Market</h1>
        <p className="text-sm text-gray-500 mt-1">Connect, discover & trade</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
        <div>
          <input
            {...register('email')}
            type="email"
            placeholder="Email address"
            autoComplete="email"
            className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-sm focus:outline-none focus:border-orange-400"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <input
            {...register('password')}
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-sm focus:outline-none focus:border-orange-400"
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        {login.error && (
          <p className="text-red-500 text-sm text-center">
            {(login.error as Error).message || 'Login failed. Please try again.'}
          </p>
        )}

        <button
          type="submit"
          disabled={login.isPending}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 rounded-xl disabled:opacity-60 shadow-lg shadow-orange-200"
        >
          {login.isPending ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-orange-500 font-semibold">
          Create one
        </Link>
      </p>
    </div>
  );
}
