import { useState } from 'react';
import ReasonPromptModal from '../modals/ReasonPromptModal';

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
import FilterBar from '../FilterBar';

const STATUSES = ['todo', 'in-progress', 'done'];
const EMPTY_FILTERS = { search: '', priority: '', assignee: '', status: '', overdue: false };

export default function KanbanBoard({ workspaceId, projectId }) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const { data: tasks = [], isLoading } = useTasks(workspaceId, projectId, filters);
  const { mutate: moveTask } = useMoveTask(workspaceId, projectId);
  const [pendingMove, setPendingMove] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const statusRank = { todo: 0, 'in-progress': 1, done: 2 };

  useRealtimeTasks(projectId);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const getTaskById = (id) => tasks.find((t) => t._id === id);

  const getTasksByStatus = (status) =>
    tasks.filter((t) => t.status === status).sort((a, b) => a.order - b.order);

  const handleDragStart = ({ active }) => {
    const task = getTaskById(active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeTaskObj = tasks.find((t) => t._id === active.id);
    if (!activeTaskObj) return;

    let targetStatus = over.id;
    let targetOrder;

    if (STATUSES.includes(over.id)) {
      const columnTasks = getTasksByStatus(over.id);
      targetOrder = columnTasks.length;
    } else {
      const overTask = tasks.find((t) => t._id === over.id);
      if (!overTask) return;
      targetStatus = overTask.status;
      targetOrder = overTask.order;
    }

    if (activeTaskObj.status === targetStatus && activeTaskObj.order === targetOrder) return;

    if (statusRank[targetStatus] < statusRank[activeTaskObj.status]) {
      setPendingMove({ taskId: activeTaskObj._id, status: targetStatus, order: targetOrder });
      return;
    }

    moveTask({ taskId: activeTaskObj._id, status: targetStatus, order: targetOrder });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Loading tasks...
      </div>
    );
  }

  return (
    <>
      <FilterBar workspaceId={workspaceId} filters={filters} onChange={setFilters} />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div
          data-tour="kanban-board"
          className="flex flex-col gap-4 md:flex-row md:items-start md:overflow-x-auto md:pb-4"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {STATUSES.map((status) => (
            <div
              key={status}
              data-tour={status === 'todo' ? 'kanban-column-todo' : undefined}
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
              <TaskCard task={activeTask} workspaceId={workspaceId} projectId={projectId} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

     
      {pendingMove && (
        <ReasonPromptModal
          title="Moving task backward"
          subtitle="This task is going back a stage. Add a quick note so the team knows why."
          onConfirm={(reason) => {
            moveTask({ ...pendingMove, reason });
            setPendingMove(null);
          }}
          onCancel={() => setPendingMove(null)}
        />
      )}
    </>
  );
}