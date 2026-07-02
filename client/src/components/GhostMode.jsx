import { useState, useEffect, useRef } from 'react';
import { Play, Pause, X, RotateCcw } from 'lucide-react';
import { useProjectTimeline } from '../hooks/useProjectTimeline';

const STATUSES = ['todo', 'in-progress', 'done'];
const columnConfig = {
  'todo':        { label: 'To Do',       dot: '#5a8a99' },
  'in-progress': { label: 'In Progress', dot: '#00c8b4' },
  'done':        { label: 'Done',        dot: '#22c55e' },
};

export default function GhostMode({ workspaceId, projectId, onClose }) {
  const { data, isLoading } = useProjectTimeline(workspaceId, projectId);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef(null);

  const events = data?.events || [];
  const totalSteps = events.length;
  const currentEvent = events[step - 1];
  const currentTasks = step === 0 ? data?.initialState || [] : currentEvent?.snapshot || [];

  useEffect(() => {
    if (playing && step < totalSteps) {
      intervalRef.current = setTimeout(() => setStep(s => s + 1), 900);
    } else if (step >= totalSteps) {
      setPlaying(false);
    }
    return () => clearTimeout(intervalRef.current);
  }, [playing, step, totalSteps]);

  const tasksByStatus = (status) => currentTasks.filter(t => t.status === status);

  if (isLoading) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#020f18', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3a7080' }}>
        Loading timeline...
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#020f18', zIndex: 100, display: 'flex', flexDirection: 'column' }}>

  
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid #0e3347' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00c8b4', boxShadow: '0 0 8px #00c8b4', animation: playing ? 'pulse 1s infinite' : 'none' }} />
          <span style={{ fontSize: '15px', fontWeight: 600, color: '#e0f5f2' }}>Ghost Mode</span>
          <span style={{ fontSize: '12px', color: '#3a7080' }}>— project history playback</span>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3a7080', display: 'flex' }}>
          <X size={20} />
        </button>
      </div>

   
      <div style={{ padding: '1rem 1.5rem', textAlign: 'center', minHeight: '50px' }}>
        {step === 0 ? (
          <p style={{ fontSize: '13px', color: '#3a7080' }}>Project start — press play to begin</p>
        ) : currentEvent ? (
          <p style={{ fontSize: '13px', color: '#c0e8e4' }}>
            <span style={{ color: '#00c8b4', fontWeight: 600 }}>{currentEvent.user}</span>
            {' '}{currentEvent.type === 'status_changed' ? `moved "${currentEvent.taskTitle}"` : currentEvent.type === 'task_deleted' ? `deleted "${currentEvent.taskTitle}"` : 'made a change'}
            {' — '}
            <span style={{ color: '#3a7080' }}>{new Date(currentEvent.timestamp).toLocaleString()}</span>
          </p>
        ) : null}
      </div>

      
      <div style={{ flex: 1, padding: '0 1.5rem', display: 'flex', gap: '1rem', overflowX: 'auto' }}>
        {STATUSES.map((status) => (
          <div key={status} style={{ flex: 1, minWidth: '260px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: columnConfig[status].dot }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#a0cdd8' }}>{columnConfig[status].label}</span>
              <span style={{ fontSize: '12px', color: '#2a6070' }}>{tasksByStatus(status).length}</span>
            </div>
            <div style={{ flex: 1, background: '#071520', border: '1px solid #0e3347', borderRadius: '12px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {tasksByStatus(status).map((task) => (
                <div
                  key={task._id}
                  style={{
                    background: '#0a1e2e', border: '1px solid #0e3347', borderRadius: '10px',
                    padding: '10px 12px', fontSize: '13px', color: '#c0e8e4',
                    transition: 'all 0.5s ease',
                    animation: 'fadeSlide 0.4s ease',
                  }}
                >
                  {task.title}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '1.5rem', borderTop: '1px solid #0e3347' }}>
        <input
          type="range"
          min={0}
          max={totalSteps}
          value={step}
          onChange={(e) => { setStep(Number(e.target.value)); setPlaying(false); }}
          style={{ width: '100%', accentColor: '#00c8b4', marginBottom: '1rem' }}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <button
            onClick={() => { setStep(0); setPlaying(false); }}
            style={{ background: 'none', border: '1px solid #0e3347', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#3a7080' }}
          >
            <RotateCcw size={15} />
          </button>
          <button
            onClick={() => { if (step >= totalSteps) setStep(0); setPlaying(p => !p); }}
            style={{ background: '#00c8b4', border: 'none', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#020f18' }}
          >
            {playing ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
          </button>
          <span style={{ fontSize: '12px', color: '#3a7080', minWidth: '60px' }}>{step} / {totalSteps}</span>
        </div>
      </div>
    </div>
  );
}