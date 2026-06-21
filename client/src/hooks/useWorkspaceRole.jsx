import { useWorkspace } from './useWorkspaces';
import { useMe } from './useAuth';
import useWorkspaceStore from '../store/workspaceStore';

export const useWorkspaceRole = () => {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  
  const { data: workspace } = useWorkspace(activeWorkspaceId);
  const { data: user } = useMe();

  const ownerId = workspace?.owner?._id?.toString() ?? workspace?.owner?.toString();
  const isOwner = !!ownerId && !!user?._id && ownerId === user._id.toString();

  const role = isOwner ? 'admin' : (workspace?.myRole ?? 'viewer');

  return {
    role,
    isAdmin:  role === 'admin',
    isMember: role === 'member',
    isViewer: role === 'viewer',
    canEdit:  role === 'admin' || role === 'member',
  };
};