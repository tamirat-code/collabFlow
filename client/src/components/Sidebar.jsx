import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutGrid, Plus, ChevronDown, LogOut, UserPlus,
  Zap, X, BarChart2, Settings, FolderKanban,
} from 'lucide-react';
import { useWorkspaces, useCreateWorkspace } from '../hooks/useWorkspaces';
import { useProjects } from '../hooks/useProjects';
import { useLogout, useMe } from '../hooks/useAuth';
import useWorkspaceStore from '../store/workspaceStore';
import { useWorkspaceRole } from '../hooks/useWorkspaceRole';
import CreateWorkspaceModal from './modals/CreateWorkspaceModal';
import CreateProjectModal from './modals/CreateProjectModal';
import InviteMemberModal from './modals/InviteMemberModal';
import NotificationBell from './NotificationBell';

export default function Sidebar({ onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: user } = useMe();
  const { data: workspaces, isLoading: loadingWs } = useWorkspaces();
  const { activeWorkspaceId, activeProjectId, setActiveWorkspace, setActiveProject } = useWorkspaceStore();
  const { data: projects, isLoading: loadingProjects } = useProjects(activeWorkspaceId);
  const { canEdit } = useWorkspaceRole();
  const { mutateAsync: logoutAsync } = useLogout();

  const [showWsDropdown, setShowWsDropdown] = useState(false);
  const [showCreateWs, setShowCreateWs] = useState(false);
  const [showCreateProj, setShowCreateProj] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
const { role: workspaceRole } = useWorkspaceRole();

  useEffect(() => {
    if (!workspaces) return;
    const stillValid = workspaces.some((w) => w._id === activeWorkspaceId);
    if (activeWorkspaceId && !stillValid) {
      setActiveWorkspace(workspaces.length > 0 ? workspaces[0]._id : null);
    } else if (!activeWorkspaceId && workspaces.length > 0) {
      setActiveWorkspace(workspaces[0]._id);
    }
  }, [activeWorkspaceId, workspaces]);

  const activeWorkspace = workspaces?.find((w) => w._id === activeWorkspaceId);

  const handleLogout = async () => {
    try { await logoutAsync(); } catch {}
    navigate('/login');
  };

  const navBtn = (active) => ({
    width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
    padding: '9px 12px', borderRadius: '8px', fontSize: '13px',
    fontFamily: 'inherit', border: 'none', cursor: 'pointer',
    background: active ? 'rgba(0,200,180,0.1)' : 'none',
    color: active ? '#00c8b4' : '#5a8a99',
    borderLeft: active ? '2px solid #00c8b4' : '2px solid transparent',
    transition: 'all 0.15s',
    textAlign: 'left',
  });

  return (
    <aside style={{
      background: '#051e2e',
      borderRight: '1px solid #0e3347',
      height: '100vh',
      width: '256px',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>

      {/* ── Logo ── */}
      <div style={{
        padding: '1.1rem 1.25rem',
        borderBottom: '1px solid #0e3347',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #00c8b4, #009e8e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <LayoutGrid size={15} color="#fff" />
          </div>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#e0f5f2', letterSpacing: '0.3px' }}>
            CollabFlow
          </span>
        </div>
      
      </div>

      <div style={{ padding: '0.75rem', borderBottom: '1px solid #0e3347', position: 'relative' }}>
        <p style={{ fontSize: '10px', fontWeight: 600, color: '#2a6070', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px', paddingLeft: '4px' }}>
          Workspace
        </p>
        <button
          onClick={() => setShowWsDropdown(!showWsDropdown)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 12px', borderRadius: '8px',
            background: '#0a2535', border: '1px solid #0e3347',
            color: '#a0cdd8', fontSize: '13px', cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '6px', background: 'rgba(0,200,180,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#00c8b4' }}>
                {activeWorkspace?.name?.[0]?.toUpperCase() || 'W'}
              </span>
            </div>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px', color: '#c0e8e4', fontWeight: 500 }}>
              {loadingWs ? 'Loading...' : activeWorkspace?.name || 'Select workspace'}
            </span>
          </div>
          <ChevronDown size={13} style={{ flexShrink: 0, color: '#3a7080' }} />
        </button>

        {showWsDropdown && (
          <div style={{
            position: 'absolute', left: '0.75rem', right: '0.75rem', top: '100%',
            marginTop: '4px', background: '#051e2e', border: '1px solid #0e3347',
            borderRadius: '10px', zIndex: 20, overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}>
            <div style={{ padding: '6px 10px', fontSize: '10px', fontWeight: 600, color: '#2a6070', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #0a2535' }}>
              Switch workspace
            </div>
            {workspaces?.map((ws) => (
              <button
                key={ws._id}
                onClick={() => { setActiveWorkspace(ws._id); setShowWsDropdown(false); }}
                style={{
                  width: '100%', textAlign: 'left', padding: '9px 12px',
                  fontSize: '13px', background: ws._id === activeWorkspaceId ? '#0a2535' : 'none',
                  color: ws._id === activeWorkspaceId ? '#00c8b4' : '#a0cdd8',
                  border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                }}
              >
                <div style={{ width: '18px', height: '18px', borderRadius: '5px', background: 'rgba(0,200,180,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, color: '#00c8b4', flexShrink: 0 }}>
                  {ws.name?.[0]?.toUpperCase()}
                </div>
                {ws.name}
              </button>
            ))}
            <button
              onClick={() => { setShowCreateWs(true); setShowWsDropdown(false); }}
              style={{
                width: '100%', textAlign: 'left', padding: '9px 12px',
                fontSize: '13px', color: '#00c8b4', background: 'none',
                border: 'none', borderTop: '1px solid #0a2535',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              <Plus size={13} /> New workspace
            </button>
          </div>
        )}

        {canEdit && activeWorkspaceId && (
          <button
            onClick={() => setShowInvite(true)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 8px', marginTop: '6px',
              fontSize: '12px', color: '#3a7080', background: 'none', border: 'none', cursor: 'pointer',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#00c8b4'}
            onMouseLeave={e => e.currentTarget.style.color = '#3a7080'}
          >
            <UserPlus size={13} /> Invite member
          </button>
        )}
      </div>

      {/* ── Navigation ── */}
      <div style={{ padding: '0.75rem', borderBottom: '1px solid #0e3347' }}>
        <p style={{ fontSize: '10px', fontWeight: 600, color: '#2a6070', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px', paddingLeft: '4px' }}>
          Navigate
        </p>
        <button
          style={navBtn(location.pathname === '/dashboard' && !activeProjectId)}
          onClick={() => { setActiveProject(null); navigate('/dashboard'); onClose?.(); }}
          onMouseEnter={e => { if (location.pathname !== '/dashboard' || activeProjectId) e.currentTarget.style.color = '#c0e8e4'; }}
          onMouseLeave={e => { if (location.pathname !== '/dashboard' || activeProjectId) e.currentTarget.style.color = '#5a8a99'; }}
        >
          <LayoutGrid size={15} /> Overview
        </button>
        <button
          style={navBtn(location.pathname === '/analytics')}
          onClick={() => { navigate('/analytics'); onClose?.(); }}
          onMouseEnter={e => { if (location.pathname !== '/analytics') e.currentTarget.style.color = '#c0e8e4'; }}
          onMouseLeave={e => { if (location.pathname !== '/analytics') e.currentTarget.style.color = '#5a8a99'; }}
        >
          <BarChart2 size={15} /> Analytics
        </button>
      </div>

      {/* ── Projects ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', marginBottom: '4px' }}>
          <span style={{ fontSize: '10px', fontWeight: 600, color: '#2a6070', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Projects
          </span>
          {canEdit && (
            <button
              onClick={() => setShowCreateProj(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3a7080', display: 'flex', padding: '2px' }}
              onMouseEnter={e => e.currentTarget.style.color = '#00c8b4'}
              onMouseLeave={e => e.currentTarget.style.color = '#3a7080'}
              title="New project"
            >
              <Plus size={14} />
            </button>
          )}
        </div>

        {loadingProjects && (
          <p style={{ fontSize: '12px', color: '#2a6070', padding: '4px 8px' }}>Loading...</p>
        )}

        {!loadingProjects && projects?.length === 0 && (
          <div style={{ padding: '12px 8px', textAlign: 'center' }}>
            <FolderKanban size={20} color="#1e4a5a" style={{ margin: '0 auto 6px' }} />
            <p style={{ fontSize: '12px', color: '#2a6070' }}>No projects yet</p>
          </div>
        )}

        {projects?.map((project) => {
          const isActive = project._id === activeProjectId && location.pathname === '/dashboard';

          return (
            <button
              key={project._id}
              onClick={() => {
                setActiveProject(project._id);
                onClose?.();
                navigate('/dashboard');
              }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 10px', borderRadius: '8px', fontSize: '13px',
                color: isActive ? '#00c8b4' : '#5a8a99',
                background: isActive ? 'rgba(0,200,180,0.08)' : 'none',
                borderLeft: isActive ? '2px solid #00c8b4' : '2px solid transparent',
                borderTop: 'none', borderRight: 'none', borderBottom: 'none',
                cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = '#071a27'; e.currentTarget.style.color = '#c0e8e4'; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#5a8a99'; } }}
            >
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isActive ? '#00c8b4' : '#2a6070', flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                {project.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Upgrade ── */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid #0e3347' }}>
        <button
          onClick={() => navigate('/billing')}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
            padding: '9px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 600,
            background: 'linear-gradient(135deg, rgba(0,200,180,0.12), rgba(0,158,142,0.08))',
            border: '1px solid rgba(0,200,180,0.2)', color: '#00c8b4',
            cursor: 'pointer', fontFamily: 'inherit', marginBottom: '0.5rem',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#00c8b4'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,200,180,0.2)'}
        >
          <Zap size={13} /> Upgrade plan
        </button>

        {/* ── User footer ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 4px' }}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0, cursor: 'pointer' }}
            onClick={() => navigate('/profile')}
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #00c8b4', flexShrink: 0 }}
                alt=""
              />
            ) : (
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0a3347', border: '1.5px solid #00c8b4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600, color: '#00c8b4', flexShrink: 0 }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '13px', fontWeight: 500, color: '#e0f5f2', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name}
              </p>
           <p style={{ fontSize: '11px', color: '#3a7080', textTransform: 'capitalize' }}>
  {workspaceRole || user?.role}
</p>

            </div>
          </div>
          <NotificationBell />
          <button
            onClick={handleLogout}
            title="Logout"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3a7080', display: 'flex', padding: '4px' }}
            onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
            onMouseLeave={e => e.currentTarget.style.color = '#3a7080'}
          >
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