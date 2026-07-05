import useAuthStore from '../store/authStore';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AUTH_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/google',
  '/auth/resend-verification',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
];

const tryRefresh = async () => {
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, { method: 'POST', credentials: 'include' });
    if (res.ok) {
      const { accessToken } = await res.json();
      useAuthStore.getState().setAccessToken(accessToken);
      return accessToken;
    }
    return null;
  } catch {
    return null;
  }
};

export const fetchClient = async (endpoint, options = {}) => {
  let accessToken = useAuthStore.getState().accessToken;
  const isAuthEndpoint = AUTH_ENDPOINTS.some((e) => endpoint.startsWith(e));
  const isFormData = options.body instanceof FormData;

  if (!accessToken && !options._retry && !isAuthEndpoint) {
    accessToken = await tryRefresh();
    if (!accessToken) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
      return;
    }
  }

  const headers = {
    
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (res.status === 401 && !options._retry && !isAuthEndpoint) {
    const newToken = await tryRefresh();
    if (newToken) {
      
      return fetchClient(endpoint, {
        ...options,
        _retry: true,
        headers: { ...options.headers, Authorization: `Bearer ${newToken}` },
      });
    }
    useAuthStore.getState().logout();
    window.location.href = '/login';
    return;
  }

if (!res.ok) {
  const error = await res.json().catch(() => ({ message: 'Something went wrong' }));
  const err = new Error(error.message || 'Something went wrong');
  err.data = error;
  err.status = res.status;
  throw err;
}

  return res.json();
};