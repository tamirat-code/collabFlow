import { useState, useEffect } from 'react';
import { Menu, Search, ChevronDown, X } from 'lucide-react';
import Sidebar from './Sidebar';
import { useMe } from '../hooks/useAuth';

const MOBILE_BREAKPOINT = 720;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return isMobile;
}

export default function AppLayout({ children }) {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: user } = useMe();

  // If the window grows past mobile size while the drawer is open, force it closed
  useEffect(() => {
    if (!isMobile) setSidebarOpen(false);
  }, [isMobile]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#031524' }}>

      {/* Mobile overlay — only ever rendered when isMobile is true */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-20"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      {isMobile ? (
        <div
          className="fixed z-30 h-full transition-transform duration-300 ease-in-out"
          style={{ transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)' }}
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>
      ) : (
        <div className="relative z-30 h-full">
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto flex flex-col min-w-0">

        {/* Topbar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '0.875rem 1.5rem',
          borderBottom: '1px solid #0e3347',
          background: '#031524',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#00c8b4', display: 'flex', flexShrink: 0 }}
            >
              <Menu size={22} />
            </button>
          )}

          {isMobile && (
            <div style={{ flex: 1, maxWidth: '400px', position: 'relative' }}>
              <Search size={14} color="#3a7080" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Quick search..."
                style={{
                  width: '100%', background: '#051e2e', border: '1px solid #0e3347',
                  borderRadius: '8px', padding: '7px 12px 7px 30px', fontSize: '13px',
                  color: '#c0e8e4', outline: 'none', fontFamily: 'inherit',
                }}
                onFocus={e => e.target.style.borderColor = '#00c8b4'}
                onBlur={e => e.target.style.borderColor = '#0e3347'}
              />
            </div>
          )}

          <div style={{ flex: 1 }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#051e2e', border: '1px solid #0e3347', borderRadius: '20px', padding: '5px 12px 5px 5px' }}>
            {user?.avatar ? (
              <img src={user.avatar} style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }} alt="" />
            ) : (
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#0a3347', border: '1px solid #00c8b4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#00c8b4' }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
            )}
            <span style={{ fontSize: '13px', fontWeight: 500, color: '#e0f5f2' }}>{user?.name}</span>
            <ChevronDown size={13} color="#3a7080" />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}