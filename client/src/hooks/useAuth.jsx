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

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      fetchClient('/auth/me', { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
};

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file) => {
      const formData = new FormData();
      formData.append('avatar', file);
      return fetchClient('/auth/me/avatar', { method: 'POST', body: formData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data) =>
      fetchClient('/auth/me/password', { method: 'PUT', body: JSON.stringify(data) }),
  });
};

export const useDeleteAccount = () => {
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (password) =>
      fetchClient('/auth/me', { method: 'DELETE', body: JSON.stringify({ password }) }),
    onSuccess: () => {
      logout();
      queryClient.clear();
    },
  });
};
export const useCompleteTour = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => fetchClient('/auth/me/tour', { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  });
};