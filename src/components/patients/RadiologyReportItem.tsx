import { formatDate } from '@/lib/utils';
import { RadioTower, FileDown, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { RadiologyReport } from '@/types';

export default function RadiologyReportItem({ report }: { report: RadiologyReport }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 p-4 text-right hover:bg-gray-50 transition-colors"
      >
        <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
          <RadioTower className="w-4 h-4 text-purple-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900">{report.type}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {formatDate(report.date)}{report.radiologist && ` · ${report.radiologist}`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {report.fileUrl && (
            <a
              href={report.fileUrl}
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

      {expanded && (
        <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-3 text-sm">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">النتائج</p>
            <p className="text-gray-800 leading-relaxed">{report.findings}</p>
          </div>
          {report.impression && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">الانطباع</p>
              <p className="text-gray-800 leading-relaxed">{report.impression}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
