import Link from 'next/link';
import { ArrowRight, LockKeyhole, Sparkles } from 'lucide-react';

import DashboardShell from '@/components/layout/DashboardShell';
import { PRO_PRICE_LABEL } from '@/lib/pricing';

export default function LockedProPage({
  title,
  eyebrow,
  description,
  previewItems,
}: {
  title: string;
  eyebrow: string;
  description: string;
  previewItems: string[];
}) {
  return (
    <DashboardShell>
      <div className="space-y-7">
        <section className="spikd-card reveal-up overflow-hidden p-6 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm font-semibold text-zinc-300">
                <LockKeyhole className="h-4 w-4 text-zinc-600" />
                PRO
              </div>
              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-600">{eyebrow}</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-zinc-50 sm:text-5xl">
                {title}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-500">
                {description}
              </p>
              <Link
                href="/pricing"
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-zinc-50 px-6 py-3.5 text-sm font-semibold text-zinc-950 transition hover:-translate-y-0.5 hover:bg-white"
              >
                Upgrade to Pro — {PRO_PRICE_LABEL}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="relative rounded-[24px] border border-zinc-800 bg-zinc-950 p-5">
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">Preview</p>
                    <p className="mt-2 text-xl font-semibold text-zinc-50">Locked prescription layer</p>
                  </div>
                  <Sparkles className="h-5 w-5 text-zinc-600" />
                </div>
                <div className="mt-5 space-y-3">
                  {previewItems.map((item) => (
                    <div key={item} className="rounded-2xl border border-zinc-800 bg-[#111114] p-4">
                      <p className="text-sm font-semibold text-zinc-50">{item}</p>
                      <div className="mt-3 space-y-2 blur-[3px]">
                        <div className="h-2 rounded-full bg-zinc-700" />
                        <div className="h-2 w-4/5 rounded-full bg-zinc-700" />
                        <div className="h-2 w-2/3 rounded-full bg-zinc-700" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {['Free gives the diagnosis', 'Pro turns signals into direction', 'Built for clear next moves'].map((item) => (
            <div key={item} className="rounded-[20px] border border-zinc-800 bg-zinc-950 p-5 text-sm font-semibold text-zinc-400">
              {item}
            </div>
          ))}
        </section>
      </div>
    </DashboardShell>
  );
}
