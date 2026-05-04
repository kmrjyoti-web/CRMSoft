'use client';

import { useState } from 'react';
import { useAuth } from '../../hooks/auth/useAuth';

type Props = {
  brandName?: string;
  onSuccess?: () => void;
};

export default function DefaultLogin({ brandName = 'CRMSoft', onSuccess }: Props) {
  const { signIn, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await signIn(email, password);
      onSuccess?.();
    } catch {
      setError('Invalid credentials.');
    }
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0d1117',
      }}
    >
      <div
        style={{
          width: 'min(400px, 92vw)',
          background: '#161b22',
          border: '1px solid #30363d',
          borderRadius: 12,
          padding: '32px 28px',
        }}
      >
        <h1 style={{ color: '#c9d1d9', fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
          {brandName}
        </h1>
        <p style={{ color: '#8b949e', fontSize: 13, marginBottom: 24 }}>
          Sign in to your account
        </p>

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: 12, color: '#8b949e', marginBottom: 4 }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            style={{
              width: '100%',
              background: '#0d1117',
              border: '1px solid #30363d',
              borderRadius: 6,
              padding: '9px 12px',
              color: '#c9d1d9',
              fontSize: 14,
              outline: 'none',
              marginBottom: 14,
              boxSizing: 'border-box',
            }}
          />

          <label style={{ display: 'block', fontSize: 12, color: '#8b949e', marginBottom: 4 }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            style={{
              width: '100%',
              background: '#0d1117',
              border: '1px solid #30363d',
              borderRadius: 6,
              padding: '9px 12px',
              color: '#c9d1d9',
              fontSize: 14,
              outline: 'none',
              marginBottom: 14,
              boxSizing: 'border-box',
            }}
          />

          {error && (
            <p style={{ color: '#f87171', fontSize: 12, marginBottom: 10 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              background: '#1f6feb',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '10px',
              fontSize: 14,
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
