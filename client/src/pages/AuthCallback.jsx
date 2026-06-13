import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { fetchClient } from '../api/fetchClient';

export default function AuthCallback() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) return navigate('/login?error=google_failed');

    // Store token then fetch user
    useAuthStore.getState().setAccessToken(token);

    fetchClient('/auth/me')
      .then((user) => {
        setAuth(user, token);
        navigate('/dashboard');
      })
      .catch(() => navigate('/login?error=google_failed'));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500 animate-pulse">Signing you in...</p>
    </div>
  );
}