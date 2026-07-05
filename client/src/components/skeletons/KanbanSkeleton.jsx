import { SkeletonBlock } from '../Skeleton';

export default function KanbanSkeleton() {
  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <SkeletonBlock width="200px" height="22px" style={{ marginBottom: '8px' }} />
        <SkeletonBlock width="280px" height="13px" />
      </div>

     
      <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto' }}>
        {[1, 2, 3].map(col => (
          <div key={col} style={{ flex: '0 0 280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <SkeletonBlock width="8px" height="8px" radius="50%" />
              <SkeletonBlock width="80px" height="13px" />
            </div>
            <div style={{ background: '#071520', border: '1px solid #0e3347', borderRadius: '12px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[1, 2].map(card => (
                <div key={card} style={{ background: '#0a1e2e', border: '1px solid #0e3347', borderRadius: '10px', padding: '10px 12px' }}>
                  <SkeletonBlock width="90%" height="13px" style={{ marginBottom: '10px' }} />
                  <SkeletonBlock width="60%" height="11px" style={{ marginBottom: '10px' }} />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <SkeletonBlock width="50px" height="16px" radius="10px" />
                    <SkeletonBlock width="60px" height="16px" radius="10px" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}