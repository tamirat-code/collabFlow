import { useState } from 'react';
import {
  DndContext, DragOverlay, closestCorners,
  PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard';
import { useTasks, useMoveTask } from '../../hooks/useTasks';
import { useRealtimeTasks } from '../../hooks/useRealtimeTasks';

const STATUSES = ['todo', 'in-progress', 'done'];

export default function KanbanBoard({ workspaceId, projectId }) {
  const { data: tasks = [], isLoading } = useTasks(workspaceId, projectId);
  const { mutate: moveTask } = useMoveTask(workspaceId, projectId);
  const [activeTask, setActiveTask] = useState(null);

       useRealtimeTasks(projectId); 
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const tasksByStatus = (status) =>
    tasks.filter((t) => t.status === status).sort((a, b) => a.order - b.order);

  const handleDragStart = (event) => {
    const task = tasks.find((t) => t._id === event.active.id);
    setActiveTask(task);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeTask = tasks.find((t) => t._id === active.id);
    if (!activeTask) return;

    // Determine target status: either a column id, or the status of a task being hovered
    let targetStatus = over.id;
    let targetOrder;

    if (STATUSES.includes(over.id)) {
      // Dropped on empty column area
      const columnTasks = tasksByStatus(over.id);
      targetOrder = columnTasks.length;
    } else {
      // Dropped on another task
      const overTask = tasks.find((t) => t._id === over.id);
      if (!overTask) return;
      targetStatus = overTask.status;
      targetOrder = overTask.order;
    }

    if (activeTask.status === targetStatus && activeTask.order === targetOrder) return;

    moveTask({ taskId: activeTask._id, status: targetStatus, order: targetOrder });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading tasks...</div>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasksByStatus(status)}
            workspaceId={workspaceId}
            projectId={projectId}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="rotate-2">
            <TaskCard task={activeTask} workspaceId={workspaceId} projectId={projectId} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}