import { formatDate } from '@/lib/utils';
import { FlaskConical, FileDown, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { LabResult } from '@/types';

interface LabResultItemProps {
  result: LabResult;
}

export default function LabResultItem({ result }: LabResultItemProps) {
  const [expanded, setExpanded] = useState(false);

  const statusConfig = {
    NORMAL: { label: 'طبيعي', cls: 'bg-green-100 text-green-700' },
    ABNORMAL: { label: 'غير طبيعي', cls: 'bg-red-100 text-red-700' },
    PENDING: { label: 'معلق', cls: 'bg-gray-100 text-gray-600' },
  };
  const status = statusConfig[result.status];

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 p-4 text-right hover:bg-gray-50 transition-colors"
      >
        <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
          <FlaskConical className="w-4 h-4 text-teal-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900">{result.testName}</p>
          <p className="text-xs text-gray-400 mt-0.5">{formatDate(result.date)}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${status.cls}`}>
            {status.label}
          </span>
          {result.fileUrl && (
            <a
              href={result.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1 text-gray-400 hover:text-blue-600"
            >
              <FileDown className="w-4 h-4" />
            </a>
          )}
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {expanded && result.results && result.results.length > 0 && (
        <div className="border-t border-gray-100 bg-gray-50">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-100">
                <th className="text-right px-4 py-2 font-medium">الفحص</th>
                <th className="text-right px-4 py-2 font-medium">القيمة</th>
                <th className="text-right px-4 py-2 font-medium">المرجع</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {result.results.map((item, i) => (
                <tr key={i} className={item.isAbnormal ? 'bg-red-50' : ''}>
                  <td className="px-4 py-2.5 text-gray-800">{item.name}</td>
                  <td className={`px-4 py-2.5 font-mono font-medium ${item.isAbnormal ? 'text-red-700' : 'text-gray-900'}`}>
                    {item.value} {item.unit}
                  </td>
                  <td className="px-4 py-2.5 text-gray-400 text-xs">{item.referenceRange ?? '—'}</td>
                  <td className="px-4 py-2.5">
                    {item.isAbnormal && (
                      <span className="text-xs text-red-600 bg-red-100 px-1.5 py-0.5 rounded">⚠</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
