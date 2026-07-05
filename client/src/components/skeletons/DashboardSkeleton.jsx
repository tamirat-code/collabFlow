import { SkeletonBlock, SkeletonCircle } from '../Skeleton';

export default function DashboardSkeleton() {
  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <SkeletonBlock width="220px" height="26px" style={{ marginBottom: '8px' }} />
        <SkeletonBlock width="300px" height="14px" />
      </div>

     
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ background: '#051e2e', border: '1px solid #0e3347', borderRadius: '14px', padding: '1.25rem 1.5rem', flex: '1 1 180px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <SkeletonBlock width="36px" height="36px" radius="10px" />
              <SkeletonBlock width="90px" height="12px" />
            </div>
            <SkeletonBlock width="50px" height="26px" style={{ marginBottom: '6px' }} />
            <SkeletonBlock width="110px" height="11px" />
          </div>
        ))}
      </div>

      <SkeletonBlock width="80px" height="16px" style={{ marginBottom: '1rem' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ background: '#051e2e', border: '1px solid #0e3347', borderRadius: '14px', padding: '1.25rem' }}>
            <SkeletonBlock width="36px" height="36px" radius="10px" style={{ marginBottom: '12px' }} />
            <SkeletonBlock width="70%" height="15px" style={{ marginBottom: '8px' }} />
            <SkeletonBlock width="90%" height="11px" style={{ marginBottom: '16px' }} />
            <SkeletonBlock width="100%" height="4px" style={{ marginBottom: '6px' }} />
            <SkeletonBlock width="60%" height="11px" />
          </div>
        ))}
      </div>
    </div>
  );
}