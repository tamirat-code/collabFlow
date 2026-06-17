import { useState } from 'react';
import { X, Trash2, Send, MessageSquare, Activity, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useComments, useActivity, useAddComment, useDeleteComment } from '../../hooks/useComments';
import { useMe } from '../../hooks/useAuth';
import { useBillingInfo } from '../../hooks/useBilling';
import useWorkspaceStore from '../../store/workspaceStore';

const M = {
  overlay:   { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' },
  card:      { background: '#051e2e', border: '1px solid #0e3347', borderRadius: '16px', width: '100%', maxWidth: '560px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' },
  header:    { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid #0e3347' },
  title:     { fontSize: '15px', fontWeight: 600, color: '#e0f5f2', lineHeight: 1.4, flex: 1, marginRight: '1rem' },
  closeBtn:  { background: 'none', border: 'none', cursor: 'pointer', color: '#3a7080', display: 'flex', flexShrink: 0 },
  body:      { flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' },
  desc:      { fontSize: '13px', color: '#3a7080', lineHeight: 1.6, marginBottom: '1.25rem', whiteSpace: 'pre-wrap' },
  meta:      { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.5rem' },
  badge:     { fontSize: '11px', fontWeight: 500, padding: '3px 10px', borderRadius: '10px', textTransform: 'capitalize' },
  tabs:      { display: 'flex', gap: '0', borderBottom: '1px solid #0e3347', marginBottom: '1.25rem' },
  tab:       { padding: '8px 16px', fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer', color: '#3a7080', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '6px' },
  tabActive: { padding: '8px 16px', fontSize: '13px', background: 'none', border: 'none', borderBottom: '2px solid #00c8b4', cursor: 'pointer', color: '#00c8b4', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '-1px' },
  comment:   { display: 'flex', gap: '10px', marginBottom: '1rem' },
  avatar:    { width: '28px', height: '28px', borderRadius: '50%', background: '#0a3347', border: '1px solid #00c8b4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600, color: '#00c8b4', flexShrink: 0 },
  cName:     { fontSize: '12px', fontWeight: 500, color: '#c0e8e4' },
  cTime:     { fontSize: '11px', color: '#2a6070', marginLeft: '8px' },
  cText:     { fontSize: '13px', color: '#a0cdd8', lineHeight: 1.5, marginTop: '3px', whiteSpace: 'pre-wrap' },
  delBtn:    { background: 'none', border: 'none', cursor: 'pointer', color: '#2a6070', padding: '2px', display: 'flex' },
  inputWrap: { display: 'flex', gap: '8px', padding: '1rem 1.5rem', borderTop: '1px solid #0e3347' },
  input:     { flex: 1, background: '#071520', border: '1px solid #0e3347', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', color: '#c0e8e4', outline: 'none', fontFamily: 'inherit', resize: 'none' },
  sendBtn:   { background: '#00c8b4', border: 'none', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#020f18', flexShrink: 0 },
  actItem:   { display: 'flex', gap: '10px', marginBottom: '1rem', alignItems: 'flex-start' },
  actText:   { fontSize: '12px', color: '#3a7080', lineHeight: 1.5 },
  actUser:   { color: '#c0e8e4', fontWeight: 500 },
  actTime:   { fontSize: '11px', color: '#2a6070', marginTop: '2px' },
  empty:     { fontSize: '13px', color: '#2a6070', textAlign: 'center', padding: '2rem 0' },
  upgrade:   { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '2.5rem 1rem', textAlign: 'center' },
  upgradeTitle: { fontSize: '15px', fontWeight: 600, color: '#e0f5f2' },
  upgradeSub:   { fontSize: '13px', color: '#3a7080', lineHeight: 1.5 },
  upgradeBtn:   { display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 20px', background: 'transparent', border: '1.5px solid #00c8b4', borderRadius: '20px', color: '#00c8b4', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
};

const priorityColors = {
  low:    { background: '#052e1a', color: '#22c55e' },
  medium: { background: '#2d1f05', color: '#f59e0b' },
  high:   { background: '#2d0a0a', color: '#f87171' },
};

const statusColors = {
  'todo':        { background: '#0a1e2e', color: '#3a7080' },
  'in-progress': { background: '#0a2535', color: '#00c8b4' },
  'done':        { background: '#052e1a', color: '#22c55e' },
};

function formatTime(date) {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function activityLabel(act) {
  switch (act.type) {
    case 'created':          return 'created this task';
    case 'status_changed':   return `moved from ${act.meta.from} → ${act.meta.to}`;
    case 'priority_changed': return `changed priority from ${act.meta.from} → ${act.meta.to}`;
    case 'assigned':         return 'changed assignee';
    case 'due_date_changed': return `set due date to ${new Date(act.meta.to).toLocaleDateString()}`;
    case 'commented':        return `commented: "${act.meta.preview}"`;
    default:                 return act.type;
  }
}

function UpgradePrompt({ onClose }) {
  const navigate = useNavigate();
  return (
    <div style={M.upgrade}>
      <Zap size={32} color="#00c8b4" />
      <p style={M.upgradeTitle}>Comments & Activity are Pro features</p>
      <p style={M.upgradeSub}>Upgrade to Pro to discuss tasks with your team and track every change.</p>
      <button style={M.upgradeBtn} onClick={() => { onClose(); navigate('/billing'); }}>
        <Zap size={14} /> Upgrade to Pro
      </button>
    </div>
  );
}

export default function TaskDetailModal({ task, workspaceId, projectId, onClose }) {
  const [tab, setTab] = useState('comments');
  const [text, setText] = useState('');
  const { data: me } = useMe();
  const { data: billing } = useBillingInfo(workspaceId);
  const isPro = billing?.plan === 'pro' || billing?.plan === 'business';

  const { data: comments = [], isLoading: loadingComments } = useComments(workspaceId, projectId, task._id);
  const { data: activity = [], isLoading: loadingActivity } = useActivity(workspaceId, projectId, task._id);
  const { mutate: addComment, isPending: sending } = useAddComment(workspaceId, projectId, task._id);
  const { mutate: deleteComment } = useDeleteComment(workspaceId, projectId, task._id);

  const handleSend = () => {
    if (!text.trim()) return;
    addComment(text.trim(), { onSuccess: () => setText('') });
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend();
  };

  return (
    <div style={M.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={M.card}>
     
        <div style={M.header}>
          <h2 style={M.title}>{task.title}</h2>
          <button style={M.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>

     
        <div style={M.body}>
          {/* Meta badges */}
          <div style={M.meta}>
            <span style={{ ...M.badge, ...priorityColors[task.priority] }}>{task.priority}</span>
            <span style={{ ...M.badge, ...statusColors[task.status] }}>{task.status}</span>
            {task.dueDate && (
              <span style={{ ...M.badge, background: '#0a1e2e', color: '#3a7080' }}>
                Due {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
            {task.assignee && (
              <span style={{ ...M.badge, background: '#0a1e2e', color: '#c0e8e4' }}>
                @{task.assignee.name}
              </span>
            )}
          </div>

          {task.description && <p style={M.desc}>{task.description}</p>}

    
          <div style={M.tabs}>
            <button style={tab === 'comments' ? M.tabActive : M.tab} onClick={() => setTab('comments')}>
              <MessageSquare size={13} /> Comments {isPro && comments.length > 0 && `(${comments.length})`}
            </button>
            <button style={tab === 'activity' ? M.tabActive : M.tab} onClick={() => setTab('activity')}>
              <Activity size={13} /> Activity
            </button>
          </div>

    
          {!isPro && <UpgradePrompt onClose={onClose} />}

        
          {isPro && tab === 'comments' && (
            <>
              {loadingComments && <p style={M.empty}>Loading...</p>}
              {!loadingComments && comments.length === 0 && <p style={M.empty}>No comments yet. Be the first!</p>}
              {comments.map((c) => (
                <div key={c._id} style={M.comment}>
                  <div style={M.avatar}>{c.author?.name?.[0]?.toUpperCase()}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <span style={M.cName}>{c.author?.name}</span>
                        <span style={M.cTime}>{formatTime(c.createdAt)}</span>
                      </div>
                      {me?._id === c.author?._id && (
                        <button style={M.delBtn} onClick={() => deleteComment(c._id)}>
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                    <p style={M.cText}>{c.content}</p>
                  </div>
                </div>
              ))}
            </>
          )}

          {isPro && tab === 'activity' && (
            <>
              {loadingActivity && <p style={M.empty}>Loading...</p>}
              {!loadingActivity && activity.length === 0 && <p style={M.empty}>No activity yet.</p>}
              {activity.map((a) => (
                <div key={a._id} style={M.actItem}>
                  <div style={{ ...M.avatar, width: '24px', height: '24px', fontSize: '10px' }}>
                    {a.user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p style={M.actText}>
                      <span style={M.actUser}>{a.user?.name}</span> {activityLabel(a)}
                    </p>
                    <p style={M.actTime}>{formatTime(a.createdAt)}</p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {isPro && tab === 'comments' && (
          <div style={M.inputWrap}>
            <textarea
              style={M.input}
              rows={2}
              placeholder="Write a comment... (Ctrl+Enter to send)"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKey}
            />
            <button style={{ ...M.sendBtn, opacity: sending || !text.trim() ? 0.5 : 1 }} onClick={handleSend} disabled={sending || !text.trim()}>
              <Send size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}