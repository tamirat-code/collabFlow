import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Send, Trash2, Loader2, CheckCircle2, User, Zap } from 'lucide-react';
import { useConversation, useSendMessage, useClearConversation } from '../hooks/useAiAssistant';
import useWorkspaceStore from '../store/workspaceStore';
import { useMe } from '../hooks/useAuth';

const SUGGESTIONS = [
  'What tasks are overdue right now?',
  'Break down "user authentication" into tasks',
  'What should I prioritize this week?',
  'Summarize what my team has been working on',
];

function UpgradeScreen({ message }) {
  const navigate = useNavigate();
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <div style={{
        width: '56px', height: '56px', borderRadius: '16px',
        background: 'linear-gradient(135deg, #00c8b4, #009e8e)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem',
      }}>
        <Sparkles size={26} color="#fff" />
      </div>
      <p style={{ fontSize: '17px', fontWeight: 600, color: '#e0f5f2', marginBottom: '8px' }}>
        AI Assistant is a Pro feature
      </p>
      <p style={{ fontSize: '13px', color: '#3a7080', marginBottom: '1.5rem', maxWidth: '340px', lineHeight: 1.6 }}>
        {message || 'Upgrade your workspace to chat with an AI assistant that knows your projects and can create tasks for you.'}
      </p>
      <button
        onClick={() => navigate('/billing')}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '11px 24px', background: '#00c8b4', border: 'none',
          borderRadius: '24px', color: '#020f18', fontSize: '13px', fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        <Zap size={14} /> Upgrade plan
      </button>
    </div>
  );
}

export default function AIAssistant() {
  const { activeWorkspaceId } = useWorkspaceStore();
  const { data: convo, isLoading, error: convoError } = useConversation(activeWorkspaceId);
  const { mutate: sendMessage, isPending: sending, error: sendError } = useSendMessage(activeWorkspaceId);
  const { mutate: clearConvo } = useClearConversation(activeWorkspaceId);
  const { data: me } = useMe();

  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  const messages = convo?.messages || [];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  const handleSend = (text) => {
    const content = (text || input).trim();
    if (!content || sending) return;
    setInput('');
    sendMessage(content);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Plan-gated — show clean upgrade screen instead of raw error
  const isUpgradeRequired = convoError?.data?.upgradeRequired || sendError?.data?.upgradeRequired;

  if (isUpgradeRequired) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#020f18' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #0e3347' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #00c8b4, #009e8e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={16} color="#fff" />
            </div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#e0f5f2' }}>AI Assistant</p>
          </div>
        </div>
        <UpgradeScreen message={convoError?.data?.message || sendError?.data?.message} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#020f18' }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 1.5rem', borderBottom: '1px solid #0e3347', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #00c8b4, #009e8e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={16} color="#fff" />
          </div>
          <div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#e0f5f2', lineHeight: 1.2 }}>AI Assistant</p>
            <p style={{ fontSize: '11px', color: '#3a7080' }}>Knows your projects, tasks, and deadlines</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => clearConvo()}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: '1px solid #0e3347', borderRadius: '20px', padding: '6px 12px', color: '#3a7080', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <Trash2 size={12} /> Clear chat
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>

        {!isLoading && messages.length === 0 && (
          <div style={{ maxWidth: '520px', margin: '2rem auto', textAlign: 'center' }}>
            <Sparkles size={32} color="#00c8b4" style={{ margin: '0 auto 1rem' }} />
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#e0f5f2', marginBottom: '6px' }}>
              How can I help with {me?.name?.split(' ')[0]}'s workspace?
            </p>
            <p style={{ fontSize: '13px', color: '#3a7080', marginBottom: '1.5rem' }}>
              Ask about your tasks, get plans for new features, or have me create tasks directly.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  style={{
                    textAlign: 'left', padding: '10px 14px', background: '#051e2e',
                    border: '1px solid #0e3347', borderRadius: '10px', color: '#a0cdd8',
                    fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#00c8b4'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#0e3347'}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          {messages.map((m, i) => (
            <div key={m._id || i} style={{ display: 'flex', gap: '10px', marginBottom: '1.25rem', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                background: m.role === 'user' ? '#0a3347' : 'linear-gradient(135deg, #00c8b4, #009e8e)',
                border: m.role === 'user' ? '1px solid #00c8b4' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {m.role === 'user' ? <User size={13} color="#00c8b4" /> : <Sparkles size={13} color="#fff" />}
              </div>
              <div style={{ maxWidth: '85%' }}>
                <div style={{
                  background: m.role === 'user' ? '#0a3347' : '#051e2e',
                  border: '1px solid #0e3347', borderRadius: '14px',
                  padding: '10px 14px', fontSize: '13.5px', color: '#c0e8e4',
                  lineHeight: 1.6, whiteSpace: 'pre-wrap',
                }}>
                  {m.content}
                </div>
                {m.actions?.map((a, ai) => (
                  <div key={ai} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '12px', color: '#00c8b4' }}>
                    <CheckCircle2 size={13} />
                    {a.type === 'create_tasks' && `Added ${a.count} task${a.count !== 1 ? 's' : ''} to the board`}
                    {a.type === 'move_task'    && `Moved "${a.title}" from ${a.from} → ${a.to}`}
                    {a.type === 'assign_task'  && `Assigned "${a.title}" to ${a.assigneeName}`}
                    {a.type === 'delete_task'  && `Deleted "${a.title}"`}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {sending && (
            <div style={{ display: 'flex', gap: '10px', marginBottom: '1.25rem' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #00c8b4, #009e8e)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles size={13} color="#fff" />
              </div>
              <div style={{ background: '#051e2e', border: '1px solid #0e3347', borderRadius: '14px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Loader2 size={13} color="#00c8b4" className="animate-spin" />
                <span style={{ fontSize: '13px', color: '#3a7080' }}>Thinking...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid #0e3347', flexShrink: 0 }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your projects, or tell me to create tasks..."
            rows={1}
            style={{
              flex: 1, background: '#051e2e', border: '1px solid #0e3347',
              borderRadius: '14px', padding: '12px 16px', fontSize: '13.5px',
              color: '#c0e8e4', outline: 'none', fontFamily: 'inherit', resize: 'none',
              maxHeight: '120px',
            }}
            onFocus={e => e.target.style.borderColor = '#00c8b4'}
            onBlur={e => e.target.style.borderColor = '#0e3347'}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || sending}
            style={{
              width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
              background: '#00c8b4', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: !input.trim() || sending ? 0.5 : 1,
            }}
          >
            <Send size={16} color="#020f18" />
          </button>
        </div>
      </div>
    </div>
  );
}