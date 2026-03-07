'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const STATUSES = [
  { value: 'new',         label: 'New',         color: 'bg-blue-100 text-blue-700' },
  { value: 'reviewed',    label: 'Reviewing',    color: 'bg-yellow-100 text-yellow-700' },
  { value: 'shortlisted', label: 'Shortlisted',  color: 'bg-indigo-100 text-indigo-700' },
  { value: 'rejected',    label: 'Rejected',     color: 'bg-red-100 text-red-700' },
];

export default function StatusSelect({
  applicationId,
  current,
}: {
  applicationId: string;
  current: string;
}) {
  const [status, setStatus] = useState(current);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onChange = async (val: string) => {
    setLoading(true);
    setStatus(val);
    await fetch('/api/applications/update-status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ application_id: applicationId, status: val }),
    });
    setLoading(false);
    router.refresh();
  };

  const current_status = STATUSES.find(s => s.value === status);

  return (
    <select
      value={status}
      onChange={e => onChange(e.target.value)}
      disabled={loading}
      className={`text-xs font-semibold px-2 py-1 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${current_status?.color ?? 'bg-slate-100 text-slate-600'}`}
    >
      {STATUSES.map(s => (
        <option key={s.value} value={s.value}>{s.label}</option>
      ))}
    </select>
  );
}
