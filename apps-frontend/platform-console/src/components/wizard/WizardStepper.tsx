'use client';

import { clsx } from 'clsx';
import { Check } from 'lucide-react';

interface Step {
  label: string;
  description?: string;
}

interface WizardStepperProps {
  steps: Step[];
  current: number;
}

export function WizardStepper({ steps, current }: WizardStepperProps) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={clsx(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 transition-colors',
                  done && 'bg-[#238636] text-white',
                  active && 'bg-[#58a6ff] text-white',
                  !done && !active && 'bg-console-card border border-console-border text-console-muted',
                )}
              >
                {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <div className="text-center hidden sm:block">
                <p className={clsx('text-xs font-medium', active ? 'text-console-text' : 'text-console-muted')}>
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-[10px] text-console-muted/70">{step.description}</p>
                )}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className={clsx('h-px flex-1 mx-2 transition-colors', done ? 'bg-[#238636]' : 'bg-console-border')} />
            )}
          </div>
        );
      })}
    </div>
  );
}
