import { Loader2 } from 'lucide-react';

export default function Spinner({ size = 16, color = '#00c8b4', className = '' }) {
  return <Loader2 size={size} color={color} className={`animate-spin ${className}`} />;
}