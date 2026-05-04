'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CustomizeRedirectPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/settings/templates/${params.id}/designer`);
  }, [params.id, router]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#6b7280' }}>
      Redirecting to Designer...
    </div>
  );
}
