import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { useCreateWorkspace } from '../../hooks/useWorkspaces';
import { workspaceSchema } from '../../lib/validationSchemas';
import useWorkspaceStore from '../../store/workspaceStore';
import M from '../../styles/ModalStyles';

export default function CreateWorkspaceModal({ onClose }) {
  const { mutate, isPending, error } = useCreateWorkspace();
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(workspaceSchema),
  });

  const onSubmit = (data) => {
    mutate(data, {
      onSuccess: (ws) => {
        setActiveWorkspace(ws._id);
        onClose();
      },
    });
  };

  return (
    <div style={M.overlay}>
      <div style={M.card}>
        <div style={M.header}>
          <span style={M.title}>New Workspace</span>
          <button style={M.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>

        {error && <div style={M.errBox}>{error.message}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={M.label}>Workspace name</label>
            <input
              {...register('name')}
              autoFocus
              placeholder="e.g. Acme Inc"
              style={{ ...M.input, ...(errors.name ? { borderColor: '#f87171' } : {}) }}
            />
            {errors.name && <p style={M.error}>{errors.name.message}</p>}
          </div>

          <button type="submit" disabled={isPending} style={{ ...M.btn, opacity: isPending ? 0.6 : 1 }}>
            {isPending ? 'Creating...' : 'Create Workspace'}
          </button>
        </form>
      </div>
    </div>
  );
}