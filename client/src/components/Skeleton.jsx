export function SkeletonBlock({ width = '100%', height = '16px', radius = '6px', style = {} }) {
  return (
    <div
      style={{
        width, height, borderRadius: radius,
        background: 'linear-gradient(90deg, #0a2535 25%, #0e3347 50%, #0a2535 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.5s ease-in-out infinite',
        ...style,
      }}
    />
  );
}

export function SkeletonCircle({ size = '32px' }) {
  return <SkeletonBlock width={size} height={size} radius="50%" />;
}