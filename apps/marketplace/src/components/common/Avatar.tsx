'use client';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: number;
  className?: string;
}

export function Avatar({ src, name, size = 40, className = '' }: AvatarProps) {
  const initials = name
    ? name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const colors = ['bg-orange-400', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500'];
  const color = colors[(name?.charCodeAt(0) ?? 0) % colors.length];

  if (src) {
    return (
      <img
        src={src}
        alt={name ?? 'avatar'}
        width={size}
        height={size}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`${color} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}
