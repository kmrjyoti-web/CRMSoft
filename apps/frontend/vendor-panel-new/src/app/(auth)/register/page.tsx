'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Building2, Phone, Store } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import apiClient from '@/lib/api/client';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    companyName: '',
    contactEmail: '',
    phone: '',
    gstNumber: '',
    password: '',
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/marketplace/vendors', form);
      toast.success('Registration submitted! You will be approved shortly.');
      router.push('/login');
    } catch {
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
          <Store className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-xl">Register as Vendor</CardTitle>
        <CardDescription>Create your marketplace seller account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Business Name"
            leftIcon={<Building2 className="h-4 w-4" />}
            value={form.companyName}
            onChange={handleChange('companyName')}
            placeholder="Your Business Name"
            required
          />
          <Input
            label="Email"
            type="email"
            leftIcon={<Mail className="h-4 w-4" />}
            value={form.contactEmail}
            onChange={handleChange('contactEmail')}
            placeholder="vendor@example.com"
            required
          />
          <Input
            label="Phone"
            leftIcon={<Phone className="h-4 w-4" />}
            value={form.phone}
            onChange={handleChange('phone')}
            placeholder="+91 98765 43210"
          />
          <Input
            label="GST Number (Optional)"
            value={form.gstNumber}
            onChange={handleChange('gstNumber')}
            placeholder="22AAAAA0000A1Z5"
          />
          <Input
            label="Password"
            type="password"
            leftIcon={<Lock className="h-4 w-4" />}
            value={form.password}
            onChange={handleChange('password')}
            placeholder="Create a password"
            required
          />
          <Button type="submit" className="w-full" loading={loading}>
            Register
          </Button>
          <p className="text-center text-sm text-gray-500">
            Already registered?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
