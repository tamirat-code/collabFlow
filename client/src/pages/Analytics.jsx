import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, TrendingUp, CheckSquare, AlertTriangle, FolderKanban } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useAnalytics } from '../hooks/useAnalytics';
import useWorkspaceStore from '../store/workspaceStore';
import { useWorkspaces } from '../hooks/useWorkspaces';

const COLORS = {
  todo:          '#3a7080',
  'in-progress': '#00c8b4',
  done:          '#22c55e',
  low:           '#22c55e',
  medium:        '#f59e0b',
  high:          '#f87171',
};

const S = {
  page:        { minHeight: '100vh', background: '#020f18', padding: '2rem 1rem' },
  inner:       { maxWidth: '1100px', margin: '0 auto' },
  back:        { display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#3a7080', fontSize: '13px', cursor: 'pointer', marginBottom: '2rem', fontFamily: 'inherit' },
  heading:     { fontSize: '24px', fontWeight: 600, color: '#e0f5f2', marginBottom: '4px' },
  sub:         { fontSize: '14px', color: '#3a7080', marginBottom: '2rem' },
  statGrid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
  statCard:    { background: '#051e2e', border: '1px solid #0e3347', borderRadius: '14px', padding: '1.25rem 1.5rem' },
  statLabel:   { fontSize: '12px', color: '#3a7080', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' },
  statValue:   { fontSize: '28px', fontWeight: 700, color: '#e0f5f2', lineHeight: 1 },
  statSub:     { fontSize: '12px', color: '#3a7080', marginTop: '4px' },
  chartGrid:   { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem', marginBottom: '1rem' },
  chartCard:   { background: '#051e2e', border: '1px solid #0e3347', borderRadius: '14px', padding: '1.5rem' },
  chartTitle:  { fontSize: '14px', fontWeight: 600, color: '#e0f5f2', marginBottom: '1.25rem' },
  empty:       { fontSize: '13px', color: '#2a6070', textAlign: 'center', padding: '2rem 0' },
  assigneeRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid #0a2535' },
  assigneeName:{ fontSize: '13px', color: '#c0e8e4', flex: 1 },
  assigneeCount:{ fontSize: '13px', fontWeight: 600, color: '#00c8b4' },
  avatarSm:    { width: '28px', height: '28px', borderRadius: '50%', background: '#0a3347', border: '1px solid #00c8b4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600, color: '#00c8b4', flexShrink: 0 },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#051e2e', border: '1px solid #0e3347', borderRadius: '8px', padding: '10px 14px' }}>
      <p style={{ fontSize: '12px', color: '#3a7080', marginBottom: '4px' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: '13px', color: p.color || '#00c8b4', margin: '2px 0' }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const navigate = useNavigate();
  const { activeWorkspaceId } = useWorkspaceStore();
  const { data: workspaces } = useWorkspaces();
  const { data, isLoading } = useAnalytics(activeWorkspaceId);

  const activeWorkspace = workspaces?.find(w => w._id === activeWorkspaceId);

  const statusData = data ? [
    { name: 'To Do',       value: data.byStatus.todo,           color: COLORS.todo },
    { name: 'In Progress', value: data.byStatus['in-progress'], color: COLORS['in-progress'] },
    { name: 'Done',        value: data.byStatus.done,           color: COLORS.done },
  ] : [];

  const priorityData = data ? [
    { name: 'Low',    value: data.byPriority.low,    color: COLORS.low },
    { name: 'Medium', value: data.byPriority.medium, color: COLORS.medium },
    { name: 'High',   value: data.byPriority.high,   color: COLORS.high },
  ] : [];

  if (isLoading) {
    return (
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={28} color="#00c8b4" className="animate-spin" />
      </div>
    );
  }

  return (
    <div style={S.page}>
      <div style={S.inner}>
        <button style={S.back} onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={14} /> Back to dashboard
        </button>

        <h1 style={S.heading}>Analytics</h1>
        <p style={S.sub}>{activeWorkspace?.name} — workspace overview</p>

        {/* Stat cards */}
        <div style={S.statGrid}>
          <div style={S.statCard}>
            <p style={S.statLabel}>Total Projects</p>
            <p style={S.statValue}>{data?.totals.projects ?? 0}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
              <FolderKanban size={13} color="#3a7080" />
              <span style={S.statSub}>active projects</span>
            </div>
          </div>

          <div style={S.statCard}>
            <p style={S.statLabel}>Total Tasks</p>
            <p style={S.statValue}>{data?.totals.tasks ?? 0}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
              <CheckSquare size={13} color="#3a7080" />
              <span style={S.statSub}>across all projects</span>
            </div>
          </div>

          <div style={S.statCard}>
            <p style={S.statLabel}>Completion Rate</p>
            <p style={{ ...S.statValue, color: '#00c8b4' }}>{data?.totals.completionRate ?? 0}%</p>
            <div style={{ marginTop: '8px', height: '4px', background: '#0a2535', borderRadius: '2px' }}>
              <div style={{ height: '4px', background: '#00c8b4', borderRadius: '2px', width: `${data?.totals.completionRate ?? 0}%`, transition: 'width 0.6s ease' }} />
            </div>
          </div>

          <div style={S.statCard}>
            <p style={S.statLabel}>Overdue Tasks</p>
            <p style={{ ...S.statValue, color: data?.totals.overdue > 0 ? '#f87171' : '#e0f5f2' }}>
              {data?.totals.overdue ?? 0}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
              <AlertTriangle size={13} color={data?.totals.overdue > 0 ? '#f87171' : '#3a7080'} />
              <span style={{ ...S.statSub, color: data?.totals.overdue > 0 ? '#f87171' : '#3a7080' }}>
                past due date
              </span>
            </div>
          </div>
        </div>

        {/* Task activity — area chart */}
        <div style={{ ...S.chartCard, marginBottom: '1rem' }}>
          <p style={S.chartTitle}>Task Activity (last 14 days)</p>
          {data?.createdPerDay?.every(d => d.count === 0) ? (
            <p style={S.empty}>No tasks created in the last 14 days.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data?.createdPerDay} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="taskGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#00c8b4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00c8b4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#3a7080' }} axisLine={false} tickLine={false} interval={1} />
                <YAxis tick={{ fontSize: 11, fill: '#3a7080' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" name="Tasks created" stroke="#00c8b4" strokeWidth={2} fill="url(#taskGradient)" dot={{ fill: '#00c8b4', strokeWidth: 0, r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={S.chartGrid}>
          {/* Tasks by status — pie chart */}
          <div style={S.chartCard}>
            <p style={S.chartTitle}>Tasks by Status</p>
            {statusData.every(d => d.value === 0) ? (
              <p style={S.empty}>No tasks yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span style={{ fontSize: '12px', color: '#a0cdd8' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Tasks by priority — pie chart */}
          <div style={S.chartCard}>
            <p style={S.chartTitle}>Tasks by Priority</p>
            {priorityData.every(d => d.value === 0) ? (
              <p style={S.empty}>No tasks yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {priorityData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span style={{ fontSize: '12px', color: '#a0cdd8' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Tasks per project — bar chart */}
          <div style={S.chartCard}>
            <p style={S.chartTitle}>Tasks per Project</p>
            {!data?.byProject?.length ? (
              <p style={S.empty}>No projects yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.byProject} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#3a7080' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#3a7080' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="total" name="Total" fill="#0a3347" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="done"  name="Done"  fill="#00c8b4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Top assignees */}
          <div style={S.chartCard}>
            <p style={S.chartTitle}>Top Assignees</p>
            {!data?.topAssignees?.length ? (
              <p style={S.empty}>No assigned tasks yet.</p>
            ) : (
              data.topAssignees.map((a, i) => (
                <div key={i} style={{ ...S.assigneeRow, borderBottom: i === data.topAssignees.length - 1 ? 'none' : '1px solid #0a2535' }}>
                  {a.avatar ? (
                    <img src={a.avatar} style={{ ...S.avatarSm, objectFit: 'cover' }} alt="" />
                  ) : (
                    <div style={S.avatarSm}>{a.name?.[0]?.toUpperCase()}</div>
                  )}
                  <span style={S.assigneeName}>{a.name}</span>
                  <span style={S.assigneeCount}>{a.count} task{a.count !== 1 ? 's' : ''}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}