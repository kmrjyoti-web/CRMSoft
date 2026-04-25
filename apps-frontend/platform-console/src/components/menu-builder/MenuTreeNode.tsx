'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ChevronRight, ChevronDown, Edit2, Trash2, Plus } from 'lucide-react';
import { IconByName } from './IconPicker';

const BADGE_STYLES: Record<string, string> = {
  new: 'bg-[#58a6ff]/20 text-[#58a6ff]',
  beta: 'bg-[#d29922]/20 text-[#d29922]',
  pro: 'bg-purple-900/30 text-purple-400',
  count: 'bg-console-card text-console-text',
};

interface MenuTreeNodeProps {
  menu: any;
  depth: number;
  isExpanded: boolean;
  hasChildren: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddChild: () => void;
}

export function MenuTreeNode({
  menu, depth, isExpanded, hasChildren,
  onToggleExpand, onEdit, onDelete, onAddChild,
}: MenuTreeNodeProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: menu.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-console-sidebar border rounded-md transition-colors ${
        isDragging ? 'border-[#58a6ff]/50 shadow-lg' : 'border-console-border hover:border-[#58a6ff]/30'
      }`}
    >
      <div
        className="flex items-center gap-2 py-2 pr-3"
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
      >
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="text-console-muted hover:text-console-text cursor-grab active:cursor-grabbing flex-shrink-0 touch-none"
          tabIndex={-1}
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>

        {/* Expand toggle */}
        {hasChildren ? (
          <button
            onClick={onToggleExpand}
            className="text-console-muted hover:text-console-text flex-shrink-0"
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        ) : (
          <span className="w-3.5 flex-shrink-0" />
        )}

        {/* Icon */}
        <span className="text-[#58a6ff] flex-shrink-0 w-4">
          <IconByName name={menu.icon_name} className="w-4 h-4" />
        </span>

        {/* Label + code */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-sm font-medium text-console-text truncate">{menu.menu_label}</span>
          <span className="text-xs font-mono text-console-muted hidden sm:inline truncate">{menu.menu_code}</span>

          {menu.badge_type && (
            <span className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${BADGE_STYLES[menu.badge_type] ?? 'bg-console-card text-console-muted'}`}>
              {menu.badge_value || menu.badge_type}
            </span>
          )}
        </div>

        {/* Route */}
        {menu.route && (
          <span className="text-xs font-mono text-[#58a6ff]/70 hidden lg:inline truncate max-w-[160px] flex-shrink-0">
            {menu.route}
          </span>
        )}

        {/* Visibility state */}
        {!menu.is_visible && (
          <span className="text-xs bg-console-danger/10 text-red-400 px-1.5 py-0.5 rounded flex-shrink-0">hidden</span>
        )}
        {!menu.is_enabled && (
          <span className="text-xs bg-console-card text-console-muted px-1.5 py-0.5 rounded flex-shrink-0">off</span>
        )}

        {/* Hover actions */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={onAddChild}
            title="Add child menu"
            className="p-1 text-console-muted hover:text-[#3fb950] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onEdit}
            title="Edit"
            className="p-1 text-console-muted hover:text-[#58a6ff] transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            title="Delete"
            className="p-1 text-console-muted hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
