'use client';

import { X, Link2, MessageCircle } from 'lucide-react';
import { buildShareUrls, copyToClipboard, shareNative } from '../../lib/share';
import { useState } from 'react';

interface ShareSheetProps {
  entityType: 'listing' | 'post' | 'offer';
  entityId: string;
  title: string;
  onClose: () => void;
}

export function ShareSheet({ entityType, entityId, title, onClose }: ShareSheetProps) {
  const [copied, setCopied] = useState(false);
  const { url, whatsapp } = buildShareUrls(entityType, entityId, title);

  const handleCopy = async () => {
    await copyToClipboard(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    try {
      await shareNative(title, url);
      onClose();
    } catch {
      // Fallback to copy
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-white rounded-t-3xl w-full max-w-lg mx-auto p-6 pb-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900">Share</h3>
          <button onClick={onClose}><X size={20} className="text-gray-500" /></button>
        </div>
        <div className="flex gap-4">
          <ShareButton icon="🟢" label="WhatsApp" href={whatsapp} />
          <ShareButton icon={<Link2 size={22} />} label={copied ? 'Copied!' : 'Copy Link'} onClick={handleCopy} />
          <ShareButton icon={<MessageCircle size={22} />} label="Share" onClick={handleNativeShare} />
        </div>
      </div>
    </div>
  );
}

function ShareButton({
  icon, label, href, onClick,
}: {
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
}) {
  const cls = 'flex flex-col items-center gap-1.5';
  const inner = (
    <>
      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-2xl">
        {icon}
      </div>
      <span className="text-xs text-gray-600 text-center">{label}</span>
    </>
  );

  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>;
  return <button className={cls} onClick={onClick}>{inner}</button>;
}
