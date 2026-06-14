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
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-8">
        {isLoading && (
          <div className="flex items-center justify-center h-full text-gray-400">Loading...</div>
        )}

        {!isLoading && workspaces?.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <LayoutGrid size={48} className="text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-1">Welcome to CollabFlow</h2>
            <p className="text-gray-500 text-sm">Create your first workspace from the sidebar to get started.</p>
          </div>
        )}

        {activeWorkspaceId && !activeProjectId && workspaces?.length > 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <LayoutGrid size={48} className="text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-1">Select or create a project</h2>
            <p className="text-gray-500 text-sm">Use the sidebar to choose a project or create a new one.</p>
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