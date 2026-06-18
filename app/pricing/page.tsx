import Link from 'next/link';
import { Check, X } from 'lucide-react';

import SpikdLogo from '@/components/brand/SpikdLogo';
import { PRO_PRICE_MONTHLY } from '@/lib/pricing';

const freeFeatures = [
  'Profile creation',
  'Activities',
  'Schools',
  'Honors',
  'Essays',
  '2 lifetime analyses',
];

const proFeatures = [
  'Unlimited analyses',
  'Narrative Roadmaps',
  'Peer Benchmarks',
  'Future Spike Tracker',
  'Future Narrative Evolution',
  'All future premium features',
];

const comparison = [
  ['Profile, activities, schools, honors, essays', true, true],
  ['Narrative analyses', '2 lifetime', 'Unlimited'],
  ['Narrative Roadmaps', false, true],
  ['Peer Benchmarks', false, true],
  ['Spike Tracker', false, 'Coming soon'],
  ['Narrative Evolution', false, 'Coming soon'],
];

const faqs = [
  ['What counts as an analysis?', 'Running a narrative analysis or roadmap analysis counts once. Editing your profile, activities, schools, honors, or essays does not.'],
  ['Can I cancel anytime?', 'Yes. Paid checkout is not live yet; Pro access is being prepared for a later launch.'],
  ['Will I keep my data if I downgrade?', 'Yes. Your saved profile, activities, schools, honors, essays, and previous results stay in your account.'],
];

export default function PricingPage() {
  return (
    <main className="onboarding-bg min-h-screen px-5 py-8 text-black sm:px-8">
      <div className="relative z-10 mx-auto max-w-6xl">
        <header className="flex items-center justify-between">
          <SpikdLogo href="/" className="text-xl" />
          <Link href="/login" className="glass-button inline-flex h-10 items-center justify-center px-4 text-sm font-semibold text-black">
            Sign in
          </Link>
        </header>

        <section className="mx-auto max-w-3xl pb-12 pt-20 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--text-muted)]">Pricing</p>
          <h1 className="mt-5 font-serif text-5xl font-semibold leading-tight tracking-[-0.04em] text-black sm:text-6xl">
            Build a story <span className="gradient-text">people believe</span>.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-7 text-[var(--text-secondary)]">
            Turn activities into evidence, identify missing signals, and build a stronger narrative over time.
          </p>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <PlanCard
            name="Free"
            price="$0"
            subtitle="Start your spike baseline."
            cta="Get Started"
            href="/signup"
            features={freeFeatures}
          />
          <PlanCard
            name="Pro"
            price={PRO_PRICE_MONTHLY}
            suffix="/mo"
            subtitle="Turn diagnosis into proof-building."
            cta="Upgrade to Pro"
            href="/login"
            features={proFeatures}
            popular
          />
        </section>

        <section className="mt-10 glass-card overflow-hidden p-0">
          <div className="border-b border-[#f5f5f5] p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">Comparison</p>
            <h2 className="mt-3 font-serif text-[28px] font-semibold tracking-[-0.03em] text-black">Free diagnosis. Pro prescription.</h2>
          </div>
          <div className="divide-y divide-[#f5f5f5]">
            {comparison.map(([feature, free, pro]) => (
              <div key={String(feature)} className="grid gap-4 px-6 py-4 text-sm sm:grid-cols-[1fr_140px_140px] sm:items-center">
                <p className="font-semibold text-black">{feature}</p>
                <ComparisonValue value={free} />
                <ComparisonValue value={pro} pro />
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {faqs.map(([question, answer]) => (
            <div key={question} className="glass-card p-5">
              <h3 className="text-sm font-semibold text-black">{question}</h3>
              <p className="mt-3 text-[13px] leading-6 text-[var(--text-secondary)]">{answer}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}

function PlanCard({
  name,
  price,
  suffix,
  subtitle,
  cta,
  href,
  features,
  popular,
}: {
  name: string;
  price: string;
  suffix?: string;
  subtitle: string;
  cta: string;
  href: string;
  features: string[];
  popular?: boolean;
}) {
  return (
    <div className={`glass-card relative p-8 ${popular ? 'gradient-border-card' : ''}`}>
      {popular ? (
        <span className="absolute right-6 top-6 rounded-full bg-black px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white">
          Most Popular
        </span>
      ) : null}
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">{name}</p>
      <p className="mt-5 font-serif text-5xl font-semibold tracking-[-0.04em] text-black">
        {price}{suffix ? <span className="font-sans text-lg font-semibold text-[var(--text-muted)]">{suffix}</span> : null}
      </p>
      <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">{subtitle}</p>
      <Link
        href={href}
        className={`mt-7 inline-flex h-12 w-full items-center justify-center rounded-[10px] text-sm font-semibold transition duration-200 hover:-translate-y-px ${
          popular
            ? 'bg-[linear-gradient(135deg,#667eea,#f64f59,#12c2e9)] bg-[length:200%_200%] text-white'
            : 'glass-button text-black'
        }`}
        style={popular ? { animation: 'shimmer 6s ease infinite' } : undefined}
      >
        {cta} →
      </Link>
      <div className="mt-8 grid gap-3">
        {features.map((feature) => (
          <div key={feature} className="flex items-center gap-3 text-sm font-medium text-black">
            <Check className="h-4 w-4 text-[#16a34a]" />
            {feature}
          </div>
        ))}
      </div>
    </div>
  );
}

function ComparisonValue({ value, pro }: { value: boolean | string; pro?: boolean }) {
  if (value === true) {
    return <span className={`inline-flex items-center gap-2 font-semibold ${pro ? 'gradient-text' : 'text-black'}`}><Check className="h-4 w-4" /> Included</span>;
  }
  if (value === false) {
    return <span className="inline-flex items-center gap-2 text-[var(--text-muted)]"><X className="h-4 w-4" /> Locked</span>;
  }
  return <span className={pro ? 'font-semibold gradient-text' : 'font-medium text-[var(--text-secondary)]'}>{value}</span>;
}
