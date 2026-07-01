import { useWorkspaces } from './useWorkspaces';
import { useMe } from './useAuth';
import useWorkspaceStore from '../store/workspaceStore';

export const useWorkspaceRole = () => {
  const { data: workspaces, isLoading: loadingWs } = useWorkspaces();
  const { data: user, isLoading: loadingUser } = useMe();
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  const activeWorkspace = workspaces?.find((w) => w._id === activeWorkspaceId);

  const isOwner =
    !!user && !!activeWorkspace && (
      activeWorkspace.owner?._id === user._id ||
      activeWorkspace.owner?._id?.toString() === user._id?.toString() ||
      activeWorkspace.owner === user._id ||
      activeWorkspace.owner?.toString() === user._id?.toString()
    );

  const isLoading = loadingWs || loadingUser;

  const role = isLoading
    ? null
    : isOwner
      ? 'admin'
      : (activeWorkspace?.myRole || 'viewer');



  return {
    role,
    isLoading,
    isAdmin:  role === 'admin',
    isMember: role === 'member',
    isViewer: role === 'viewer',
    canEdit:  role === 'admin' || role === 'member',
  };
};