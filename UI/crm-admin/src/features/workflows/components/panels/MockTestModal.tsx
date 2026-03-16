'use client';

import { useState, useCallback, useMemo } from 'react';

import { Icon, Button, Badge, SelectInput } from '@/components/ui';

import type { WorkflowExecutionResult } from '../../types/visual-workflow.types';
import { generateSampleDataForEntity } from '../../utils/sample-data-generator';
import { workflowMockService } from '../../services/workflow-mock.service';
import type { MockExecutionOptions } from '../../services/workflow-mock.service';
import { MockDataEditor } from './MockDataEditor';
import { TRIGGER_EVENTS } from '../../constants/trigger-events';

// ── Props ───────────────────────────────────────────────

export interface MockTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: any[];
  edges: any[];
  onExecutionComplete: (result: WorkflowExecutionResult) => void;
}

// ── Styles ──────────────────────────────────────────────

const OVERLAY_STYLE: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const DIALOG_STYLE: React.CSSProperties = {
  background: '#fff',
  borderRadius: 12,
  width: '100%',
  maxWidth: 700,
  maxHeight: '85vh',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
  overflow: 'hidden',
};

const HEADER_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 20px',
  borderBottom: '1px solid #e5e7eb',
};

const HEADER_TITLE_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontSize: 16,
  fontWeight: 600,
  color: '#111827',
};

const TAB_BAR_STYLE: React.CSSProperties = {
  display: 'flex',
  borderBottom: '1px solid #e5e7eb',
  padding: '0 20px',
};

const TAB_STYLE: React.CSSProperties = {
  padding: '10px 16px',
  fontSize: 13,
  fontWeight: 500,
  color: '#6b7280',
  cursor: 'pointer',
  borderBottom: '2px solid transparent',
  background: 'none',
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
};

const TAB_ACTIVE_STYLE: React.CSSProperties = {
  ...TAB_STYLE,
  color: '#3b82f6',
  borderBottom: '2px solid #3b82f6',
};

const BODY_STYLE: React.CSSProperties = {
  flex: 1,
  padding: 20,
  overflowY: 'auto',
};

const FOOTER_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: 8,
  padding: '12px 20px',
  borderTop: '1px solid #e5e7eb',
  background: '#f9fafb',
};

const CONFIG_ROW_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 0',
  borderBottom: '1px solid #f3f4f6',
};

const CONFIG_LABEL_STYLE: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 500,
  color: '#374151',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
};

const SELECT_STYLE: React.CSSProperties = {
  padding: '6px 12px',
  fontSize: 13,
  borderRadius: 6,
  border: '1px solid #d1d5db',
  background: '#fff',
  color: '#374151',
  cursor: 'pointer',
};

const CHECKBOX_ROW_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '10px 0',
  borderBottom: '1px solid #f3f4f6',
  fontSize: 13,
  color: '#374151',
  cursor: 'pointer',
};

// ── Helpers ─────────────────────────────────────────────

/**
 * Detect the entity type from the trigger node configuration.
 */
function detectEntityFromNodes(nodes: any[]): string {
  const triggerNode = nodes.find(
    (n: any) => n.data?.nodeCategory === 'trigger',
  );
  if (!triggerNode) return 'lead';

  const eventCode: string = triggerNode.data?.config?.eventCode || '';
  if (eventCode) {
    const event = TRIGGER_EVENTS.find((e) => e.code === eventCode);
    if (event?.entity) return event.entity.toLowerCase();
  }

  // Fall back to parsing the event code prefix
  const prefix = eventCode.split('.')[0];
  if (prefix) return prefix;

  return 'lead';
}

// ── Component ──────────────────────────────────────────

