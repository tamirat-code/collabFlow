import { SkeletonBlock } from '../Skeleton';

export default function AnalyticsSkeleton() {
  return (
    <div>
      <SkeletonBlock width="180px" height="24px" style={{ marginBottom: '8px' }} />
      <SkeletonBlock width="260px" height="14px" style={{ marginBottom: '2rem' }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ background: '#051e2e', border: '1px solid #0e3347', borderRadius: '14px', padding: '1.25rem 1.5rem' }}>
            <SkeletonBlock width="100px" height="11px" style={{ marginBottom: '10px' }} />
            <SkeletonBlock width="50px" height="26px" />
          </div>
        ))}
      </div>

      <div style={{ background: '#051e2e', border: '1px solid #0e3347', borderRadius: '14px', padding: '1.5rem' }}>
        <SkeletonBlock width="180px" height="15px" style={{ marginBottom: '1.25rem' }} />
        <SkeletonBlock width="100%" height="220px" radius="10px" />
      </div>
    </div>
  );
}