import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '2YHospital',
  description: 'منصة المستشفى الرقمية الموحدة',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} font-sans bg-gray-50 text-gray-900`}>
        <AuthProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: { fontFamily: 'var(--font-cairo)', direction: 'rtl' },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
