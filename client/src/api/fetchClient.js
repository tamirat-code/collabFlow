import useAuthStore from '../store/authStore';

const BASE_URL = 'http://localhost:5000/api';


export const fetchClient = async (endpoint, options = {}) => {
  const accessToken = useAuthStore.getState().accessToken;

  const headers = {
    'Content-Type': 'application/json',
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // send cookies for refresh token
  });


  if (res.status === 401 && !options._retry) {
    const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (refreshRes.ok) {
      const { accessToken: newToken } = await refreshRes.json();
      useAuthStore.getState().setAccessToken(newToken);


      return fetchClient(endpoint, { ...options, _retry: true, headers: {
        ...options.headers,
        Authorization: `Bearer ${newToken}`,
      }});
    } else {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
  }

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Something went wrong');
  }

  return res.json();
};