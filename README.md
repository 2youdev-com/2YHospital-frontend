# 2YHospital — Frontend

Next.js 14 Admin Dashboard + Doctor Portal + Patient App

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios (with JWT interceptors + auto-refresh)
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Auth**: OTP-based via cookies
- **Toast**: react-hot-toast
- **Icons**: Lucide React

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/          → OTP Login (all roles)
│   ├── (admin)/               → Admin Dashboard (role: ADMIN, RECEPTIONIST, FINANCE)
│   │   ├── dashboard/         → KPIs, charts
│   │   ├── appointments/      → All appointments + detail
│   │   ├── doctors/           → Doctors list, add new, profile, schedule
│   │   ├── patients/          → Patients list + profile
│   │   ├── billing/           → Billing + invoice detail
│   │   ├── analytics/         → Revenue & appointment charts
│   │   └── notifications/     → System notifications
│   ├── (doctor)/portal/       → Doctor Portal (role: DOCTOR)
│   │   ├── (index)            → Today's schedule
│   │   ├── appointments/      → My appointments + encounter view
│   │   ├── patients/[id]/     → Patient medical summary
│   │   ├── schedule/          → Manage availability
│   │   ├── notes/[id]/        → Visit notes + AI draft
│   │   └── ai-assistant/      → AI chat + patient summary
│   └── (patient)/             → Patient App (role: PATIENT)
├── components/
│   ├── layout/                → AdminSidebar, DoctorSidebar, Topbar
│   └── shared/                → StatsCard, Badge, EmptyState, etc.
├── services/                  → Axios API services (match backend routes)
├── context/                   → AuthContext (JWT + role)
├── lib/                       → utils, constants
└── types/                     → TypeScript interfaces
```

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit NEXT_PUBLIC_API_URL to point to your backend

# 3. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo Credentials

> في بيئة التطوير `MOCK_OTP=true`، رمز التحقق يظهر في الـ console مباشرة.  
> اضغط على أي حساب في صفحة تسجيل الدخول لملء الرقم تلقائياً.

| الدور | رقم الهاتف | الصلاحيات |
|-------|------------|-----------|
| **Admin** — مدير النظام | `+201000000000` | كامل الصلاحيات: لوحة التحكم، الأطباء، المرضى، الفواتير، التقارير |
| **Doctor** — طبيب | `+201111111111` | بوابة الطبيب: الجدول اليومي، ملفات المرضى، الملاحظات، المساعد الذكي |
| **Patient1** — مريض | `+201222222222` | تطبيق المريض: حجز المواعيد، السجل الطبي، الفواتير |
| **Patient2** —  مريض | `+201533333333` | المواعيد، المرضى، الأطباء، الإشعارات |
| **Patient3** — مريض | `+201044444444` | الفواتير، التقارير المالية، الإشعارات |

## Role-based Routing

| Role | Default Route | Access |
|------|--------------|--------|
| ADMIN | `/dashboard` | All admin pages |
| RECEPTIONIST | `/appointments` | Appointments, patients, doctors, notifications |
| FINANCE | `/billing` | Billing, analytics, notifications |
| DOCTOR | `/portal` | Doctor portal only |
| PATIENT | `/patient` | Patient app only |

Protected by `middleware.ts` using cookies.

## Backend API
Expects backend running at `NEXT_PUBLIC_API_URL` (default: `http://localhost:3001/api/v1`)

All API services in `src/services/` match the backend routes:
- `POST /auth/send-otp` → `authService.sendOtp()`
- `POST /auth/verify-otp` → `authService.verifyOtp()`
- `GET /appointments` → `appointmentsService.getAllAppointments()`
- `GET /admin/dashboard` → `adminService.getDashboard()`
- etc.