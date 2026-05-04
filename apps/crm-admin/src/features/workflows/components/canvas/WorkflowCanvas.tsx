'use client';

import {
  useCallback,
  useRef,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  type OnConnect,
  type ReactFlowInstance,
  BackgroundVariant,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Icon } from '@/components/ui';

import { NODE_CATEGORIES, getNodeDefinition } from '../../constants/node-definitions';
import { useWorkflowCanvasStore } from '../../stores/workflow-canvas.store';
import { workflowsService } from '../../services/workflows.service';
import type {
  BaseNodeData,
  NodeDefinition,
  WorkflowExecutionResult,
} from '../../types/visual-workflow.types';

import { NodePalette } from '../panels/NodePalette';
import { NodeConfigPanel } from '../panels/NodeConfigPanel';
import { WorkflowHeader } from '../panels/WorkflowHeader';
import { ExecutionPanel } from '../panels/ExecutionPanel';
import { TemplatePicker } from '../panels/TemplatePicker';
import { AiWorkflowButton } from '../panels/AiWorkflowButton';
import { AiWorkflowPanel } from '../panels/AiWorkflowPanel';
import { MockTestModal } from '../panels/MockTestModal';
import { MockResultsPanel } from '../panels/MockResultsPanel';
import type { WorkflowTemplate } from '../../constants/predefined-workflows';

// ── Custom Node Component ───────────────────────────────

function WorkflowNodeComponent({ data, selected }: { data: any; selected?: boolean }) {
  const nd = data as BaseNodeData;

  const statusColor = useMemo(() => {
    switch (nd.executionStatus) {
      case 'running':
        return '#f59e0b';
      case 'success':
        return '#22c55e';
      case 'error':
        return '#ef4444';
      case 'skipped':
        return '#9ca3af';
      default:
        return undefined;
    }
  }, [nd.executionStatus]);

  return (
    <div
      style={{
        background: '#fff',
        border: `2px solid ${selected ? nd.color : statusColor ?? '#e5e7eb'}`,
        borderRadius: 10,
        padding: '10px 14px',
        minWidth: 160,
        maxWidth: 220,
        boxShadow: selected
          ? `0 0 0 2px ${nd.color}30`
          : '0 1px 3px rgba(0,0,0,0.08)',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            borderRadius: 6,
            background: nd.color + '18',
            flexShrink: 0,
          }}
        >
          <Icon name={nd.icon as any} size={14} color={nd.color} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#1f2937',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {nd.label}
          </div>
          {nd.description && (
            <div
              style={{
                fontSize: 10,
                color: '#9ca3af',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {nd.description}
            </div>
          )}
        </div>
        {/* Config status dot */}
        {!nd.isConfigured && (
          <span
            title="Configuration required"
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#f59e0b',
              flexShrink: 0,
            }}
          />
        )}
      </div>
    </div>
  );
}

// ── Node Types Map ──────────────────────────────────────

function buildNodeTypes(): NodeTypes {
  const types: NodeTypes = {};
  const allDefs = NODE_CATEGORIES.flatMap((c) => c.nodes);
  for (const def of allDefs) {
    types[def.type] = WorkflowNodeComponent as any;
  }
  types['default'] = WorkflowNodeComponent as any;
  return types;
}

// ── Helpers ─────────────────────────────────────────────

let _idCounter = 0;
function generateNodeId(): string {
  _idCounter++;
  return `node_${Date.now()}_${_idCounter}`;
}

function createNodeFromDefinition(
  definition: NodeDefinition,
  position: { x: number; y: number },
): Node {
  return {
    id: generateNodeId(),
    type: definition.type,
    position,
    data: {
      label: definition.label,
      description: definition.description,
      nodeCategory: definition.category,
      nodeSubType: definition.type,
      icon: definition.icon,
      color: definition.color,
      config: { ...definition.defaultConfig },
      isConfigured: (definition.configFields ?? []).filter((f) => f.required).length === 0,
    } satisfies BaseNodeData,
  };
}

// ── History (simple undo) ───────────────────────────────

interface HistoryEntry {
  nodes: Node[];
  edges: Edge[];
}

function useSimpleHistory(maxSize = 30) {
  const stack = useRef<HistoryEntry[]>([]);

  const push = useCallback(
    (nodes: Node[], edges: Edge[]) => {
      stack.current.push({
        nodes: JSON.parse(JSON.stringify(nodes)),
        edges: JSON.parse(JSON.stringify(edges)),
      });
      if (stack.current.length > maxSize) {
        stack.current.shift();
      }
    },
    [maxSize],
  );

  const pop = useCallback((): HistoryEntry | undefined => {
    return stack.current.pop();
  }, []);

  const clear = useCallback(() => {
    stack.current = [];
  }, []);

  return { push, pop, clear };
}

