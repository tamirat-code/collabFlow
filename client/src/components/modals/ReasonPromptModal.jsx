import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

export default function ReasonPromptModal({ title, subtitle, onConfirm, onCancel }) {
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onConfirm(reason.trim());
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: '1rem' }}>
      <div style={{ background: '#051e2e', border: '1px solid #0e3347', borderRadius: '16px', width: '100%', maxWidth: '420px', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <AlertTriangle size={18} color="#f59e0b" />
          <span style={{ fontSize: '15px', fontWeight: 600, color: '#e0f5f2' }}>{title}</span>
        </div>
        <p style={{ fontSize: '13px', color: '#3a7080', marginBottom: '1rem' }}>{subtitle}</p>

        <form onSubmit={handleSubmit}>
          <textarea
            autoFocus
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why? (this gets saved to the task history)"
            rows={3}
            style={{
              width: '100%', background: '#071520', border: '1px solid #0e3347',
              borderRadius: '8px', padding: '10px 12px', fontSize: '13px',
              color: '#c0e8e4', outline: 'none', fontFamily: 'inherit', resize: 'none',
              marginBottom: '1rem', boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="submit"
              disabled={!reason.trim()}
              style={{
                flex: 1, padding: '10px', background: '#00c8b4', border: 'none',
                borderRadius: '10px', color: '#020f18', fontSize: '13px', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', opacity: reason.trim() ? 1 : 0.5,
              }}
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '10px 20px', background: 'transparent', border: '1px solid #0e3347',
                borderRadius: '10px', color: '#a0cdd8', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}