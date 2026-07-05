import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { useInviteMember } from '../../hooks/useWorkspaces';
import { inviteSchema } from '../../lib/validationSchemas';
import M from '../../styles/ModalStyles';
import Spinner from '../Spinner';

export default function InviteMemberModal({ workspaceId, onClose }) {
  const { mutate, isPending, error, isSuccess } = useInviteMember(workspaceId);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: 'member' },
  });

  const onSubmit = (data) => {
    mutate(data);
  };

  return (
    <div style={M.overlay}>
      <div style={M.card}>
        <div style={M.header}>
          <span style={M.title}>Invite Member</span>
          <button style={M.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>

        {error   && <div style={M.errBox}>{error.message}</div>}
        {isSuccess && <div style={M.successBox}>Member added successfully</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={M.label}>Email</label>
            <input
              {...register('email')}
              autoFocus
              placeholder="teammate@example.com"
              style={{ ...M.input, ...(errors.email ? { borderColor: '#f87171' } : {}) }}
            />
            {errors.email && <p style={M.error}>{errors.email.message}</p>}
          </div>

          <div style={{ marginBottom: '0.5rem' }}>
            <label style={M.label}>Role</label>
            
            <select {...register('role')} style={M.input}>
              <option value="member">Member</option>
              <option value="viewer">Viewer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button type="submit" disabled={isPending} style={{ ...M.btn, opacity: isPending ? 0.6 : 1 }}>
            {isPending ? (<><Spinner size={14} color="#00c8b4" /> Inviting...</>) : 'Send Invite'}
          </button>
        </form>
      </div>
    </div>
  );
}