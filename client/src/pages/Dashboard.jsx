import { LayoutGrid } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ProjectHeader from '../components/ProjectHeader';
import KanbanBoard from '../components/kanban/KanbanBoard';
import useWorkspaceStore from '../store/workspaceStore';
import { useWorkspaces } from '../hooks/useWorkspaces';

export default function Dashboard() {
  const { activeWorkspaceId, activeProjectId } = useWorkspaceStore();
  const { data: workspaces, isLoading } = useWorkspaces();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#031524' }}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        {isLoading && (
          <div className="flex items-center justify-center h-full" style={{ color: '#3a7080' }}>
            Loading...
          </div>
        )}

        {!isLoading && workspaces?.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
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
          <div className="flex flex-col items-center justify-center h-full text-center">
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
      </main>
    </div>
  );
}