// ── Default edge options ────────────────────────────────

const DEFAULT_EDGE_OPTIONS = {
  type: 'smoothstep' as const,
  animated: true,
  markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
  style: { stroke: '#94a3b8', strokeWidth: 2 },
};

// ── Inner Canvas (must be inside ReactFlowProvider) ─────

interface InnerCanvasProps {
  workflowId?: string;
}

function InnerCanvas({ workflowId }: InnerCanvasProps) {
  const router = useRouter();
  const nodeTypes = useMemo(() => buildNodeTypes(), []);
  const rfInstance = useRef<ReactFlowInstance<Node, Edge> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const store = useWorkflowCanvasStore();
  const history = useSimpleHistory();

  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);

  // ── Add-on panel states ───────────────────────────
  const [isTemplatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [isAiPanelOpen, setAiPanelOpen] = useState(false);
  const [isMockTestOpen, setMockTestOpen] = useState(false);
  const [mockResult, setMockResult] = useState<WorkflowExecutionResult | null>(null);
  const [isMockResultsOpen, setMockResultsOpen] = useState(false);

  // ── Load existing workflow ──────────────────────────
  useEffect(() => {
    if (!workflowId) {
      store.setWorkflow('', 'Untitled Workflow', '', false);
      return;
    }

    workflowsService
      .getById(workflowId)
      .then((res) => {
        const wf = res?.data;
        if (!wf) return;
        store.setWorkflow(wf.id, wf.name, wf.description ?? '', wf.isPublished ?? false);

        // Load visual data if available
        return workflowsService.getVisual(workflowId).then((visualRes) => {
          const visual = visualRes?.data as any;
          if (visual) {
            if (visual.nodes?.length) {
              // Ensure every node has a valid position (ReactFlow crashes without it)
              const safeNodes = visual.nodes.map((n: any, i: number) => ({
                ...n,
                position: n.position ?? {
                  x: 100 + (i % 4) * 250,
                  y: 80 + Math.floor(i / 4) * 120,
                },
              }));
              setNodes(safeNodes);
            }
            if (visual.edges?.length) setEdges(visual.edges);
            if (visual.viewport && rfInstance.current) {
              rfInstance.current.setViewport(visual.viewport);
            }
          }
        });
      })
      .catch(() => {
        toast.error('Failed to load workflow');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflowId]);

  // ── Mark dirty on change ────────────────────────────
  const nodesLen = nodes.length;
  const edgesLen = edges.length;
  useEffect(() => {
    if (nodesLen > 0 || edgesLen > 0) {
      store.setDirty(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodesLen, edgesLen]);

  // ── Connection handler ──────────────────────────────
  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      history.push(nodes, edges);
      setEdges((eds) => addEdge(connection, eds));
    },
    [nodes, edges, history, setEdges],
  );

  // ── Drag & Drop from palette ──────────────────────
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const nodeType = e.dataTransfer.getData('application/reactflow');
      if (!nodeType) return;

      const definition = getNodeDefinition(nodeType);
      if (!definition) return;

      if (!rfInstance.current) return;

      const position = rfInstance.current.screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      });

      history.push(nodes, edges);
      const newNode = createNodeFromDefinition(definition, position);
      setNodes((nds) => nds.concat(newNode));
      store.setDirty(true);
    },
    [nodes, edges, history, setNodes, store],
  );

  // ── Node selection ────────────────────────────────
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      store.selectNode(node.id);
    },
    [store],
  );

  const onPaneClick = useCallback(() => {
    store.selectNode(null);
  }, [store]);

  // ── Node update / delete ──────────────────────────
  const handleNodeUpdate = useCallback(
    (nodeId: string, data: Partial<BaseNodeData>) => {
      history.push(nodes, edges);
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n,
        ),
      );
      store.setDirty(true);
    },
    [nodes, edges, history, setNodes, store],
  );

  const handleNodeDelete = useCallback(
    (nodeId: string) => {
      history.push(nodes, edges);
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
      store.selectNode(null);
      store.setDirty(true);
    },
    [nodes, edges, history, setNodes, setEdges, store],
  );

  // ── Keyboard shortcuts ────────────────────────────
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Delete selected node
      if ((e.key === 'Delete' || e.key === 'Backspace') && store.selectedNodeId) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        handleNodeDelete(store.selectedNodeId);
      }

      // Ctrl+Z undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        const prev = history.pop();
        if (prev) {
          setNodes(prev.nodes);
          setEdges(prev.edges);
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [store.selectedNodeId, handleNodeDelete, history, setNodes, setEdges]);

  // ── Save ──────────────────────────────────────────
  const handleSave = useCallback(async () => {
    try {
      const viewport = rfInstance.current?.getViewport() ?? { x: 0, y: 0, zoom: 1 };
      const payload = {
        name: store.workflowName,
        description: store.workflowDescription,
        visualData: { nodes, edges, viewport },
      };

      if (store.workflowId) {
        await workflowsService.update(store.workflowId, payload as any);
      } else {
        const res = await workflowsService.create(payload as any);
        const newId = (res as any)?.data?.id;
        if (newId) {
          store.setWorkflow(newId, store.workflowName, store.workflowDescription, false);
          router.replace(`/workflows/${newId}/edit`);
        }
      }
      store.setDirty(false);
      toast.success('Workflow saved');
    } catch {
      toast.error('Failed to save workflow');
    }
  }, [nodes, edges, store, router]);

  // ── Test Run ──────────────────────────────────────
  const handleTestRun = useCallback(() => {
    const now = Date.now();
    store.setExecutionResult({
      id: `exec_${now}`,
      workflowId: store.workflowId ?? '',
      status: 'completed',
      startedAt: new Date(now).toISOString(),
      completedAt: new Date(now + 1500).toISOString(),
      duration: 1500,
      logs: nodes.map((n, i) => ({
        nodeId: n.id,
        nodeLabel: (n.data as any).label ?? n.id,
        status: 'success' as const,
        startTime: now + i * 200,
        endTime: now + (i + 1) * 200,
        output: 'OK',
      })),
    });
  }, [nodes, store]);

  // ── Auto Layout ───────────────────────────────────
  const handleAutoLayout = useCallback(() => {
    const SPACING_X = 250;
    const SPACING_Y = 100;
    const START_X = 100;
    const START_Y = 80;

    setNodes((nds) =>
      nds.map((n, i) => ({
        ...n,
        position: {
          x: START_X + (i % 3) * SPACING_X,
          y: START_Y + Math.floor(i / 3) * SPACING_Y,
        },
      })),
    );
    store.setDirty(true);

    setTimeout(() => {
      rfInstance.current?.fitView({ padding: 0.2, duration: 300 });
    }, 50);
  }, [setNodes, store]);

  // ── Name change ───────────────────────────────────
  const handleNameChange = useCallback(
    (name: string) => {
      store.setWorkflow(
        store.workflowId ?? '',
        name,
        store.workflowDescription,
        store.isActive,
      );
      store.setDirty(true);
    },
    [store],
  );

  // ── Back ──────────────────────────────────────────
  const handleBack = useCallback(() => {
    router.push('/workflows');
  }, [router]);

  // ── Selected node for config panel ────────────────
  const selectedNode = useMemo(
    () => (store.selectedNodeId ? nodes.find((n) => n.id === store.selectedNodeId) : null),
    [store.selectedNodeId, nodes],
  );

  // ── Template selection handler ──────────────────
  const handleTemplateSelect = useCallback(
    (template: WorkflowTemplate) => {
      history.push(nodes, edges);
      setNodes(template.nodes as Node[]);
      setEdges(template.edges as Edge[]);
      store.setWorkflow(
        store.workflowId ?? '',
        template.name,
        template.description,
        false,
      );
      store.setDirty(true);
      setTemplatePickerOpen(false);
      toast.success(`Template "${template.name}" applied`);
      setTimeout(() => {
        rfInstance.current?.fitView({ padding: 0.2, duration: 300 });
      }, 100);
    },
    [nodes, edges, history, setNodes, setEdges, store],
  );

  // ── AI workflow apply handler ───────────────────
  const handleAiApply = useCallback(
    (aiNodes: any[], aiEdges: any[]) => {
      history.push(nodes, edges);
      setNodes(aiNodes as Node[]);
      setEdges(aiEdges as Edge[]);
      store.setDirty(true);
      setAiPanelOpen(false);
      toast.success('AI workflow applied to canvas');
      setTimeout(() => {
        rfInstance.current?.fitView({ padding: 0.2, duration: 300 });
      }, 100);
    },
    [nodes, edges, history, setNodes, setEdges, store],
  );

  // ── Mock test completion handler ────────────────
  const handleMockExecutionComplete = useCallback(
    (result: WorkflowExecutionResult) => {
      setMockResult(result);
      setMockResultsOpen(true);
      setMockTestOpen(false);

      // Update node execution statuses on canvas
      setNodes((nds) =>
        nds.map((n) => {
          const log = result.logs.find((l) => l.nodeId === n.id);
          if (log) {
            return {
              ...n,
              data: {
                ...n.data,
                executionStatus: log.status,
                executionTime: log.endTime - log.startTime,
                executionError: log.error,
              },
            };
          }
          return n;
        }),
      );
    },
    [setNodes],
  );

  // ── Clear execution status from nodes ───────────
  const handleClearMockResults = useCallback(() => {
    setMockResult(null);
    setMockResultsOpen(false);
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          executionStatus: undefined,
          executionTime: undefined,
          executionError: undefined,
        },
      })),
    );
  }, [setNodes]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <WorkflowHeader
        workflowId={workflowId}
        name={store.workflowName}
        isActive={store.isActive}
        isDirty={store.isDirty}
        onNameChange={handleNameChange}
        onSave={handleSave}
        onTestRun={() => setMockTestOpen(true)}
        onAutoLayout={handleAutoLayout}
        onBack={handleBack}
        onOpenTemplates={() => setTemplatePickerOpen(true)}
        onOpenAi={() => setAiPanelOpen(true)}
      />

      {/* Main Area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left: Node Palette */}
        {store.isPaletteOpen && <NodePalette />}

        {/* Center: ReactFlow Canvas */}
        <div
          ref={wrapperRef}
          style={{ flex: 1, position: 'relative' }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={(instance: any) => {
              rfInstance.current = instance;
            }}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid
            snapGrid={[16, 16]}
            defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#d1d5db" />
            <Controls
              position="bottom-left"
              style={{ marginBottom: 8, marginLeft: 8 }}
            />
            <MiniMap
              position="bottom-right"
              nodeStrokeWidth={2}
              nodeColor={(n) => (n.data as any)?.color ?? '#e5e7eb'}
              maskColor="rgba(255,255,255,0.7)"
              style={{
                width: 160,
                height: 100,
                marginBottom: 8,
                marginRight: 8,
                borderRadius: 8,
                border: '1px solid #e5e7eb',
              }}
            />
          </ReactFlow>
        </div>

        {/* Right: Config Panel */}
        {store.isConfigPanelOpen && selectedNode && (
          <NodeConfigPanel
            node={selectedNode as any}
            onUpdate={handleNodeUpdate}
            onDelete={handleNodeDelete}
            onClose={() => store.selectNode(null)}
          />
        )}
      </div>

      {/* Bottom: Execution Panel (original) */}
      <ExecutionPanel
        result={store.executionResult}
        isOpen={store.isExecutionPanelOpen}
        onToggle={store.toggleExecutionPanel}
      />

      {/* Bottom: Mock Results Panel */}
      <MockResultsPanel
        result={mockResult}
        isOpen={isMockResultsOpen}
        onToggle={() => setMockResultsOpen((v) => !v)}
        onRerun={() => {
          handleClearMockResults();
          setMockTestOpen(true);
        }}
      />

      {/* Template Picker Modal */}
      <TemplatePicker
        open={isTemplatePickerOpen}
        onClose={() => setTemplatePickerOpen(false)}
        onSelect={handleTemplateSelect}
      />

      {/* AI Workflow Panel (slide-in) */}
      <AiWorkflowPanel
        isOpen={isAiPanelOpen}
        onClose={() => setAiPanelOpen(false)}
        onApply={handleAiApply}
      />

      {/* AI Floating Button */}
      {!isAiPanelOpen && (
        <AiWorkflowButton onClick={() => setAiPanelOpen(true)} />
      )}

      {/* Mock Test Modal */}
      <MockTestModal
        isOpen={isMockTestOpen}
        onClose={() => setMockTestOpen(false)}
        nodes={nodes}
        edges={edges}
        onExecutionComplete={handleMockExecutionComplete}
      />
    </div>
  );
}

// ── Exported Wrapper (with ReactFlowProvider) ───────────

export interface WorkflowCanvasProps {
  workflowId?: string;
}

export function WorkflowCanvas({ workflowId }: WorkflowCanvasProps) {
  return (
    <ReactFlowProvider>
      <InnerCanvas workflowId={workflowId} />
    </ReactFlowProvider>
  );
}
