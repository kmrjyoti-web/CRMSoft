'use client';

import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface WizardNavProps {
  step: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  onFinish: () => void;
  nextDisabled?: boolean;
  finishing?: boolean;
  finishLabel?: string;
}

export function WizardNav({
  step,
  totalSteps,
  onPrev,
  onNext,
  onFinish,
  nextDisabled = false,
  finishing = false,
  finishLabel = 'Create',
}: WizardNavProps) {
  const isLast = step === totalSteps - 1;

  return (
    <div className="flex items-center justify-between pt-4 border-t border-console-border">
      <button
        type="button"
        onClick={onPrev}
        disabled={step === 0}
        className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-md text-console-muted hover:text-console-text hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-3.5 h-3.5" /> Previous
      </button>

      {isLast ? (
        <button
          type="button"
          onClick={onFinish}
          disabled={finishing || nextDisabled}
          className="flex items-center gap-1.5 text-xs px-4 py-2 bg-[#238636] hover:bg-[#238636]/80 disabled:opacity-50 text-white rounded-md transition-colors"
        >
          {finishing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {finishLabel}
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className="flex items-center gap-1.5 text-xs px-4 py-2 bg-console-accent hover:bg-console-accent/80 disabled:opacity-50 text-white rounded-md transition-colors"
        >
          Next <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
