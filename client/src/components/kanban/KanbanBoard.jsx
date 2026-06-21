import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
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
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  
  const getTaskById = (id) => tasks.find((t) => t._id === id);

  const getTasksByStatus = (status) =>
    tasks
      .filter((t) => t.status === status)
      .sort((a, b) => a.order - b.order);

0
  const handleDragStart = ({ active }) => {
    const task = getTaskById(active.id);
    setActiveTask(task || null);
  };

 
  const handleDragEnd = ({ active, over }) => {
    setActiveTask(null);
    if (!over) return;

    const draggedTask = getTaskById(active.id);
    if (!draggedTask) return;

    const overId = over.id;

    let newStatus = draggedTask.status;
    let newOrder = draggedTask.order;

    
    if (STATUSES.includes(overId)) {
      newStatus = overId;

      const columnTasks = getTasksByStatus(overId);
      newOrder = columnTasks.length;
    }

    
    else {
      const targetTask = getTaskById(overId);
      if (!targetTask) return;

      newStatus = targetTask.status;
      newOrder = targetTask.order;
    }

  
    if (
      draggedTask.status === newStatus &&
      draggedTask.order === newOrder
    ) {
      return;
    }

    moveTask({
      taskId: draggedTask._id,
      status: newStatus,
      order: newOrder,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Loading tasks...
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
     
      <div
        className="flex flex-col gap-4 md:flex-row md:items-start md:overflow-x-auto md:pb-4"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {STATUSES.map((status) => (
          <div
            key={status}
            className="w-full md:w-[280px] md:flex-shrink-0"
          >
            <KanbanColumn
              status={status}
              tasks={getTasksByStatus(status)}
              workspaceId={workspaceId}
              projectId={projectId}
            />
          </div>
        ))}
      </div>

      
      <DragOverlay>
        {activeTask && (
          <div className="rotate-2">
            <TaskCard
              task={activeTask}
              workspaceId={workspaceId}
              projectId={projectId}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}