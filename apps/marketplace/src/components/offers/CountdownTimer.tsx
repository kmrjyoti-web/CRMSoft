'use client';

import { useEffect, useState } from 'react';
import { getCountdown } from '../../lib/formatters';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  expiresAt?: string;
  endsAt?: string;
  className?: string;
}

export function CountdownTimer({ expiresAt, endsAt, className = '' }: CountdownTimerProps) {
  const dateStr = expiresAt ?? endsAt ?? '';
  const [cd, setCd] = useState(() => getCountdown(dateStr));

  useEffect(() => {
    if (!dateStr) return;
    const interval = setInterval(() => setCd(getCountdown(dateStr)), 1000);
    return () => clearInterval(interval);
  }, [dateStr]);

  if (!dateStr || cd.expired) {
    return <span className={`text-gray-400 text-sm ${className}`}>Expired</span>;
  }

  return (
    <span className={`flex items-center gap-1 text-orange-600 font-mono font-semibold ${className}`}>
      <Clock size={14} />
      {cd.label}
    </span>
  );
}
