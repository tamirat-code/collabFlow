import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Plus, ChevronDown, LogOut, UserPlus ,Zap,X} from 'lucide-react';
import { useWorkspaces, useCreateWorkspace, useInviteMember } from '../hooks/useWorkspaces';
import { useProjects, useCreateProject } from '../hooks/useProjects';
import { useLogout, useMe } from '../hooks/useAuth';
import useWorkspaceStore from '../store/workspaceStore';
import { useWorkspaceRole } from '../hooks/useWorkspaceRole';
import CreateWorkspaceModal from './modals/CreateWorkspaceModal';
import CreateProjectModal from './modals/CreateProjectModal';
import InviteMemberModal from './modals/InviteMemberModal';
import NotificationBell from './NotificationBell';

const S = {
  sidebar:    { background: '#051e2e', borderRight: '1px solid #0e3347', height: '100vh', width: '256px', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  logo:       { padding: '1.25rem 1.25rem', borderBottom: '1px solid #0e3347' },
  logoText:   { fontSize: '20px', fontWeight: 700, color: '#00c8b4', letterSpacing: '0.5px' },
  wsSection:  { padding: '0.75rem', borderBottom: '1px solid #0e3347', position: 'relative' },
  wsBtn:      { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', background: '#0a2535', border: '1px solid #0e3347', color: '#a0cdd8', fontSize: '13px', cursor: 'pointer' },
  dropdown:   { position: 'absolute', left: '0.75rem', right: '0.75rem', top: '100%', marginTop: '4px', background: '#051e2e', border: '1px solid #0e3347', borderRadius: '8px', zIndex: 20, overflow: 'hidden' },
  dropItem:   { width: '100%', textAlign: 'left', padding: '8px 12px', fontSize: '13px', color: '#a0cdd8', background: 'none', border: 'none', cursor: 'pointer', display: 'block' },
  dropItemActive: { background: '#0a2535', color: '#00c8b4' },
  dropNew:    { width: '100%', textAlign: 'left', padding: '8px 12px', fontSize: '13px', color: '#00c8b4', background: 'none', border: 'none', borderTop: '1px solid #0e3347', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' },
  projSection:{ flex: 1, overflowY: 'auto', padding: '0.75rem' },
  projHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', marginBottom: '8px' },
  projLabel:  { fontSize: '11px', fontWeight: 600, color: '#2a6070', textTransform: 'uppercase', letterSpacing: '0.08em' },
  projBtn:    { paddingTop: '8px', paddingBottom: '8px', paddingLeft: '10px', paddingRight: '10px', borderRadius: '8px', fontSize: '13px', color: '#5a8a99', background: 'none', borderLeft: '2px solid transparent', borderTop: 'none', borderRight: 'none', borderBottom: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.15s' },
  projBtnActive: { background: '#0a3347', color: '#00c8b4', borderLeft: '2px solid #00c8b4', paddingLeft: '8px' },
  footer:     { padding: '0.75rem', borderTop: '1px solid #0e3347' },
  userRow:    { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px' },
  avatar:     { width: '32px', height: '32px', borderRadius: '50%', background: '#0a3347', border: '1px solid #00c8b4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600, color: '#00c8b4', flexShrink: 0 },
  userName:   { fontSize: '13px', fontWeight: 500, color: '#e0f5f2', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  userRole:   { fontSize: '11px', color: '#3a7080' },
  iconBtn:    { background: 'none', border: 'none', cursor: 'pointer', color: '#3a7080', display: 'flex', alignItems: 'center', padding: '4px' },
  inviteBtn:  { width: '100%', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 8px', fontSize: '12px', color: '#3a7080', background: 'none', border: 'none', cursor: 'pointer', marginTop: '4px' },
};

export default function Sidebar({ onClose }) {
  const navigate = useNavigate();
  const { data: user } = useMe();
  const { data: workspaces, isLoading: loadingWs } = useWorkspaces();
  const { activeWorkspaceId, activeProjectId, setActiveWorkspace, setActiveProject } = useWorkspaceStore();
  const { data: projects, isLoading: loadingProjects } = useProjects(activeWorkspaceId);
  const { canEdit } = useWorkspaceRole();

  const [showWsDropdown, setShowWsDropdown] = useState(false);
  const [showCreateWs, setShowCreateWs] = useState(false);
  const [showCreateProj, setShowCreateProj] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    if (!workspaces) return;
    const stillValid = workspaces.some((w) => w._id === activeWorkspaceId);

    if (activeWorkspaceId && !stillValid) {
      // Stale workspace ID from a previous account/session — reset it
      setActiveWorkspace(workspaces.length > 0 ? workspaces[0]._id : null);
    } else if (!activeWorkspaceId && workspaces.length > 0) {
      setActiveWorkspace(workspaces[0]._id);
    }
  }, [activeWorkspaceId, workspaces]);

  const activeWorkspace = workspaces?.find((w) => w._id === activeWorkspaceId);

  const { mutateAsync: logoutAsync } = useLogout();
  const handleLogout = async () => {
    try { await logoutAsync(); } catch {}
    navigate('/login');
  };

  return (
    <aside style={S.sidebar}>
   
      <div style={{ ...S.logo, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={S.logoText}>CollabFlow</span>
      
        <button
          onClick={onClose}
          className="md:hidden"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3a7080', display: 'flex' }}
        >
          <X size={18} />
        </button>
      </div>
    
      <div style={S.wsSection}>
        <button style={S.wsBtn} onClick={() => setShowWsDropdown(!showWsDropdown)}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {loadingWs ? 'Loading...' : activeWorkspace?.name || 'Select workspace'}
          </span>
          <ChevronDown size={14} style={{ flexShrink: 0, marginLeft: '6px' }} />
        </button>

        {showWsDropdown && (
          <div style={S.dropdown}>
            {workspaces?.map((ws) => (
              <button
                key={ws._id}
                style={{ ...S.dropItem, ...(ws._id === activeWorkspaceId ? S.dropItemActive : {}) }}
                onClick={() => { setActiveWorkspace(ws._id); setShowWsDropdown(false); }}
              >
                {ws.name}
              </button>
            ))}
            <button
              style={S.dropNew}
              onClick={() => { setShowCreateWs(true); setShowWsDropdown(false); }}
            >
              <Plus size={13} /> New workspace
            </button>
          </div>
        )}

        {canEdit && activeWorkspaceId && (
          <button style={S.inviteBtn} onClick={() => setShowInvite(true)}>
            <UserPlus size={13} /> Invite member
          </button>
        )}
      </div>

      <div style={S.projSection}>
        <div style={S.projHeader}>
          <span style={S.projLabel}>Projects</span>
          {canEdit && (
            <button
              onClick={() => setShowCreateProj(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3a7080', display: 'flex' }}
            >
              <Plus size={15} />
            </button>
          )}
        </div>

        {loadingProjects && (
          <p style={{ fontSize: '12px', color: '#2a6070', padding: '0 8px' }}>Loading...</p>
        )}

        {!loadingProjects && projects?.length === 0 && (
          <p style={{ fontSize: '12px', color: '#2a6070', padding: '0 8px' }}>No projects yet</p>
        )}

       {projects?.map((project) => (
  <button
    key={project._id}
    onClick={() => {
      setActiveProject(project._id);
      onClose?.();
    }}
    style={{
      ...S.projBtn,
      ...(project._id === activeProjectId ? S.projBtnActive : {}),
    }}
    onMouseEnter={e => { if (project._id !== activeProjectId) e.currentTarget.style.background = '#071a27'; }}
    onMouseLeave={e => { if (project._id !== activeProjectId) e.currentTarget.style.background = 'none'; }}
  >
    <LayoutGrid size={14} style={{ flexShrink: 0, color: project._id === activeProjectId ? '#00c8b4' : '#2a6070' }} />
    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      {project.name}
    </span>
  </button>
))}
      </div>

   <div className="px-3 pb-2">
          <button
            onClick={() => navigate("/billing")}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition"
            style={{ background: "rgba(0,200,180,0.08)", border: "1px solid rgba(0,200,180,0.25)", color: "#00c8b4" }}
          >
            <Zap size={13} />
            Upgrade plan
          </button>
        </div>

      <div style={S.footer}>
        <div style={S.userRow}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0, cursor: 'pointer' }}
            onClick={() => navigate('/dashboard/profile')}
            title="Profile & settings"
          >
            {user?.avatar ? (
              <img src={user.avatar} style={{ ...S.avatar, objectFit: 'cover' }} alt="" />
            ) : (
              <div style={S.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={S.userName}>{user?.name}</p>
              <p style={S.userRole}>{user?.role}</p>
            </div>
          </div>
          <NotificationBell />
          <button style={S.iconBtn} onClick={handleLogout} title="Logout">
            <LogOut size={15} />
          </button>
        </div>
      </div>

      {showCreateWs && <CreateWorkspaceModal onClose={() => setShowCreateWs(false)} />}
      {showCreateProj && activeWorkspaceId && (
        <CreateProjectModal workspaceId={activeWorkspaceId} onClose={() => setShowCreateProj(false)} />
      )}
      {showInvite && activeWorkspaceId && (
        <InviteMemberModal workspaceId={activeWorkspaceId} onClose={() => setShowInvite(false)} />
      )}
    </aside>
  );
}