import { formatINR, discountPercent } from '../../lib/formatters';

interface PriceDisplayProps {
  price?: number;
  mrp?: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PriceDisplay({ price, mrp, size = 'md' }: PriceDisplayProps) {
  const discount = price && mrp ? discountPercent(mrp, price) : 0;

  const priceClass = {
    sm: 'text-base font-bold',
    md: 'text-xl font-bold',
    lg: 'text-2xl font-bold',
  }[size];

  if (!price) return null;

  return (
    <div className="flex items-center flex-wrap gap-2">
      <span className={`text-gray-900 ${priceClass}`}>{formatINR(price)}</span>
      {mrp && mrp > price && (
        <span className="text-gray-400 line-through text-sm">{formatINR(mrp)}</span>
      )}
      {discount > 0 && (
        <span className="bg-green-50 text-green-700 text-xs font-bold px-2 py-0.5 rounded-lg">
          {discount}% OFF
        </span>
      )}
    </div>
  );
}
