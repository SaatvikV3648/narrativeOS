import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';

import SpikdLogo from '@/components/brand/SpikdLogo';
import LandingStorySections from '@/components/landing/LandingStorySections';
import { ContainerScroll } from '@/components/ui/container-scroll-animation';
import { GradientBackground } from '@/components/ui/gradient-backgrounds';

const navItems = [
  { label: 'Problem', href: '#problem' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Pro', href: '#pro' },
  { label: 'Pricing', href: '/pricing' },
];

function PrimaryCta({ children }: { children: ReactNode }) {
  return (
    <Link
      href="/login"
      className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-black px-6 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-zinc-900"
    >
      {children}
      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
    </Link>
  );
}

function SecondaryCta({ children, href = '#how-it-works' }: { children: ReactNode; href?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#e5e5e5] bg-white px-6 text-sm font-semibold text-black transition duration-200 hover:-translate-y-0.5 hover:border-[#d0d0d0] hover:bg-[#fafafa]"
    >
      {children}
      <ChevronRight className="h-4 w-4" />
    </Link>
  );
}

export default function HomePage() {
  return (
    <main className="onboarding-bg relative min-h-screen overflow-hidden bg-white text-black">
      <div className="landing-wash" />
      <header className="fixed left-0 right-0 top-4 z-50 px-4">
        <nav className="glass-card mx-auto flex max-w-6xl items-center justify-between rounded-full px-4 py-3">
          <SpikdLogo href="/" className="text-lg" />
          <div className="hidden items-center gap-1 rounded-full border border-[#eaeaea] bg-white/70 p-1 md:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-full px-4 py-2 text-sm font-semibold text-[#777777] transition hover:bg-[#f5f5f5] hover:text-black">
                {item.label}
              </Link>
            ))}
          </div>
          <Link href="/login" className="rounded-full bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-zinc-900">
            Start Free
          </Link>
        </nav>
      </header>

      <div className="relative overflow-hidden bg-white">
        <GradientBackground />
        <section className="relative z-10 px-5 pb-12 pt-36 text-center sm:px-8 sm:pt-44">
          <div className="mx-auto max-w-5xl">
            <div className="reveal-up">
              <h1 className="mx-auto max-w-5xl font-sans text-5xl font-bold leading-[0.92] tracking-[-0.08em] text-black sm:text-7xl lg:text-8xl">
                Turn activities into a story colleges believe.
              </h1>
              <p className="mx-auto mt-7 max-w-3xl text-lg leading-8 text-[#555555] sm:text-xl sm:leading-9">
                Spikd analyzes your extracurriculars, identifies missing signals, and builds proof-driven roadmaps around your strongest spike.
              </p>
              <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                <PrimaryCta>Start Free</PrimaryCta>
                <SecondaryCta href="#product-preview">See Demo</SecondaryCta>
              </div>
            </div>
          </div>
        </section>

        <div id="product-preview" className="relative z-10">
          <ContainerScroll
            titleComponent={(
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#999999]">Product preview</p>
                <h2 className="mx-auto mt-5 max-w-4xl font-sans text-4xl font-bold leading-tight tracking-[-0.06em] text-black sm:text-6xl">
                  See your story become <span className="gradient-text">measurable</span>.
                </h2>
                <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#555555] sm:text-lg">
                  Narrative Score, Proof Score, Roadmaps, and Peer Benchmarks in one workspace.
                </p>
              </div>
            )}
          >
            <img
              src="/spikd-dashboard-preview.png"
              alt="Spikd dashboard showing Narrative Score, Proof Score, Top Spike, next milestone, and spike progress."
              className="block h-auto w-full min-w-0"
            />
          </ContainerScroll>
        </div>
      </div>

      <LandingStorySections />
    </main>
  );
}
