import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Plus, ChevronDown, LogOut, FolderKanban, X } from 'lucide-react';
import { useWorkspaces, useCreateWorkspace } from '../hooks/useWorkspaces';
import { useProjects, useCreateProject } from '../hooks/useProjects';
import { useLogout, useMe } from '../hooks/useAuth';
import useWorkspaceStore from '../store/workspaceStore';
import CreateWorkspaceModal from './modals/CreateWorkspaceModal';
import CreateProjectModal from './modals/CreateProjectModal';
import { useWorkspaceRole } from '../hooks/useWorkspaceRole';
import InviteMemberModal from './modals/InviteMemberModal';
import { UserPlus } from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const [showInvite, setShowInvite] = useState(false);
  const { canEdit } = useWorkspaceRole();
  const navigate = useNavigate();
  const { data: user } = useMe();
  const { data: workspaces, isLoading: loadingWorkspaces } = useWorkspaces();
  const { activeWorkspaceId, activeProjectId, setActiveWorkspace, setActiveProject } = useWorkspaceStore();
  const { data: projects, isLoading: loadingProjects } = useProjects(activeWorkspaceId);
  const { mutate: logout } = useLogout();

  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);

  if (!activeWorkspaceId && workspaces?.length > 0) {
    setActiveWorkspace(workspaces[0]._id);
  }

  const activeWorkspace = workspaces?.find((w) => w._id === activeWorkspaceId);

  const handleLogout = () => {
    logout(undefined, { onSuccess: () => navigate('/login') });
  };

  const handleProjectSelect = (projectId) => {
    setActiveProject(projectId);
    onClose?.(); // close drawer on mobile after selecting a project
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-30
          w-64 h-screen bg-gray-900 text-gray-200 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {/* Header */}
        <div className="px-5 py-5 border-b border-gray-800 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">CollabFlow</h1>
          <button
            onClick={onClose}
            className="md:hidden text-gray-400 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Workspace selector */}
        <div className="px-3 py-3 border-b border-gray-800 relative">
          <button
            onClick={() => setShowWorkspaceDropdown(!showWorkspaceDropdown)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition text-sm"
          >
            <span className="font-medium truncate">
              {loadingWorkspaces ? 'Loading...' : activeWorkspace?.name || 'Select workspace'}
            </span>
            <ChevronDown size={16} />
          </button>

          {showWorkspaceDropdown && (
            <div className="absolute left-3 right-3 mt-1 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-10 overflow-hidden">
              {workspaces?.map((ws) => (
                <button
                  key={ws._id}
                  onClick={() => {
                    setActiveWorkspace(ws._id);
                    setShowWorkspaceDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-700 transition ${
                    ws._id === activeWorkspaceId ? 'bg-gray-700 text-white' : ''
                  }`}
                >
                  {ws.name}
                </button>
              ))}
              <button
                onClick={() => {
                  setShowCreateWorkspace(true);
                  setShowWorkspaceDropdown(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-blue-400 hover:bg-gray-700 transition flex items-center gap-2 border-t border-gray-700"
              >
                <Plus size={14} /> New workspace
              </button>
            </div>
          )}
        </div>
{activeWorkspaceId && canEdit && (
  <button
    onClick={() => setShowInvite(true)}
    className="w-full flex items-center gap-2 px-3 py-2 mt-2 text-xs text-gray-400 hover:text-white transition"
  >
    <UserPlus size={14} /> Invite member
  </button>
)}
        {/* Projects list */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Projects</span>
            {canEdit && (
              <button
                onClick={() => setShowCreateProject(true)}
                className="text-gray-400 hover:text-white transition"
                title="New project"
              >
                <Plus size={16} />
              </button>
            )}
          </div>

          {loadingProjects && <p className="text-xs text-gray-500 px-2">Loading...</p>}
          {projects?.length === 0 && !loadingProjects && (
            <p className="text-xs text-gray-500 px-2">No projects yet</p>
          )}

          <div className="space-y-1">
            {projects?.map((project) => (
              <button
                key={project._id}
                onClick={() => handleProjectSelect(project._id)}
                className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition ${
                  project._id === activeProjectId
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <FolderKanban size={16} />
                <span className="truncate">{project.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* User footer */}
        <div className="px-3 py-3 border-t border-gray-800">
          <div className="flex items-center gap-2 px-2 py-2">
            {user?.avatar ? (
              <img src={user.avatar} className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-semibold text-white">
                {user?.name?.[0]}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
            <button onClick={handleLogout} title="Logout" className="text-gray-400 hover:text-red-400 transition">
              <LogOut size={16} />
            </button>
          </div>
        </div>
{showInvite && (
  <InviteMemberModal workspaceId={activeWorkspaceId} onClose={() => setShowInvite(false)} />
)}
        {showCreateWorkspace && (
          <CreateWorkspaceModal onClose={() => setShowCreateWorkspace(false)} />
        )}
        {showCreateProject && activeWorkspaceId && (
          <CreateProjectModal workspaceId={activeWorkspaceId} onClose={() => setShowCreateProject(false)} />
        )}
      </aside>
    </>
  );
}