import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { useCreateProject } from '../../hooks/useProjects';
import { projectSchema } from '../../lib/validationSchemas';
import useWorkspaceStore from '../../store/workspaceStore';
import M from '../../styles/ModalStyles';
import Spinner from '../Spinner';

export default function CreateProjectModal({ workspaceId, onClose }) {
  const { mutate, isPending, error } = useCreateProject(workspaceId);
  const setActiveProject = useWorkspaceStore((s) => s.setActiveProject);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(projectSchema),
  });

  const onSubmit = (data) => {
    mutate(data, {
      onSuccess: (project) => {
        setActiveProject(project._id);
        onClose();
      },
    });
  };

  return (
    <div style={M.overlay}>
      <div style={M.card}>
        <div style={M.header}>
          <span style={M.title}>New Project</span>
          <button style={M.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>

        {error && <div style={M.errBox}>{error.message}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={M.label}>Project name</label>
            <input
              {...register('name')}
              autoFocus
              placeholder="e.g. Website Redesign"
              style={{ ...M.input, ...(errors.name ? { borderColor: '#f87171' } : {}) }}
            />
            {errors.name && <p style={M.error}>{errors.name.message}</p>}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={M.label}>Description (optional)</label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="What's this project about?"
              style={{ ...M.input, resize: 'none' }}
            />
          </div>

          <button type="submit" disabled={isPending} style={{ ...M.btn, opacity: isPending ? 0.6 : 1 }}>
            {isPending ? (<><Spinner size={14} color="#00c8b4" /> Creating...</>) : 'Create Project'}
          </button>
        </form>
      </div>
    </div>
  );
}