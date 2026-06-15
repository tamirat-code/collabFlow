import { useState } from 'react';
import { LayoutGrid, Menu } from 'lucide-react';
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
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 overflow-y-auto flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-900 transition"
          >
            <Menu size={22} />
          </button>
          <span className="font-semibold text-gray-800">CollabFlow</span>
        </div>

        <div className="flex-1 p-4 md:p-8">
          {isLoading && (
            <div className="flex items-center justify-center h-full text-gray-400">Loading...</div>
          )}

          {!isLoading && workspaces?.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <LayoutGrid size={48} className="text-gray-300 mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-1">Welcome to CollabFlow</h2>
              <p className="text-gray-500 text-sm">Create your first workspace from the sidebar to get started.</p>
            </div>
          )}

          {activeWorkspaceId && !activeProjectId && workspaces?.length > 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
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
        </div>
      </main>
    </div>
  );
}