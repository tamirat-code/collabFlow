import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const BASE_URL = 'http://localhost:5000/api';

export default function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const [checking, setChecking] = useState(!isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) return;

   
    fetch(`${BASE_URL}/auth/refresh`, { method: 'POST', credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.accessToken) {
          return fetch(`${BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${data.accessToken}` },
            credentials: 'include',
          })
            .then((r) => (r.ok ? r.json() : null))
            .then((user) => {
              if (user && user.isEmailVerified !== false) {
                useAuthStore.getState().setAuth(user, data.accessToken);
              } else {
                logout();
              }
            });
        } else {
          logout();
        }
      })
      .catch(() => logout())
      .finally(() => setChecking(false));
  }, []);

  if (checking) return null;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}