'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Store, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth-store';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showAdminLink, setShowAdminLink] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setErrorMessage(null);
    setShowAdminLink(false);

    try {
      await login(email, password);
      toast.success('Welcome back!');
      router.push('/');
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: { message?: string } } };
      const status = err?.response?.status;
      const message = err?.response?.data?.message || 'Login failed. Please check your credentials.';

      if (status === 403) {
        // Vendor-only portal rejection (admin/platform user)
        setErrorMessage(message);
        setShowAdminLink(message.includes('admin portal') || message.includes('vendors only'));
        toast.error(message);
      } else if (status === 401) {
        setErrorMessage('Invalid email or password');
        toast.error('Invalid credentials');
      } else {
        setErrorMessage(message);
        toast.error(message);
      }
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
          <Store className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-xl">Vendor Portal</CardTitle>
        <CardDescription>Sign in to manage your marketplace</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{errorMessage}</p>
              {showAdminLink && (
                <a
                  href="http://localhost:3005/login"
                  className="text-sm text-red-600 underline mt-1 inline-block"
                >
                  Go to CRM Admin Portal &rarr;
                </a>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            leftIcon={<Mail className="h-4 w-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vendor@example.com"
            required
          />
          <Input
            label="Password"
            type="password"
            leftIcon={<Lock className="h-4 w-4" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
          />
          <Button type="submit" className="w-full" loading={isLoading}>
            Sign In
          </Button>
          <p className="text-center text-sm text-gray-500">
            New vendor?{' '}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Register your business
            </Link>
          </p>
        </form>

        {/* Admin redirect */}
        <p className="text-center text-xs text-gray-400 mt-4">
          Are you an admin?{' '}
          <a href="http://localhost:3005/login" className="text-primary hover:underline">
            Login to CRM Admin Portal
          </a>
        </p>
      </CardContent>
    </Card>
  );
}
