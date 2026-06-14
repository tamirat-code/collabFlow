import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import TaskCard from './TaskCard';
import CreateTaskModal from '../modals/CreateTaskModal';

const columnConfig = {
  'todo': { label: 'To Do', color: 'bg-gray-400' },
  'in-progress': { label: 'In Progress', color: 'bg-blue-500' },
  'done': { label: 'Done', color: 'bg-green-500' },
};

export default function KanbanColumn({ status, tasks, workspaceId, projectId }) {
  const [showCreateTask, setShowCreateTask] = useState(false);
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const config = columnConfig[status];

  return (
    <div className="flex-1 min-w-[280px] flex flex-col">
      {/* Column Header */}
      <div className="flex items-center justify-between px-2 mb-3">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${config.color}`} />
          <h3 className="text-sm font-semibold text-gray-700">{config.label}</h3>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => setShowCreateTask(true)}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Droppable Area */}
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-xl p-2 space-y-2 min-h-[200px] transition ${
          isOver ? 'bg-blue-50 ring-2 ring-blue-200' : 'bg-gray-50'
        }`}
      >
        <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} workspaceId={workspaceId} projectId={projectId} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-24 text-xs text-gray-400">
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