import { useState } from 'react';
import { LayoutGrid, Menu, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ProjectHeader from '../components/ProjectHeader';
import KanbanBoard from '../components/kanban/KanbanBoard';
import useWorkspaceStore from '../store/workspaceStore';
import { useWorkspaces } from '../hooks/useWorkspaces';

export default function Dashboard() {
  const { activeWorkspaceId, activeProjectId } = useWorkspaceStore();
  const { data: workspaces, isLoading } = useWorkspaces();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#031524' }}>

      
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 md:hidden"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

     
<div
  className={`
    fixed md:relative z-30 h-full
    transition-transform duration-300 ease-in-out
    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
    md:translate-x-0
  `}
>
  <Sidebar onClose={() => setSidebarOpen(false)} />
</div>

    
      <main className="flex-1 overflow-y-auto flex flex-col min-w-0">

       
        <div
          className="flex items-center gap-3 px-4 py-3 md:hidden"
          style={{ borderBottom: '1px solid #0e3347' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#00c8b4', display: 'flex' }}
          >
            <Menu size={22} />
          </button>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#00c8b4' }}>CollabFlow</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {isLoading && (
            <div className="flex items-center justify-center h-full" style={{ color: '#3a7080' }}>
              Loading...
            </div>
          )}

          {!isLoading && workspaces?.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <LayoutGrid size={48} style={{ color: '#1e4a5a', marginBottom: '1rem' }} />
              <h2 className="text-xl font-medium mb-1" style={{ color: '#e0f5f2' }}>
                Welcome to CollabFlow
              </h2>
              <p style={{ color: '#3a7080', fontSize: '14px' }}>
                Create your first workspace from the sidebar to get started.
              </p>
            </div>
          )}

          {activeWorkspaceId && !activeProjectId && workspaces?.length > 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <LayoutGrid size={48} style={{ color: '#1e4a5a', marginBottom: '1rem' }} />
              <h2 className="text-xl font-medium mb-1" style={{ color: '#e0f5f2' }}>
                Select or create a project
              </h2>
              <p style={{ color: '#3a7080', fontSize: '14px' }}>
                Use the sidebar to choose a project or create a new one.
              </p>
            </div>
          )}

          {activeWorkspaceId && activeProjectId && (
            <>
              <ProjectHeader workspaceId={activeWorkspaceId} projectId={activeProjectId} />
              <KanbanBoard workspaceId={activeWorkspaceId} projectId={activeProjectId} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}