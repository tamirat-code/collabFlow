import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, Trash2, GripVertical } from 'lucide-react';
import { useDeleteTask } from '../../hooks/useTasks';
import { useWorkspaceRole } from '../../hooks/useWorkspaceRole';

const priorityColors = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

export default function TaskCard({ task, workspaceId, projectId }) {
  const { mutate: deleteTask } = useDeleteTask(workspaceId, projectId);
  const { canEdit } = useWorkspaceRole();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition group"
    >
      <div className="flex items-start justify-between gap-2">
        <div {...attributes} {...listeners} className="cursor-grab text-gray-300 hover:text-gray-500 mt-0.5">
          <GripVertical size={14} />
        </div>
        <p className="flex-1 text-sm font-medium text-gray-800">{task.title}</p>
       <div className="flex items-start justify-between gap-2">
        {canEdit && (
          <div {...attributes} {...listeners} className="cursor-grab text-gray-300 hover:text-gray-500 mt-0.5">
            <GripVertical size={14} />
          </div>
        )}
        <p className="flex-1 text-sm font-medium text-gray-800">{task.title}</p>
        {canEdit && (
          <button onClick={() => deleteTask(task._id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition">
            <Trash2 size={14} />
          </button>
        )}
      </div>
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 mt-1 ml-5 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center gap-2 mt-2 ml-5">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
        {task.dueDate && (
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Calendar size={12} />
            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
        {task.assignee && (
          <span className="ml-auto w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center font-semibold">
            {task.assignee.name?.[0]}
          </span>
        )}
      </div>
    </div>
  );
}