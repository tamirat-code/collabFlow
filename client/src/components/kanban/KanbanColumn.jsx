import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';

import TaskCard from './TaskCard';
import CreateTaskModal from '../modals/CreateTaskModal';
import { useWorkspaceRole } from '../../hooks/useWorkspaceRole';

const columnConfig = {
  todo: { label: 'To Do', dot: '#5a8a99' },
  'in-progress': { label: 'In Progress', dot: '#00c8b4' },
  done: { label: 'Done', dot: '#22c55e' },
};

export default function KanbanColumn({ status, tasks, workspaceId, projectId }) {
  const [showCreateTask, setShowCreateTask] = useState(false);

  const { setNodeRef, isOver } = useDroppable({ id: status });
  const { canEdit } = useWorkspaceRole();

  const config = columnConfig[status];

  return (
    <div className="w-full md:w-[280px] flex flex-col">

     
      <div className="flex items-center justify-between px-1 mb-3">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: config.dot }}
          />
          <span className="text-[13px] font-semibold text-[#a0cdd8]">
            {config.label}
          </span>

          <span className="text-[12px] text-[#2a6070] bg-[#0a2535] px-2 py-[1px] rounded-full">
            {tasks.length}
          </span>
        </div>

        {canEdit && (
          <button
            onClick={() => setShowCreateTask(true)}
            className="text-[#3a7080] hover:text-[#00c8b4] transition"
          >
            <Plus size={16} />
          </button>
        )}
      </div>

   
      <div
        ref={setNodeRef}
        className="flex-1 flex flex-col gap-2 p-2 rounded-xl min-h-[200px] border transition"
        style={{
          background: isOver ? '#0a2535' : '#071520',
          borderColor: isOver ? '#00c8b440' : '#0e3347',
        }}
      >
        <SortableContext
          items={tasks.map((t) => t._id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              workspaceId={workspaceId}
              projectId={projectId}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex items-center justify-center flex-1 text-xs text-[#1e4a5a]">
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