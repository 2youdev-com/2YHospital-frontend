import { LoadingSpinner } from '@/components/shared';

export default function DoctorLoading() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" />
    </div>
  );
}
