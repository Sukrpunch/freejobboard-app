'use client';

import { useState } from 'react';
import { Loader, Send } from 'lucide-react';

interface SendCampaignFormProps {
  boardId: string;
  boardName: string;
  activeJobs: Array<{ id: string; title: string; company: string }>;
  subscriberCount: number;
}

export default function SendCampaignForm({
  boardId,
  boardName,
  activeJobs,
  subscriberCount,
}: SendCampaignFormProps) {
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [subject, setSubject] = useState(`Latest jobs from ${boardName}`);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleJobToggle = (jobId: string) => {
    setSelectedJobs((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  };

  const handleSelectAll = () => {
    if (selectedJobs.length === activeJobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(activeJobs.map((job) => job.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (selectedJobs.length === 0) {
      setError('Select at least one job to send');
      return;
    }

    if (!subject.trim()) {
      setError('Subject line is required');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/campaigns/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          board_id: boardId,
          job_ids: selectedJobs,
          subject: subject.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send campaign');
      }

      setSuccess(true);
      setSelectedJobs([]);
      setSubject(`Latest jobs from ${boardName}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Subject line */}
      <div>
        <label htmlFor="subject" className="block text-sm font-semibold text-slate-900 mb-2">
          Subject Line
        </label>
        <input
          type="text"
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g., Latest jobs from [Board Name]"
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-colors"
        />
      </div>

      {/* Job selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-semibold text-slate-900">
            Featured Jobs (Max 10)
          </label>
          {activeJobs.length > 0 && (
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
            >
              {selectedJobs.length === activeJobs.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>

        {activeJobs.length === 0 ? (
          <p className="text-sm text-slate-500 bg-slate-50 rounded-xl p-4">
            No active jobs available to feature in this campaign.
          </p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto border border-slate-200 rounded-xl p-4 bg-slate-50">
            {activeJobs.map((job) => (
              <label
                key={job.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-white cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedJobs.includes(job.id)}
                  onChange={() => handleJobToggle(job.id)}
                  disabled={selectedJobs.length >= 10 && !selectedJobs.includes(job.id)}
                  className="mt-1 w-4 h-4 accent-indigo-600 rounded cursor-pointer disabled:opacity-50"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{job.title}</p>
                  <p className="text-xs text-slate-500">{job.company}</p>
                </div>
              </label>
            ))}
          </div>
        )}
        <p className="text-xs text-slate-500 mt-2">
          {selectedJobs.length} of {Math.min(activeJobs.length, 10)} selected
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-700">
          ✓ Campaign sent to {subscriberCount} subscriber{subscriberCount !== 1 ? 's' : ''}!
        </div>
      )}

      {/* Send button */}
      <button
        type="submit"
        disabled={loading || activeJobs.length === 0}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold px-4 py-3 rounded-xl transition-colors"
      >
        {loading ? (
          <>
            <Loader size={16} className="animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send size={16} />
            Send to {subscriberCount} Subscriber{subscriberCount !== 1 ? 's' : ''}
          </>
        )}
      </button>
    </form>
  );
}
