import { Link } from 'react-router-dom';
import { Home, LayoutGrid } from 'lucide-react';
import useAuthStore from '../store/authStore';

const S = {
  page:     { minHeight: '100vh', background: '#020f18', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' },
  card:     { textAlign: 'center', maxWidth: '420px' },
  logo:     { fontSize: '20px', fontWeight: 700, color: '#00c8b4', marginBottom: '2rem', letterSpacing: '-0.5px' },
  code:     { fontSize: 'clamp(72px, 15vw, 120px)', fontWeight: 700, color: '#0e3347', lineHeight: 1, margin: '0 0 0.5rem' },
  heading:  { fontSize: '22px', fontWeight: 600, color: '#e0f5f2', margin: '0 0 0.75rem' },
  subtext:  { fontSize: '14px', color: '#3a7080', lineHeight: 1.6, margin: '0 0 2rem' },
  actions:  { display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' },
  primary:  { display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#00c8b4', border: 'none', color: '#020f18', fontSize: '13px', fontWeight: 600, padding: '10px 22px', borderRadius: '20px', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none' },
  secondary:{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'transparent', border: '1.5px solid #1e4a5a', color: '#c0e8e4', fontSize: '13px', fontWeight: 500, padding: '9px 22px', borderRadius: '20px', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none' },
};

export default function NotFound() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.logo}>CollabFlow</div>
        <p style={S.code}>404</p>
        <h1 style={S.heading}>Page not found</h1>
        <p style={S.subtext}>
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <div style={S.actions}>
          <Link to="/" style={S.primary}>
            <Home size={16} />
            Go home
          </Link>
          {isAuthenticated && (
            <Link to="/dashboard" style={S.secondary}>
              <LayoutGrid size={16} />
              Dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
