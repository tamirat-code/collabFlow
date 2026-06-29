import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#031524' }}>

   
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 md:hidden"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      
      <div className={`
        fixed md:relative z-30 h-full
        transition-transform duration-300 ease-in-out
        md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : 'max-md:-translate-x-full'}
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', minWidth: 0 }}>

  
        <div
          className="flex items-center gap-3 px-4 py-3 md:hidden"
          style={{ borderBottom: '1px solid #0e3347', flexShrink: 0 }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#00c8b4', display: 'flex' }}
          >
            <Menu size={22} />
          </button>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#00c8b4' }}>CollabFlow</span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}