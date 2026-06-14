import { useState } from 'react';
import { Trash2, MoreHorizontal } from 'lucide-react';
import { useProjects, useDeleteProject } from '../hooks/useProjects';
import useWorkspaceStore from '../store/workspaceStore';

export default function ProjectHeader({ workspaceId, projectId }) {
  const { data: projects } = useProjects(workspaceId);
  const { mutate: deleteProject } = useDeleteProject(workspaceId);
  const setActiveProject = useWorkspaceStore((s) => s.setActiveProject);
  const [showMenu, setShowMenu] = useState(false);

  const project = projects?.find((p) => p._id === projectId);
  if (!project) return null;

  const handleDelete = () => {
    if (confirm(`Delete "${project.name}"? This will delete all its tasks too.`)) {
      deleteProject(projectId, { onSuccess: () => setActiveProject(null) });
    }
  };

  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">{project.name}</h2>
        {project.description && (
          <p className="text-sm text-gray-500 mt-1">{project.description}</p>
        )}
      </div>

      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition"
        >
          <MoreHorizontal size={18} />
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-10 w-44">
            <button
              onClick={handleDelete}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-2"
            >
              <Trash2 size={14} /> Delete project
            </button>
          </div>
        )}
      </div>
    </div>
  );
}