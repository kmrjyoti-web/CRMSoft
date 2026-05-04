'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import { Button, Input, Icon } from '@/components/ui';
import { TagsInput } from '@/components/ui';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import {
  useWaChatbotFlowDetail,
  useCreateChatbotFlow,
  useUpdateChatbotFlow,
  useToggleChatbotFlow,
} from '../hooks/useWaChatbot';
import type { ChatbotNode, ChatbotNodeConnection } from '../types/chatbot.types';
import type { WaChatbotNodeType } from '../types/whatsapp.types';
import { ChatbotNodePalette } from './ChatbotNodePalette';
import { ChatbotCanvas } from './ChatbotCanvas';
import { ChatbotNodeEditor } from './ChatbotNodeEditor';

interface ChatbotFlowEditorProps {
  flowId?: string;
}

let nodeCounter = 0;

export function ChatbotFlowEditor({ flowId }: ChatbotFlowEditorProps) {
  const router = useRouter();
  const isEdit = !!flowId;

  const [name, setName] = useState('');
  const [triggerKeywords, setTriggerKeywords] = useState<string[]>([]);
  const [nodes, setNodes] = useState<ChatbotNode[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const { data: detail, isLoading } = useWaChatbotFlowDetail(flowId ?? '');
  const createMut = useCreateChatbotFlow();
  const updateMut = useUpdateChatbotFlow();
  const toggleMut = useToggleChatbotFlow();

  // Populate form in edit mode
  useEffect(() => {
    if (isEdit && detail?.data) {
      const d = detail.data;
      setName(d.name ?? '');
      setTriggerKeywords(d.triggerKeywords ?? []);
      if (d.nodes && Array.isArray(d.nodes)) {
        setNodes(d.nodes);
        nodeCounter = d.nodes.length;
      }
    }
  }, [isEdit, detail]);

  const handleAddNode = useCallback((type: WaChatbotNodeType) => {
    nodeCounter++;
    const newNode: ChatbotNode = {
      id: `node-${Date.now()}-${nodeCounter}`,
      type,
      position: { x: 250 + Math.random() * 200, y: 80 + nodeCounter * 100 },
      data: {},
      connections: [],
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
  }, []);

  const handleMoveNode = useCallback((id: string, x: number, y: number) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, position: { x, y } } : n)),
    );
  }, []);

  const handleUpdateNodeData = useCallback((id: string, data: Record<string, any>) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, data } : n)),
    );
  }, []);

  const handleDeleteNode = useCallback((id: string) => {
    setNodes((prev) =>
      prev
        .filter((n) => n.id !== id)
        .map((n) => ({
          ...n,
          connections: n.connections.filter((c) => c.targetNodeId !== id),
        })),
    );
    setSelectedNodeId(null);
  }, []);

  const handleAddConnection = useCallback((fromId: string, toId: string) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id !== fromId) return n;
        if (n.connections.some((c) => c.targetNodeId === toId)) return n;
        const conn: ChatbotNodeConnection = { targetNodeId: toId };
        return { ...n, connections: [...n.connections, conn] };
      }),
    );
  }, []);

  const handleSave = () => {
    const payload = { name, triggerKeywords, nodes };
    if (isEdit && flowId) {
      updateMut.mutate(
        { id: flowId, data: payload },
        { onSuccess: () => router.push('/whatsapp/chatbot') },
      );
    } else {
      createMut.mutate(payload as any, {
        onSuccess: () => router.push('/whatsapp/chatbot'),
      });
    }
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const flowStatus = detail?.data?.status;

  if (isEdit && isLoading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Chatbot Flow' : 'New Chatbot Flow'}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            {isEdit && flowId && flowStatus && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  toggleMut.mutate({
                    id: flowId,
                    status: flowStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
                  })
                }
                disabled={toggleMut.isPending}
              >
                {flowStatus === 'ACTIVE' ? 'Deactivate' : 'Activate'}
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={!name || createMut.isPending || updateMut.isPending}
            >
              {createMut.isPending || updateMut.isPending ? 'Saving...' : 'Save Flow'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push('/whatsapp/chatbot')}>
              Cancel
            </Button>
          </div>
        }
      />

      {/* Top bar: Name + Keywords */}
      <div
        className="rounded-lg border border-gray-200 bg-white p-4 mb-4"
        style={{ display: 'flex', gap: 16 }}
      >
        <div style={{ flex: 1 }}>
          <Input
            label="Flow Name"
            value={name}
            onChange={setName}
            leftIcon={<Icon name="bot" size={16} />}
          />
        </div>
        <div style={{ flex: 1 }}>
          <TagsInput
            label="Trigger Keywords"
            value={triggerKeywords}
            onChange={setTriggerKeywords}
          />
        </div>
      </div>

      {/* 3-panel editor */}
      <div
        style={{
          display: 'flex',
          height: 'calc(100vh - 320px)',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <ChatbotNodePalette onAddNode={handleAddNode} />
        <ChatbotCanvas
          nodes={nodes}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
          onMoveNode={handleMoveNode}
        />
        {selectedNode && (
          <ChatbotNodeEditor
            node={selectedNode}
            allNodes={nodes}
            onUpdate={handleUpdateNodeData}
            onDelete={handleDeleteNode}
            onAddConnection={handleAddConnection}
            onClose={() => setSelectedNodeId(null)}
          />
        )}
      </div>
    </div>
  );
}
