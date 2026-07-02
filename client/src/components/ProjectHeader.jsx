import { useState } from 'react';
import { Trash2,Ghost, MoreHorizontal, Download, FileJson, FileText } from 'lucide-react';
import { useProjects, useDeleteProject, useExportProject } from '../hooks/useProjects';
import useWorkspaceStore from '../store/workspaceStore';
import { useWorkspaceRole } from '../hooks/useWorkspaceRole';
import GhostMode from './GhostMode';

export default function ProjectHeader({ workspaceId, projectId }) {
  const { data: projects } = useProjects(workspaceId);
  const { mutate: deleteProject } = useDeleteProject(workspaceId);
  const setActiveProject = useWorkspaceStore((s) => s.setActiveProject);
  const { isAdmin, canEdit } = useWorkspaceRole();
  const { exportProject, exporting } = useExportProject(workspaceId, projectId);
  const [showMenu, setShowMenu] = useState(false);
 const [showGhost, setShowGhost] = useState(false);
  const project = projects?.find((p) => p._id === projectId);
  if (!project) return null;

  const handleDelete = () => {
    setShowMenu(false);
    if (confirm(`Delete "${project.name}"? This will delete all its tasks too.`)) {
      deleteProject(projectId, { onSuccess: () => setActiveProject(null) });
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#e0f5f2', marginBottom: '4px' }}>
          {project.name}
        </h2>
        {project.description && (
          <p style={{ fontSize: '13px', color: '#3a7080' }}>{project.description}</p>
        )}
      </div>
   <button
  onClick={() => setShowGhost(true)}
  style={{
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '7px 14px', background: 'rgba(0,200,180,0.08)',
    border: '1px solid rgba(0,200,180,0.2)', borderRadius: '20px',
    color: '#00c8b4', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
  }}
>
  <Ghost size={13} /> Ghost Mode
</button>
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#3a7080', padding: '6px', borderRadius: '8px',
            display: 'flex',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#0a2535'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <MoreHorizontal size={18} />
        </button>

        {showMenu && (
          <div style={{
            position: 'absolute', right: 0, top: '100%', marginTop: '4px',
            background: '#051e2e', border: '1px solid #0e3347',
            borderRadius: '10px', overflow: 'hidden', zIndex: 10, width: '190px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}>

         
            <button
              onClick={() => { exportProject('csv'); setShowMenu(false); }}
              disabled={exporting}
              style={{
                width: '100%', textAlign: 'left', padding: '10px 14px',
                fontSize: '13px', color: '#c0e8e4', background: 'none',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px',
                borderBottom: '1px solid #0a2535',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#0a2535'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <FileText size={14} color="#00c8b4" />
              {exporting ? 'Exporting...' : 'Export as CSV'}
            </button>

            <button
              onClick={() => { exportProject('json'); setShowMenu(false); }}
              disabled={exporting}
              style={{
                width: '100%', textAlign: 'left', padding: '10px 14px',
                fontSize: '13px', color: '#c0e8e4', background: 'none',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px',
                borderBottom: isAdmin ? '1px solid #0a2535' : 'none',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#0a2535'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <FileJson size={14} color="#00c8b4" />
              {exporting ? 'Exporting...' : 'Export as JSON'}
            </button>

        
            {isAdmin && (
              <button
                onClick={handleDelete}
                style={{
                  width: '100%', textAlign: 'left', padding: '10px 14px',
                  fontSize: '13px', color: '#f87171', background: 'none',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#1a0a0a'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <Trash2 size={14} /> Delete project
              </button>
            )}
          </div>
        )}
      </div>
    
      {showGhost && (
  <GhostMode workspaceId={workspaceId} projectId={projectId} onClose={() => setShowGhost(false)} />
)}
    </div>
  );
}