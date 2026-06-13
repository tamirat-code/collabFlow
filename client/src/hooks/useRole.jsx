import useAuthStore from '../store/authStore';

export const useRole = () => {
  const user = useAuthStore((s) => s.user);
  return {
    role: user?.role,
    isAdmin:  user?.role === 'admin',
    isMember: user?.role === 'member',
    isViewer: user?.role === 'viewer',
  };
};