// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_PATHS = [
  '/dashboard',
  '/appointments',
  '/doctors',
  '/patients',
  '/billing',
  '/analytics',
  '/notifications',
  '/ai-assistant',
];
const DOCTOR_PATHS = ['/portal'];
const PATIENT_PATHS = ['/patient'];

const roleHome: Record<string, string> = {
  ADMIN: '/dashboard',
  RECEPTIONIST: '/appointments',
  FINANCE: '/billing',
  DOCTOR: '/portal',
  PATIENT: '/patient',
};

// Paths each role is explicitly allowed to visit within the admin section.
// ADMIN is allowed ALL admin paths (no restriction needed).
const roleAllowedPaths: Record<string, string[] | 'ALL'> = {
  ADMIN: 'ALL',
  RECEPTIONIST: ['/appointments', '/patients', '/doctors', '/notifications'],
  FINANCE: ['/billing', '/analytics', '/notifications'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('accessToken')?.value;
  const userRole = request.cookies.get('userRole')?.value;

  const isAdminPath = ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
  const isDoctorPath = DOCTOR_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
  const isPatientPath = PATIENT_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
  const isProtected = isAdminPath || isDoctorPath || isPatientPath;

  // Not logged in → redirect to login
  if (isProtected && !accessToken) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Admin paths: verify the role has access
  if (isAdminPath && accessToken && userRole) {
    const allowed = roleAllowedPaths[userRole];

    if (!allowed) {
      // Role has no admin access at all (DOCTOR, PATIENT)
      const url = request.nextUrl.clone();
      url.pathname = roleHome[userRole] ?? '/login';
      return NextResponse.redirect(url);
    }

    if (allowed !== 'ALL') {
      // Role has restricted admin access — check the specific path
      const isAllowed = (allowed as string[]).some(
        (p) => pathname === p || pathname.startsWith(p + '/')
      );
      if (!isAllowed) {
        const url = request.nextUrl.clone();
        url.pathname = roleHome[userRole] ?? '/login';
        return NextResponse.redirect(url);
      }
    }
  }

  // Doctor paths: only DOCTOR role
  if (isDoctorPath && accessToken && userRole !== 'DOCTOR') {
    const url = request.nextUrl.clone();
    url.pathname = userRole ? roleHome[userRole] ?? '/login' : '/login';
    return NextResponse.redirect(url);
  }

  // Patient paths: only PATIENT role
  if (isPatientPath && accessToken && userRole !== 'PATIENT') {
    const url = request.nextUrl.clone();
    url.pathname = userRole ? roleHome[userRole] ?? '/login' : '/login';
    return NextResponse.redirect(url);
  }

  // Already logged in → redirect away from login
  if (pathname === '/login' && accessToken && userRole) {
    const url = request.nextUrl.clone();
    url.pathname = roleHome[userRole] ?? '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/appointments/:path*',
    '/doctors/:path*',
    '/patients/:path*',
    '/billing/:path*',
    '/analytics/:path*',
    '/notifications/:path*',
    '/ai-assistant/:path*',
    '/portal/:path*',
    '/patient/:path*',
    '/login',
  ],
};