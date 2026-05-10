import { LoadingSpinner } from '@/components/shared';

export default function AdminLoading() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" />
    </div>
  );
}
