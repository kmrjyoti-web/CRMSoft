interface RedemptionProgressProps {
  current: number;
  max: number;
}

export function RedemptionProgress({ current, max }: RedemptionProgressProps) {
  const pct = Math.min(100, Math.round((current / max) * 100));
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-500">
        <span>{current} redeemed</span>
        <span>{max - current} left</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
