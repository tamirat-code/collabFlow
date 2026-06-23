import { useState } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { useWorkspace } from '../hooks/useWorkspaces';

const S = {
  bar:      { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', padding: '0 0 1rem', marginBottom: '0.5rem' },
  search:   { position: 'relative', flex: '1 1 180px', minWidth: '140px' },
  searchIcon: { position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#3a7080', pointerEvents: 'none' },
  input:    { width: '100%', background: '#071520', border: '1px solid #0e3347', borderRadius: '8px', padding: '7px 10px 7px 32px', fontSize: '13px', color: '#c0e8e4', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
  select:   { background: '#071520', border: '1px solid #0e3347', borderRadius: '8px', padding: '7px 10px', fontSize: '13px', color: '#c0e8e4', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' },
  clearBtn: { display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: '1px solid #0e3347', borderRadius: '8px', padding: '7px 10px', fontSize: '12px', color: '#f87171', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' },
  activeIndicator: { width: '6px', height: '6px', borderRadius: '50%', background: '#00c8b4', display: 'inline-block', marginLeft: '4px' },
};

const EMPTY = { search: '', priority: '', assignee: '', status: '', overdue: false };

export default function FilterBar({ workspaceId, filters, onChange }) {
  const { data: workspace } = useWorkspace(workspaceId);
  const [open, setOpen] = useState(false);

  const hasActiveFilter =
    filters.search || filters.priority || filters.assignee || filters.status || filters.overdue;

  const set = (key, val) => onChange({ ...filters, [key]: val });
  const clear = () => onChange(EMPTY);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: open ? '8px' : 0 }}>
        {/* Search always visible */}
        <div style={S.search}>
          <Search size={14} style={S.searchIcon} />
          <input
            style={S.input}
            placeholder="Search tasks…"
            value={filters.search}
            onChange={e => set('search', e.target.value)}
          />
        </div>

        {/* Toggle advanced filters */}
        <button
          onClick={() => setOpen(o => !o)}
          style={{ ...S.clearBtn, color: open ? '#00c8b4' : '#a0cdd8', borderColor: open ? '#00c8b4' : '#0e3347' }}
        >
          <SlidersHorizontal size={13} />
          Filters
          {hasActiveFilter && <span style={S.activeIndicator} />}
        </button>

        {hasActiveFilter && (
          <button style={S.clearBtn} onClick={clear}>
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {open && (
        <div style={S.bar}>
          <select style={S.select} value={filters.priority} onChange={e => set('priority', e.target.value)}>
            <option value="">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <select style={S.select} value={filters.status} onChange={e => set('status', e.target.value)}>
            <option value="">All statuses</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>

          <select style={S.select} value={filters.assignee} onChange={e => set('assignee', e.target.value)}>
            <option value="">All assignees</option>
            {workspace?.members?.filter(m => m.user != null).map(m => (
              <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
            ))}
          </select>

          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#a0cdd8', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={filters.overdue}
              onChange={e => set('overdue', e.target.checked)}
              style={{ accentColor: '#f87171', cursor: 'pointer' }}
            />
            Overdue only
          </label>
        </div>
      )}
    </div>
  );
}