'use client';

import { useEffect, useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import { Badge, EmptyState, LoadingSpinner, PageHeader } from '@/components/shared';
import { medicalRecordsService } from '@/services/medical-records.service';
import { FileText, Pill, ScanLine, TestTube2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { LabResult, Prescription, RadiologyReport, VisitHistory } from '@/types';

export default function PatientMedicalRecordsPage() {
  const [labs, setLabs] = useState<LabResult[]>([]);
  const [radiology, setRadiology] = useState<RadiologyReport[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [visits, setVisits] = useState<VisitHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      medicalRecordsService.getLabResults().catch(() => []),
      medicalRecordsService.getRadiologyReports().catch(() => []),
      medicalRecordsService.getPrescriptions().catch(() => []),
      medicalRecordsService.getVisitHistory().catch(() => []),
    ]).then(([labData, radiologyData, prescriptionData, visitData]) => {
      setLabs(labData);
      setRadiology(radiologyData);
      setPrescriptions(prescriptionData);
      setVisits(visitData);
    }).finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <Topbar title="ملفي الطبي" />
      <div className="p-6">
        <PageHeader title="ملفي الطبي" description="عرض موحد للزيارات والنتائج والوصفات" />
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <section className="card">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <TestTube2 className="w-5 h-5 text-blue-600" /> نتائج المختبر
              </h2>
              {labs.length === 0 ? <EmptyState title="لا توجد نتائج مختبر" icon={TestTube2} /> : (
                <div className="space-y-3">
                  {labs.map((lab) => (
                    <div key={lab.id} className="border border-gray-100 rounded-lg p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-gray-900">{lab.testName}</p>
                        <Badge className={lab.status === 'ABNORMAL' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                          {lab.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(lab.date)}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="card">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <ScanLine className="w-5 h-5 text-purple-600" /> تقارير الأشعة
              </h2>
              {radiology.length === 0 ? <EmptyState title="لا توجد تقارير أشعة" icon={ScanLine} /> : (
                <div className="space-y-3">
                  {radiology.map((report) => (
                    <div key={report.id} className="border border-gray-100 rounded-lg p-3">
                      <p className="font-medium text-gray-900">{report.type}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(report.date)}</p>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{report.impression ?? report.findings}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="card">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <Pill className="w-5 h-5 text-teal-600" /> الوصفات والأدوية
              </h2>
              {prescriptions.length === 0 ? <EmptyState title="لا توجد وصفات" icon={Pill} /> : (
                <div className="space-y-3">
                  {prescriptions.map((rx) => (
                    <div key={rx.id} className="border border-gray-100 rounded-lg p-3">
                      <p className="font-medium text-gray-900">{formatDate(rx.date)}</p>
                      <p className="text-xs text-gray-500 mt-1">{rx.doctorName}</p>
                      <p className="text-sm text-gray-600 mt-2">{rx.medications.map((m) => m.name).join('، ')}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="card">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-gray-600" /> سجل الزيارات
              </h2>
              {visits.length === 0 ? <EmptyState title="لا توجد زيارات" icon={FileText} /> : (
                <div className="space-y-3">
                  {visits.map((visit) => (
                    <div key={visit.id} className="border border-gray-100 rounded-lg p-3">
                      <p className="font-medium text-gray-900">{visit.specialty}</p>
                      <p className="text-xs text-gray-500 mt-1">{visit.doctorName} · {formatDate(visit.date)}</p>
                      {visit.diagnosis && <p className="text-sm text-gray-600 mt-2">{visit.diagnosis}</p>}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
