import { useState } from 'react';
import { Trash2, MoreHorizontal } from 'lucide-react';
import { useProjects, useDeleteProject } from '../hooks/useProjects';
import useWorkspaceStore from '../store/workspaceStore';
import { useWorkspaceRole } from '../hooks/useWorkspaceRole';

export default function ProjectHeader({ workspaceId, projectId }) {
  const { data: projects } = useProjects(workspaceId);
  const { mutate: deleteProject } = useDeleteProject(workspaceId);
  const setActiveProject = useWorkspaceStore((s) => s.setActiveProject);
  const { isAdmin } = useWorkspaceRole();
  const [showMenu, setShowMenu] = useState(false);

  const project = projects?.find((p) => p._id === projectId);
  if (!project) return null;

  const handleDelete = () => {
    if (confirm(`Delete "${project.name}"? This will delete all its tasks too.`)) {
      deleteProject(projectId, { onSuccess: () => setActiveProject(null) });
    }
  };

  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h2 style={{ fontSize: '22px', fontWeight: 600, color: '#e0f5f2', marginBottom: '4px' }}>
          {project.name}
        </h2>
        {project.description && (
          <p style={{ fontSize: '13px', color: '#3a7080' }}>{project.description}</p>
        )}
      </div>

      {isAdmin && (
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3a7080', padding: '6px', borderRadius: '6px' }}
            onMouseEnter={e => e.currentTarget.style.background = '#0a2535'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <MoreHorizontal size={18} />
          </button>

          {showMenu && (
            <div style={{
              position: 'absolute', right: 0, top: '100%', marginTop: '4px',
              background: '#051e2e', border: '1px solid #0e3347',
              borderRadius: '8px', overflow: 'hidden', zIndex: 10, width: '160px',
            }}>
              <button
                onClick={handleDelete}
                style={{ width: '100%', textAlign: 'left', padding: '8px 14px', fontSize: '13px', color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                onMouseEnter={e => e.currentTarget.style.background = '#1a0a0a'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <Trash2 size={13} /> Delete project
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}