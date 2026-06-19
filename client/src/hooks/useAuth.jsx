import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchClient } from '../api/fetchClient';
import useAuthStore from '../store/authStore';


export const useMe = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: ['me'],
    queryFn: () => fetchClient('/auth/me'),
    enabled: isAuthenticated && !!accessToken, 
    staleTime: 1000 * 60 * 5,
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (data) =>
      fetchClient('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  });
};


export const useLogin = () => {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (data) =>
      fetchClient('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email) =>
      fetchClient('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ token, password }) =>
      fetchClient(`/auth/reset-password/${token}`, { method: 'POST', body: JSON.stringify({ password }) }),
  });
};

export const useLogout = () => {
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      fetchClient('/auth/logout', { method: 'POST' }),
    onSuccess: () => {
      logout();
      queryClient.clear(); 
    },
  });
};