'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function FeatureToggle({ jobId, featured }: { jobId: string; featured: boolean }) {
  const [isFeatured, setIsFeatured] = useState(featured);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('jobs').update({ featured: !isFeatured }).eq('id', jobId);
    if (!error) setIsFeatured(!isFeatured);
    setLoading(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={isFeatured ? 'Remove featured' : 'Feature this job'}
      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
        isFeatured
          ? 'bg-amber-100 text-amber-500 hover:bg-amber-200'
          : 'bg-slate-100 text-slate-300 hover:bg-amber-50 hover:text-amber-400'
      } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <Star size={13} fill={isFeatured ? 'currentColor' : 'none'} />
    </button>
  );
}
