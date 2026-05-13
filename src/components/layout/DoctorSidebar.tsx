'use client';

import RoleSidebar from './RoleSidebar';
import { doctorNavItems } from './role-navigation';

export default function DoctorSidebar() {
  return <RoleSidebar role="DOCTOR" title="بوابة الطبيب السريرية" items={doctorNavItems} />;
}