export function MockTestModal({
  isOpen,
  onClose,
  nodes,
  edges,
  onExecutionComplete,
}: MockTestModalProps) {
  const [activeTab, setActiveTab] = useState<'data' | 'config'>('data');
  const [isRunning, setIsRunning] = useState(false);

  // Detect entity type from trigger node
  const entityType = useMemo(() => detectEntityFromNodes(nodes), [nodes]);

  // Sample data state
  const [sampleData, setSampleData] = useState(() =>
    JSON.stringify(generateSampleDataForEntity(entityType), null, 2),
  );

  // Configuration state
  const [speed, setSpeed] = useState<MockExecutionOptions['speed']>('normal');
  const [showAnimation, setShowAnimation] = useState(true);
  const [stopOnError, setStopOnError] = useState(false);

  // Randomize sample data
  const handleRandomize = useCallback(() => {
    const newData = generateSampleDataForEntity(entityType);
    setSampleData(JSON.stringify(newData, null, 2));
  }, [entityType]);

  // Run mock test
  const handleRunTest = useCallback(async () => {
    let parsedData: Record<string, any>;
    try {
      parsedData = JSON.parse(sampleData);
    } catch {
      return; // Don't run if JSON is invalid
    }

    setIsRunning(true);

    try {
      const options: MockExecutionOptions = {
        speed,
        showAnimation,
        stopOnError,
        sampleData: parsedData,
      };

      const result = await workflowMockService.execute(nodes, edges, options);
      onExecutionComplete(result);
      onClose();
    } finally {
      setIsRunning(false);
    }
  }, [sampleData, speed, showAnimation, stopOnError, nodes, edges, onExecutionComplete, onClose]);

  // Validate JSON for the Run button
  const isDataValid = useMemo(() => {
    try {
      JSON.parse(sampleData);
      return true;
    } catch {
      return false;
    }
  }, [sampleData]);

  if (!isOpen) return null;

  return (
    <div style={OVERLAY_STYLE} onClick={onClose}>
      <div style={DIALOG_STYLE} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={HEADER_STYLE}>
          <div style={HEADER_TITLE_STYLE}>
            <Icon name="play" size={18} color="#3b82f6" />
            Test Workflow
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isRunning}>
            <Icon name="x" size={18} />
          </Button>
        </div>

        {/* Tab Bar */}
        <div style={TAB_BAR_STYLE}>
          <button
            style={activeTab === 'data' ? TAB_ACTIVE_STYLE : TAB_STYLE}
            onClick={() => setActiveTab('data')}
          >
            <Icon name="database" size={14} />
            Sample Data
          </button>
          <button
            style={activeTab === 'config' ? TAB_ACTIVE_STYLE : TAB_STYLE}
            onClick={() => setActiveTab('config')}
          >
            <Icon name="settings" size={14} />
            Configuration
          </button>
        </div>

        {/* Body */}
        <div style={BODY_STYLE}>
          {activeTab === 'data' && (
            <div>
              {/* Entity indicator */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 12,
                  fontSize: 13,
                  color: '#6b7280',
                }}
              >
                <Icon name="info" size={14} color="#3b82f6" />
                <span>
                  Detected trigger entity:{' '}
                  <Badge variant="primary">
                    {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
                  </Badge>
                </span>
              </div>

              {/* JSON Editor */}
              <MockDataEditor
                value={sampleData}
                onChange={setSampleData}
                entityType={entityType}
                onRandomize={handleRandomize}
              />
            </div>
          )}

          {activeTab === 'config' && (
            <div>
              {/* Speed Control */}
              <div style={CONFIG_ROW_STYLE}>
                <div style={CONFIG_LABEL_STYLE}>
                  <Icon name="timer" size={14} color="#6b7280" />
                  Execution Speed
                </div>
                <div style={{ minWidth: 200 }}>
                  <SelectInput
                    value={speed}
                    onChange={(v) => setSpeed((v as MockExecutionOptions['speed']) ?? 'normal')}
                    options={[
                      { value: 'instant', label: 'Instant' },
                      { value: 'normal', label: 'Normal (1s per node)' },
                      { value: 'slow', label: 'Slow (2s per node)' },
                    ]}
                  />
                </div>
              </div>

              {/* Show Animation */}
              <label style={CHECKBOX_ROW_STYLE}>
                <input
                  type="checkbox"
                  checked={showAnimation}
                  onChange={(e) => setShowAnimation(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: '#3b82f6' }}
                />
                <Icon name="activity" size={14} color="#6b7280" />
                Show step-by-step animation
              </label>

              {/* Stop on Error */}
              <label style={CHECKBOX_ROW_STYLE}>
                <input
                  type="checkbox"
                  checked={stopOnError}
                  onChange={(e) => setStopOnError(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: '#3b82f6' }}
                />
                <Icon name="alert-circle" size={14} color="#6b7280" />
                Stop on error
              </label>

              {/* Info */}
              <div
                style={{
                  marginTop: 16,
                  padding: 12,
                  background: '#eff6ff',
                  borderRadius: 8,
                  fontSize: 12,
                  color: '#1d4ed8',
                  lineHeight: 1.5,
                }}
              >
                <div style={{ display: 'flex', gap: 8 }}>
                  <Icon name="info" size={14} color="#3b82f6" />
                  <div>
                    <strong>Mock test mode</strong>
                    <br />
                    No actual emails, messages, or API calls will be made. Conditions
                    evaluate randomly (70% yes / 30% no). Delays are skipped. All
                    action nodes are simulated as successful.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={FOOTER_STYLE}>
          <Button variant="secondary" onClick={onClose} disabled={isRunning}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleRunTest}
            disabled={isRunning || !isDataValid}
          >
            {isRunning ? (
              <>
                <Icon name="loader" size={14} className="animate-spin" />
                <span style={{ marginLeft: 6 }}>Running...</span>
              </>
            ) : (
              <>
                <Icon name="play" size={14} />
                <span style={{ marginLeft: 6 }}>Run Test</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
