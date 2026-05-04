'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '../../../lib/validators';
import { useRegister } from '../../../hooks/useAuth';

export default function RegisterPage() {
  const router = useRouter();
  const register_ = useRegister();
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema) as any,
  });

  const onSubmit = async (data: RegisterInput) => {
    await register_.mutateAsync(data);
    router.replace('/feed');
  };

  return (
    <div className="flex flex-col flex-1 px-6 py-10">
      <div className="mb-8 text-center">
        <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-orange-200">
          <span className="text-white font-bold text-xl">M</span>
        </div>
        <h1 className="mt-3 text-xl font-bold text-gray-900">Create Account</h1>
        <p className="text-sm text-gray-500 mt-1">Join the marketplace</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <input
              {...register('firstName')}
              placeholder="First name"
              className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm focus:outline-none focus:border-orange-400"
            />
            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
          </div>
          <div>
            <input
              {...register('lastName')}
              placeholder="Last name"
              className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>
        </div>

        <div>
          <input
            {...register('email')}
            type="email"
            placeholder="Email address"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-orange-400"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <input
            {...register('phone')}
            type="tel"
            placeholder="Phone number"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-orange-400"
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
        </div>

        <div>
          <input
            {...register('businessName')}
            placeholder="Business name (optional)"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-orange-400"
          />
        </div>

        <div>
          <input
            {...register('password')}
            type="password"
            placeholder="Password (min 8 characters)"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-orange-400"
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        {register_.error && (
          <p className="text-red-500 text-sm text-center">
            {(register_.error as Error).message || 'Registration failed. Please try again.'}
          </p>
        )}

        <button
          type="submit"
          disabled={register_.isPending}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 rounded-xl disabled:opacity-60 shadow-lg shadow-orange-200 mt-2"
        >
          {register_.isPending ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="text-orange-500 font-semibold">
          Sign in
        </Link>
      </p>
    </div>
  );
}
