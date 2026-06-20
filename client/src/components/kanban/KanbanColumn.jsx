import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import TaskCard from './TaskCard';
import CreateTaskModal from '../modals/CreateTaskModal';
import { useWorkspaceRole } from '../../hooks/useWorkspaceRole';

const columnConfig = {
  'todo':        { label: 'To Do',       dot: '#5a8a99' },
  'in-progress': { label: 'In Progress', dot: '#00c8b4' },
  'done':        { label: 'Done',        dot: '#22c55e' },
};

export default function KanbanColumn({ status, tasks, workspaceId, projectId }) {
  const [showCreateTask, setShowCreateTask] = useState(false);
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const { canEdit } = useWorkspaceRole();
  const config = columnConfig[status];

  return (
<<<<<<< HEAD
    <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column' }}>
=======
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
>>>>>>> 70fbf517 (feat: added profile settings features)
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: config.dot, display: 'inline-block' }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#a0cdd8' }}>{config.label}</span>
          <span style={{ fontSize: '12px', color: '#2a6070', background: '#0a2535', padding: '1px 8px', borderRadius: '10px' }}>
            {tasks.length}
          </span>
        </div>
        {canEdit && (
          <button
            onClick={() => setShowCreateTask(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3a7080', display: 'flex' }}
            onMouseEnter={e => e.currentTarget.style.color = '#00c8b4'}
            onMouseLeave={e => e.currentTarget.style.color = '#3a7080'}
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      {/* droppable area */}
      <div
        ref={setNodeRef}
        style={{
          flex: 1, borderRadius: '12px',
          padding: '8px', minHeight: '200px',
          background: isOver ? '#0a2535' : '#071520',
          border: isOver ? '1px solid #00c8b440' : '1px solid #0e3347',
          transition: 'background 0.15s, border 0.15s',
          display: 'flex', flexDirection: 'column', gap: '8px',
        }}
      >
        <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} workspaceId={workspaceId} projectId={projectId} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, fontSize: '12px', color: '#1e4a5a' }}>
            Drop tasks here
          </div>
        )}
      </div>

      {showCreateTask && (
        <CreateTaskModal
          workspaceId={workspaceId}
          projectId={projectId}
          defaultStatus={status}
          onClose={() => setShowCreateTask(false)}
        />
      )}
    </div>
  );
}