import { useState } from 'react';
import { Menu, Search, ChevronDown } from 'lucide-react';
import Sidebar from './Sidebar';
import { useMe } from '../hooks/useAuth';

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: user } = useMe();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#031524' }}>

     
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 xs:hidden"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

    
      <div
        className={`
          fixed xs:!relative xs:!translate-x-0
          z-30 h-full
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      
      <main className="flex-1 overflow-y-auto flex flex-col min-w-0">

      
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '0.875rem 1.5rem',
          borderBottom: '1px solid #0e3347',
          background: '#031524',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
        
          <button
            className="flex xs:hidden"
            onClick={() => setSidebarOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#00c8b4', flexShrink: 0 }}
          >
            <Menu size={22} />
          </button>

        
          <div className="block xs:hidden" style={{ flex: 1, maxWidth: '400px', position: 'relative' }}>
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