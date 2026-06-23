import { useState, useRef, useEffect } from 'react';
import { Bell, MessageSquare, UserPlus, CheckCheck, Users } from 'lucide-react';
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead, useNotificationSocket } from '../hooks/useNotifications';

const S = {
  wrap:      { position: 'relative' },
  btn:       { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', position: 'relative' },
  badge:     { position: 'absolute', top: '0px', right: '0px', minWidth: '15px', height: '15px', background: '#f87171', borderRadius: '8px', fontSize: '10px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' },
  dropdown:  { position: 'absolute', bottom: '100%', left: '0', marginBottom: '8px', width: '300px', background: '#051e2e', border: '1px solid #0e3347', borderRadius: '12px', overflow: 'hidden', zIndex: 100, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' },
  dHeader:   { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #0e3347' },
  dTitle:    { fontSize: '12px', fontWeight: 600, color: '#e0f5f2' },
  markAll:   { background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#00c8b4', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'inherit' },
  list:      { maxHeight: '300px', overflowY: 'auto' },
  item:      { display: 'flex', gap: '8px', padding: '10px 14px', borderBottom: '1px solid #071520', cursor: 'pointer' },
  itemUnread:{ background: '#071a27' },
  icon:      { width: '24px', height: '24px', borderRadius: '50%', background: '#0a3347', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  nText:     { fontSize: '12px', color: '#a0cdd8', lineHeight: 1.4, flex: 1 },
  nSender:   { fontWeight: 600, color: '#e0f5f2' },
  nTime:     { fontSize: '10px', color: '#2a6070', marginTop: '2px' },
  unreadDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#00c8b4', flexShrink: 0, marginTop: '5px' },
  empty:     { padding: '1.5rem', textAlign: 'center', fontSize: '12px', color: '#2a6070' },
};

const typeIcon = (type) => {
  switch (type) {
    case 'comment':  return <MessageSquare size={12} color="#00c8b4" />;
    case 'assigned': return <UserPlus size={12} color="#f59e0b" />;
    case 'invite':   return <Users size={12} color="#00c8b4" />;
    default:         return <Bell size={12} color="#3a7080" />;
  }
};

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  const { data: unread } = useUnreadCount();
  const { data: notifications = [] } = useNotifications();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead, isPending } = useMarkAllAsRead();

  useNotificationSocket();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const count = unread?.count || 0;

  return (
    <div style={S.wrap} ref={ref}>
      <button style={S.btn} onClick={() => setOpen(!open)} title="Notifications">
        <Bell size={15} color={open ? '#00c8b4' : '#3a7080'} />
        {count > 0 && <span style={S.badge}>{count > 9 ? '9+' : count}</span>}
      </button>

      {open && (
        <div style={S.dropdown}>
          <div style={S.dHeader}>
            <span style={S.dTitle}>Notifications {count > 0 && `(${count})`}</span>
            {count > 0 && (
              <button style={S.markAll} onClick={() => markAllAsRead()} disabled={isPending}>
                <CheckCheck size={11} /> Mark all read
              </button>
            )}
          </div>

          <div style={S.list}>
            {notifications.length === 0 && <p style={S.empty}>No notifications yet</p>}
            {notifications.map((n) => (
              <div
                key={n._id}
                style={{ ...S.item, ...(n.read ? {} : S.itemUnread) }}
                onClick={() => { if (!n.read) markAsRead(n._id); }}
              >
                <div style={S.icon}>{typeIcon(n.type)}</div>
                <div style={{ flex: 1 }}>
                  <p style={S.nText}>
                    <span style={S.nSender}>{n.sender?.name}</span> {n.message}
                  </p>
                  <p style={S.nTime}>{timeAgo(n.createdAt)}</p>
                </div>
                {!n.read && <div style={S.unreadDot} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}