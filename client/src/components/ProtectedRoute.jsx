import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

 
  const [, forceRecheck] = useState(0);

  useEffect(() => {
    const handlePageShow = (event) => {
      if (event.persisted) {
        forceRecheck((n) => n + 1);
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}