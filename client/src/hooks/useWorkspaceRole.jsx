import { useWorkspaces } from './useWorkspaces';
import useWorkspaceStore from '../store/workspaceStore';

export const useWorkspaceRole = () => {
  const { data: workspaces } = useWorkspaces();
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  const activeWorkspace = workspaces?.find((w) => w._id === activeWorkspaceId);
  const role = activeWorkspace?.myRole || 'viewer';

  return {
    role,
    isAdmin: role === 'admin',
    isMember: role === 'member',
    isViewer: role === 'viewer',
    canEdit: role === 'admin' || role === 'member',
  };
};