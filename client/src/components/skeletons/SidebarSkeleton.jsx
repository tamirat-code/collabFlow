import { SkeletonBlock } from '../Skeleton';

export default function SidebarSkeleton() {
  return (
    <div style={{ padding: '0.75rem' }}>
      <SkeletonBlock width="100%" height="36px" radius="8px" style={{ marginBottom: '1rem' }} />
      <SkeletonBlock width="60px" height="10px" style={{ marginBottom: '8px' }} />
      {[1, 2, 3].map(i => (
        <SkeletonBlock key={i} width="100%" height="34px" radius="8px" style={{ marginBottom: '6px' }} />
      ))}
    </div>
  );
}