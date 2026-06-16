import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { useCreateTask } from '../../hooks/useTasks';
import { taskSchema } from '../../lib/validationSchemas';
import M from '../../styles/ModalStyles';


export default function CreateTaskModal({ workspaceId, projectId, defaultStatus = 'todo', onClose }) {
  const { mutate, isPending, error } = useCreateTask(workspaceId, projectId);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: { priority: 'medium' },
  });

  const onSubmit = (data) => {
    mutate({ ...data, status: defaultStatus }, { onSuccess: onClose });
  };

  return (
    <div style={M.overlay}>
      <div style={M.card}>
        <div style={M.header}>
          <span style={M.title}>New Task</span>
          <button style={M.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>

        {error && <div style={M.errBox}>{error.message}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={M.label}>Title</label>
            <input
              {...register('title')}
              autoFocus
              placeholder="e.g. Design login page"
              style={{ ...M.input, ...(errors.title ? { borderColor: '#f87171' } : {}) }}
            />
            {errors.title && <p style={M.error}>{errors.title.message}</p>}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={M.label}>Description</label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Add details..."
              style={{ ...M.input, resize: 'none' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '0.5rem' }}>
            <div>
              <label style={M.label}>Priority</label>
              <select {...register('priority')} style={M.input}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label style={M.label}>Due date</label>
              <input
                type="date"
                {...register('dueDate')}
                style={M.input}
              />
            </div>
          </div>

          <button type="submit" disabled={isPending} style={{ ...M.btn, opacity: isPending ? 0.6 : 1 }}>
            {isPending ? 'Creating...' : 'Create Task'}
          </button>
        </form>
      </div>
    </div>
  );
}