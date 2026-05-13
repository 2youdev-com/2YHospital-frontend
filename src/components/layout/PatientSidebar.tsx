'use client';

import RoleSidebar from './RoleSidebar';
import { patientNavItems } from './role-navigation';

export default function PatientSidebar() {
  return <RoleSidebar role="PATIENT" title="تطبيق المريض" items={patientNavItems} />;
}
