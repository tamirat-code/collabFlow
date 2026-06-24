import { useState } from 'react';
import { LayoutGrid, Menu, Plus, Search, Bell, ChevronDown, TrendingUp, CheckSquare, Users, AlertCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ProjectHeader from '../components/ProjectHeader';
import KanbanBoard from '../components/kanban/KanbanBoard';
import useWorkspaceStore from '../store/workspaceStore';
import { useWorkspaces } from '../hooks/useWorkspaces';
import { useProjects } from '../hooks/useProjects';
import { useMe } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import OnboardingTour from '../components/onboardingTour';
import { useNavigate } from 'react-router-dom';

function StatCard({ icon: Icon, iconColor, iconBg, label, value, sub, subColor }) {
  return (
    <div style={{
      background: '#051e2e',
      border: '1px solid #0e3347',
      borderRadius: '14px',
      padding: '1.25rem 1.5rem',
      flex: '1 1 180px',
      minWidth: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={18} color={iconColor} />
        </div>
        <span style={{ fontSize: '13px', color: '#3a7080' }}>{label}</span>
      </div>
      <p style={{ fontSize: '28px', fontWeight: 700, color: '#e0f5f2', lineHeight: 1 }}>{value}</p>
      {sub && (
        <p style={{ fontSize: '12px', color: subColor || '#3a7080', marginTop: '6px' }}>{sub}</p>
      )}
    </div>
  );
}

function DashboardHome({ workspaces, user, activeWorkspaceId }) {
  const navigate = useNavigate();
  const { data: projects = [] } = useProjects(activeWorkspaceId);
  const activeWorkspace = workspaces?.find(w => w._id === activeWorkspaceId);

  // collect all task counts across projects
  const totalProjects = projects.length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0];

  return (
    <div>
      {/* Greeting */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#e0f5f2', marginBottom: '4px' }}>
          {greeting}, {firstName}
        </h1>
        <p style={{ fontSize: '13px', color: '#3a7080' }}>
          {activeWorkspace?.name} — here's what's happening today.
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <StatCard
          icon={LayoutGrid}
          iconColor="#00c8b4"
          iconBg="rgba(0,200,180,0.1)"
          label="Active Projects"
          value={totalProjects}
          sub="in this workspace"
        />
        <StatCard
          icon={CheckSquare}
          iconColor="#22c55e"
          iconBg="rgba(34,197,94,0.1)"
          label="Completed Tasks"
          value="—"
          sub="view analytics for details"
        />
        <StatCard
          icon={AlertCircle}
          iconColor="#f59e0b"
          iconBg="rgba(245,158,11,0.1)"
          label="Due Today"
          value="—"
          sub="check task due dates"
        />
        <StatCard
          icon={Users}
          iconColor="#a78bfa"
          iconBg="rgba(167,139,250,0.1)"
          label="Team Members"
          value={activeWorkspace?.members?.length + 1 || 1}
          sub="in this workspace"
        />
      </div>

      {/* Projects grid */}
      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#e0f5f2' }}>Projects</h2>
        <button
          onClick={() => navigate('/analytics')}
          style={{ fontSize: '12px', color: '#00c8b4', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          View analytics →
        </button>
      </div>

      {projects.length === 0 ? (
        <div style={{ background: '#051e2e', border: '1px dashed #0e3347', borderRadius: '14px', padding: '3rem', textAlign: 'center' }}>
          <LayoutGrid size={36} color="#1e4a5a" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: '#3a7080', fontSize: '14px' }}>No projects yet. Create one from the sidebar.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} workspaceId={activeWorkspaceId} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project, workspaceId }) {
  const setActiveProject = useWorkspaceStore(s => s.setActiveProject);
  const { data: tasks = [] } = useTasks(workspaceId, project._id);

  const done  = tasks.filter(t => t.status === 'done').length;
  const total = tasks.length;
  const pct   = total ? Math.round((done / total) * 100) : 0;

  return (
    <div
      onClick={() => setActiveProject(project._id)}
      style={{
        background: '#051e2e',
        border: '1px solid #0e3347',
        borderRadius: '14px',
        padding: '1.25rem',
        cursor: 'pointer',
        transition: 'border-color 0.15s, transform 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#00c8b4'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#0e3347'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(0,200,180,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LayoutGrid size={16} color="#00c8b4" />
        </div>
      </div>
      <p style={{ fontSize: '14px', fontWeight: 600, color: '#e0f5f2', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {project.name}
      </p>
      {project.description && (
        <p style={{ fontSize: '12px', color: '#3a7080', marginBottom: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {project.description}
        </p>
      )}
      <div style={{ marginTop: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '11px', color: '#3a7080' }}>Progress</span>
          <span style={{ fontSize: '11px', color: '#00c8b4', fontWeight: 600 }}>{pct}%</span>
        </div>
        <div style={{ height: '4px', background: '#0a2535', borderRadius: '2px' }}>
          <div style={{ height: '4px', background: '#00c8b4', borderRadius: '2px', width: `${pct}%`, transition: 'width 0.4s ease' }} />
        </div>
        <p style={{ fontSize: '11px', color: '#2a6070', marginTop: '6px' }}>{done}/{total} tasks done</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { activeWorkspaceId, activeProjectId } = useWorkspaceStore();
  const { data: workspaces, isLoading } = useWorkspaces();
  const { data: user } = useMe();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tourDone, setTourDone] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const showTour = !tourDone && user && user.tourCompleted === false;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#031524' }}>
      {showTour && <OnboardingTour onDone={() => setTourDone(true)} />}

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 md:hidden"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`fixed md:relative z-30 h-full transition-transform duration-300 ease-in-out md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : 'max-md:-translate-x-full'}`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <main className="flex-1 overflow-y-auto flex flex-col min-w-0">

        {/* Top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '0.875rem 1.5rem',
          borderBottom: '1px solid #0e3347',
          background: '#031524',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          {/* Mobile menu */}
          <button
            className="md:hidden"
            onClick={() => setSidebarOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#00c8b4', display: 'flex', flexShrink: 0 }}
          >
            <Menu size={22} />
          </button>

          {/* Search */}
          <div style={{ flex: 1, maxWidth: '400px', position: 'relative' }}>
            <Search size={14} color="#3a7080" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Quick search..."
              style={{
                width: '100%',
                background: '#051e2e',
                border: '1px solid #0e3347',
                borderRadius: '8px',
                padding: '7px 12px 7px 30px',
                fontSize: '13px',
                color: '#c0e8e4',
                outline: 'none',
                fontFamily: 'inherit',
              }}
              onFocus={e => e.target.style.borderColor = '#00c8b4'}
              onBlur={e => e.target.style.borderColor = '#0e3347'}
            />
          </div>

          <div style={{ flex: 1 }} />

          {/* User chip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#051e2e', border: '1px solid #0e3347', borderRadius: '20px', padding: '5px 12px 5px 5px' }}>
            {user?.avatar ? (
              <img src={user.avatar} style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }} alt="" />
            ) : (
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#0a3347', border: '1px solid #00c8b4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#00c8b4' }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
            )}
            <span style={{ fontSize: '13px', fontWeight: 500, color: '#e0f5f2' }}>{user?.name}</span>
            <ChevronDown size={13} color="#3a7080" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ padding: '1.5rem 1.5rem' }}>
          {isLoading && (
            <div className="flex items-center justify-center h-full" style={{ color: '#3a7080' }}>Loading...</div>
          )}

          {/* No workspace */}
          {!isLoading && workspaces?.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <LayoutGrid size={48} style={{ color: '#1e4a5a', marginBottom: '1rem' }} />
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#e0f5f2', marginBottom: '8px' }}>Welcome to CollabFlow</h2>
              <p style={{ color: '#3a7080', fontSize: '14px' }}>Create your first workspace from the sidebar to get started.</p>
            </div>
          )}

          {/* Home view — no project selected */}
          {!isLoading && activeWorkspaceId && !activeProjectId && workspaces?.length > 0 && (
            <DashboardHome workspaces={workspaces} user={user} activeWorkspaceId={activeWorkspaceId} />
          )}

          {/* Kanban view — project selected */}
          {!isLoading && activeWorkspaceId && activeProjectId && (
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