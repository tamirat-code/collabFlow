import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, Trash2, GripVertical, MessageSquare } from 'lucide-react';
import { useDeleteTask } from '../../hooks/useTasks';
import { useWorkspaceRole } from '../../hooks/useWorkspaceRole';
import TaskDetailModal from '../modals/TaskDetailModal';

const priorityColors = {
  low:    { background: '#052e1a', color: '#22c55e', border: '1px solid #14532d' },
  medium: { background: '#2d1f05', color: '#f59e0b', border: '1px solid #78350f' },
  high:   { background: '#2d0a0a', color: '#f87171', border: '1px solid #7f1d1d' },
};

export default function TaskCard({ task, workspaceId, projectId }) {
  const { mutate: deleteTask } = useDeleteTask(workspaceId, projectId);
  const { canEdit } = useWorkspaceRole();
  const [showDetail, setShowDetail] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
    disabled: !canEdit,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={{
          ...style,
          background: '#0a1e2e',
          border: '1px solid #0e3347',
          borderRadius: '10px',
          padding: '10px 12px',
          cursor: 'default',
          position: 'relative',
        }}
        className="group"
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          {canEdit && (
            <div
              {...attributes}
              {...listeners}
              style={{ cursor: 'grab', color: '#1e4a5a', marginTop: '2px', flexShrink: 0 }}
              onMouseEnter={e => e.currentTarget.style.color = '#3a7080'}
              onMouseLeave={e => e.currentTarget.style.color = '#1e4a5a'}
            >
              <GripVertical size={14} />
            </div>
          )}

          {/* Clicking title opens detail modal */}
          <p
            onClick={() => setShowDetail(true)}
            style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: '#c0e8e4', lineHeight: 1.4, cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.color = '#00c8b4'}
            onMouseLeave={e => e.currentTarget.style.color = '#c0e8e4'}
          >
            {task.title}
          </p>

          {canEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); deleteTask(task._id); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1e4a5a', padding: '2px', opacity: 0, transition: 'opacity 0.15s', flexShrink: 0 }}
              className="group-hover:opacity-100"
              onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
              onMouseLeave={e => e.currentTarget.style.color = '#1e4a5a'}
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>

        {task.description && (
          <p style={{ fontSize: '12px', color: '#3a7080', marginTop: '6px', marginLeft: canEdit ? '22px' : '0', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {task.description}
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', marginLeft: canEdit ? '22px' : '0' }}>
          <span style={{ fontSize: '11px', fontWeight: 500, padding: '2px 8px', borderRadius: '10px', textTransform: 'capitalize', ...priorityColors[task.priority] }}>
            {task.priority}
          </span>

          {task.dueDate && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#3a7080' }}>
              <Calendar size={11} />
              {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}

          {/* Comment count indicator */}
          <span
            onClick={() => setShowDetail(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#2a6070', cursor: 'pointer', marginLeft: 'auto' }}
            onMouseEnter={e => e.currentTarget.style.color = '#00c8b4'}
            onMouseLeave={e => e.currentTarget.style.color = '#2a6070'}
          >
            <MessageSquare size={11} />
          </span>

          {task.assignee && (
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#0a3347', border: '1px solid #00c8b4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 600, color: '#00c8b4' }}>
              {task.assignee.name?.[0]?.toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {showDetail && (
        <TaskDetailModal
          task={task}
          workspaceId={workspaceId}
          projectId={projectId}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
}