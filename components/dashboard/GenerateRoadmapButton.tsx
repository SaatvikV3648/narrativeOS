'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowRight, Map } from 'lucide-react';

export default function GenerateRoadmapButton({
  disabled = false,
  label = 'Generate Roadmap',
}: {
  disabled?: boolean;
  label?: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [upgradeRequired, setUpgradeRequired] = useState(false);

  async function generateRoadmap() {
    if (disabled || status === 'loading') return;

    setStatus('loading');
    setUpgradeRequired(false);
    setMessage('Fetching your roadmap · Loading proof scores · Preparing your actions');

    try {
      const response = await fetch('/api/roadmap/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setStatus('error');
        setUpgradeRequired(Boolean(data?.upgradeRequired));
        setMessage(data?.error || 'Could not generate your roadmap yet.');
        return;
      }

      setStatus('idle');
      setMessage('');
      router.refresh();
    } catch {
      setStatus('error');
      setUpgradeRequired(false);
      setMessage('Could not reach Spikd roadmap analysis. Please try again.');
    }
  }

  return (
    <div>
      <button
        type="button"
        disabled={disabled || status === 'loading'}
        onClick={generateRoadmap}
        className="glass-button group inline-flex h-12 items-center justify-center gap-2 px-5 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0"
      >
        {status === 'loading' ? (
          <span className="h-3 w-3 rounded-[3px] bg-[linear-gradient(135deg,#667eea,#f64f59,#12c2e9)]" style={{ transform: 'rotate(45deg)', animation: 'pulse-diamond 1.8s ease-in-out infinite' }} />
        ) : (
          <Map className="h-4 w-4" />
        )}
        {status === 'loading' ? 'Generating...' : label}
        {status === 'loading' ? null : <ArrowRight className="h-4 w-4 transition duration-300 group-hover:translate-x-1" />}
      </button>
      {message ? (
        <p className={`mt-3 max-w-md text-sm leading-6 ${status === 'error' ? 'text-red-600' : 'text-[var(--text-muted)]'}`}>
          {message}
          {upgradeRequired ? (
            <a href="/pricing" className="mt-2 block font-semibold text-red-700 underline underline-offset-4">
              View Pro pricing →
            </a>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
