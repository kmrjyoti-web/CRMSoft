"use client";

import { Button, Icon } from "@/components/ui";

// ── WorkflowGettingStarted ────────────────────────────────

export function WorkflowGettingStarted({
  onAddState,
  onShowHelp,
}: {
  onAddState: () => void;
  onShowHelp: () => void;
}) {
  return (
    <div className="mt-6 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-8">
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
          <Icon name="activity" size={32} className="text-blue-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          Build Your Workflow Pipeline
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Follow these steps to configure your workflow. Each step builds on the
          previous one.
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-md space-y-4">
        {/* Step 1 */}
        <div className="flex items-start gap-4 rounded-lg bg-white p-4 shadow-sm">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
            1
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Add States</p>
            <p className="mt-0.5 text-xs text-gray-500">
              Define the stages your entity will pass through. Start with an Initial state,
              add Intermediate stages, and finish with Terminal states (Won/Lost).
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={onAddState}
              className="mt-2"
            >
              <Icon name="plus" size={14} /> Add First State
            </Button>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex items-start gap-4 rounded-lg bg-white p-4 opacity-60 shadow-sm">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-400">
            2
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Add Transitions</p>
            <p className="mt-0.5 text-xs text-gray-500">
              Connect your states with transitions to define allowed movements.
              For example: New &rarr; Verified, Verified &rarr; Allocated.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex items-start gap-4 rounded-lg bg-white p-4 opacity-60 shadow-sm">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-400">
            3
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Validate &amp; Publish</p>
            <p className="mt-0.5 text-xs text-gray-500">
              Validate your workflow to check for errors, then publish to activate
              it for use.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={onShowHelp}
          className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
        >
          <Icon name="help-circle" size={14} className="mr-1 inline" />
          Read the full Workflow Builder Guide
        </button>
      </div>
    </div>
  );
}
