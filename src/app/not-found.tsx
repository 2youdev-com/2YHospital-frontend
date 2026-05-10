import Link from 'next/link';
import { Hospital } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mb-6">
        <Hospital className="w-10 h-10 text-blue-600" />
      </div>
      <h1 className="text-6xl font-black text-blue-600 mb-2">404</h1>
      <h2 className="text-xl font-bold text-gray-900 mb-2">الصفحة غير موجودة</h2>
      <p className="text-sm text-gray-500 mb-8 max-w-xs">
        الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
      </p>
      <div className="flex gap-3">
        <Link href="/dashboard" className="btn-primary">
          لوحة التحكم
        </Link>
        <Link href="/portal" className="btn-secondary">
          بوابة الطبيب
        </Link>
      </div>
      <p className="text-xs text-gray-400 mt-8">2YHospital — المنصة الرقمية الموحدة</p>
    </div>
  );
}
