'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, ChevronDown, Sparkles } from 'lucide-react';

import { PRO_PRICE_LABEL } from '@/lib/pricing';

const easeOut = [0.22, 1, 0.36, 1] as const;

function SectionShell({
  id,
  eyebrow,
  title,
  copy,
  children,
  className = '',
}: {
  id?: string;
  eyebrow: string;
  title: React.ReactNode;
  copy: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`relative z-10 px-5 py-24 sm:px-8 sm:py-32 ${className}`}>
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 18 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: '-120px' }}
          transition={{ duration: 0.65, ease: easeOut }}
          className="max-w-3xl"
        >
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#999999]">{eyebrow}</p>
          <h2 className="mt-5 font-sans text-4xl font-bold leading-[0.98] tracking-[-0.07em] text-black sm:text-6xl">
            {title}
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#555555]">{copy}</p>
        </motion.div>
        {children}
      </div>
    </section>
  );
}

function BrowserFrame({
  src,
  alt,
  className = '',
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -6, scale: 1.01 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8, ease: easeOut }}
      className={`overflow-hidden rounded-[30px] border border-[#eaeaea] bg-white p-2 shadow-[0_30px_90px_rgba(0,0,0,0.08)] ${className}`}
    >
      <div className="overflow-hidden rounded-[24px] border border-[#eaeaea] bg-white">
        <div className="flex h-10 items-center gap-2 border-b border-[#eaeaea] bg-[#fafafa] px-4">
          <span className="h-3 w-3 rounded-full bg-[#ff6b6b]" />
          <span className="h-3 w-3 rounded-full bg-[#f7c948]" />
          <span className="h-3 w-3 rounded-full bg-[#22c55e]" />
          <span className="mx-auto hidden h-6 w-64 items-center justify-center rounded-full border border-[#eaeaea] bg-white text-[11px] font-bold text-[#999999] sm:flex">
            app.spikd.com
          </span>
        </div>
        <img src={src} alt={alt} className="block h-auto w-full" />
      </div>
    </motion.div>
  );
}

function SignalCard({ label, delay }: { label: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay, ease: easeOut }}
      className="glass-card p-5"
    >
      <div className="mb-4 h-2 w-12 rounded-full bg-[linear-gradient(90deg,#667eea,#f64f59,#12c2e9)]" />
      <p className="text-lg font-bold tracking-[-0.03em] text-black">{label}</p>
      <p className="mt-2 text-sm leading-6 text-[#777777]">Measured from your actual profile, not generic advice.</p>
    </motion.div>
  );
}

function RoadmapStep({ index, title, delay }: { index: number; title: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -22 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: easeOut }}
      className="flex gap-4"
    >
      <div className="flex flex-col items-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#eaeaea] bg-white text-sm font-bold text-black shadow-[0_8px_24px_rgba(0,0,0,0.06)]">{index}</span>
        {index < 4 ? <span className="h-14 w-px bg-[#e5e5e5]" /> : null}
      </div>
      <div className="pt-2">
        <p className="text-base font-bold text-black">{title}</p>
        <p className="mt-1 text-sm text-[#777777]">Concrete proof action, ranked by narrative impact.</p>
      </div>
    </motion.div>
  );
}

function TestimonialMarquee({ reverse = false }: { reverse?: boolean }) {
  const primaryCards = [
    {
      quote: "Most college tools tell you what you've done. Spikd was the first one that showed me the story connecting everything I'd done. It pointed out that my robotics work had impact, but almost no outside validation, so I changed what I submitted for two summer programs.",
      name: 'Aanya Patel',
      detail: 'Junior — Plano West Senior High School',
      credibility: 'Robotics captain · accepted to UT Austin SEES',
      initials: 'AP',
    },
    {
      quote: "I was treating my startup, investing club, and nonprofit work like separate lines on a resume. Spikd helped me position them as one founder-investor story. My activities section got way sharper because I finally knew which proof mattered.",
      name: 'Ethan Kim',
      detail: 'Senior — Northwood High School, CA',
      credibility: 'Student founder · business competition finalist',
      initials: 'EK',
    },
    {
      quote: "The peer benchmark page was honestly the most useful part for me. It did not say 'copy this admitted student.' It showed that stronger applicants had progression from project to research to public proof, which made my next move obvious.",
      name: 'Sofia Rodriguez',
      detail: 'Junior — Miami, FL',
      credibility: 'AI research intern · first-gen applicant',
      initials: 'SR',
    },
    {
      quote: "I had strong debate and writing experience, but my application still felt random. Spikd helped me see the through-line around civic storytelling and gave me a clearer way to explain why my work mattered beyond awards.",
      name: 'Maya Thompson',
      detail: 'Senior — Atlanta, GA',
      credibility: 'Debate state qualifier · humanities applicant',
      initials: 'MT',
    },
  ];
  const secondaryCards = [
    {
      quote: "Spikd caught a gap my counselor and I had not named: leadership scale. I had plenty of STEM activity, but not enough evidence that other people were building with me. That changed how I planned my summer project.",
      name: 'Daniel Park',
      detail: 'Junior — Bergen County Academies, NJ',
      credibility: 'Science fair finalist · CS applicant',
      initials: 'DP',
    },
    {
      quote: "I liked that the score was not just a brag meter. My profile looked impressive on paper, but Spikd showed that my strongest activities were not telling one clear story yet. It made my extracurricular strategy feel less like guessing.",
      name: 'Leah Nguyen',
      detail: 'Senior — Seattle, WA',
      credibility: 'HOSA officer · pre-med track',
      initials: 'LN',
    },
    {
      quote: "The roadmap made my next steps concrete. Instead of 'show more impact,' it pushed me to publish a case study from my tutoring nonprofit and collect proof from families we helped. That was immediately useful.",
      name: 'Noah Williams',
      detail: 'Junior — Charlotte Latin School, NC',
      credibility: 'Nonprofit founder · community impact focus',
      initials: 'NW',
    },
    {
      quote: "As a first-generation applicant, I did not know how admissions readers would connect my responsibilities, job, and school leadership. Spikd helped me frame those pieces as resilience and responsibility instead of unrelated obligations.",
      name: 'Isabella Martinez',
      detail: 'Senior — Houston, TX',
      credibility: 'Student body treasurer · first-gen applicant',
      initials: 'IM',
    },
  ];
  const cards = reverse ? secondaryCards : primaryCards;

  return (
    <div className="group overflow-hidden py-3">
      <div className={`landing-marquee flex w-max gap-4 ${reverse ? 'landing-marquee-reverse' : ''}`}>
        {[...cards, ...cards].map((card, index) => (
          <div
            key={`${card.name}-${index}`}
            className="landing-testimonial-card flex min-h-[330px] w-[350px] flex-col rounded-[24px] border border-[#eaeaea] bg-white p-5 shadow-[0_16px_50px_rgba(0,0,0,0.05)] transition duration-200 hover:scale-[1.02] hover:shadow-[0_22px_70px_rgba(0,0,0,0.08)] sm:w-[390px]"
            style={{ transform: `rotate(${index % 2 === 0 ? '-1deg' : '1.2deg'})` }}
          >
            <div className="flex items-center gap-1 text-[#FBBF24]" aria-label="5 out of 5 stars">
              {Array.from({ length: 5 }).map((_, starIndex) => (
                <span key={starIndex} className="text-lg leading-none">★</span>
              ))}
            </div>
            <p className="mt-4 flex-1 text-[15px] font-semibold leading-7 text-black">“{card.quote}”</p>
            <div className="mt-5 border-t border-[#eaeaea] pt-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-xs font-bold text-white">{card.initials}</span>
                <span>
                  <span className="block text-sm font-bold text-black">{card.name}</span>
                  <span className="mt-0.5 block text-xs font-semibold leading-5 text-[#777777]">{card.detail}</span>
                </span>
              </div>
              <p className="mt-3 rounded-full border border-[#eaeaea] bg-[#fafafa] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#777777]">
                {card.credibility}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PricingCard({
  name,
  price,
  copy,
  features,
  pro = false,
}: {
  name: string;
  price: string;
  copy: string;
  features: string[];
  pro?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: pro ? 1.015 : 1.01 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.65, ease: easeOut }}
      className={`${pro ? 'gradient-border-card p-[1.5px]' : ''}`}
    >
      <div className={`relative h-full rounded-[24px] border border-[#eaeaea] bg-white p-7 shadow-[0_24px_80px_rgba(0,0,0,0.06)] ${pro ? 'overflow-hidden' : ''}`}>
        {pro ? <div className="absolute left-0 right-0 top-0 h-1 animate-[shimmer_6s_ease_infinite] bg-[linear-gradient(90deg,#667eea,#f64f59,#12c2e9)] bg-[length:200%_200%]" /> : null}
        {pro ? <span className="rounded-full bg-black px-3 py-1 text-xs font-bold text-white">Most Popular</span> : null}
        <h3 className="mt-5 text-2xl font-bold tracking-[-0.04em] text-black">{name}</h3>
        <p className="mt-3 text-sm leading-6 text-[#777777]">{copy}</p>
        <p className="mt-8 font-sans text-5xl font-bold tracking-[-0.07em] text-black">{price}</p>
        <Link href="/login" className={`mt-8 inline-flex h-12 w-full items-center justify-center rounded-[12px] text-sm font-bold transition duration-200 hover:-translate-y-0.5 ${pro ? 'bg-black text-white hover:bg-zinc-900' : 'border border-[#eaeaea] bg-white text-black hover:bg-[#fafafa]'}`}>
          {pro ? 'Start Pro →' : 'Start Free →'}
        </Link>
        <div className="mt-7 grid gap-3">
          {features.map((feature) => (
            <div key={feature} className="flex items-center gap-3 text-sm font-semibold text-[#555555]">
              <Check className="h-4 w-4 text-black" />
              {feature}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function LandingStorySections() {
  return (
    <>
      <SectionShell
        id="problem"
        eyebrow="Understand the story"
        title={<>Your profile already tells a <span className="gradient-text">story</span>.</>}
        copy="Most students never realize what story it is. Spikd turns scattered inputs into a measurable narrative system."
      >
        <div className="mt-14 grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <BrowserFrame src="/spikd-narrative-showcase.png" alt="Spikd narrative page showing archetype and narrative score." />
          <div className="grid gap-4">
            {['Activity Signals', 'Proof Layer', 'External Validation', 'Narrative Strength'].map((label, index) => (
              <SignalCard key={label} label={label} delay={index * 0.12} />
            ))}
          </div>
        </div>
      </SectionShell>

      <SectionShell
        id="features"
        eyebrow="Make proof visible"
        title={<>Activities stop being a list. They become <span className="gradient-text">signals</span>.</>}
        copy="Spikd shows which activities strengthen your spike and which ones need more evidence."
      >
        <div className="relative mt-14">
          <BrowserFrame src="/spikd-activities-showcase.png" alt="Spikd activities page showing activity cards." className="lg:w-[86%]" />
          <motion.div
            initial={{ opacity: 0, y: 34, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ y: [0, -10, 0] }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: easeOut, y: { duration: 5, repeat: Infinity, ease: 'easeInOut' } }}
            className="glass-card absolute right-2 top-10 hidden w-72 p-5 lg:block"
          >
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#999999]">User Activity</p>
            <h3 className="mt-4 text-xl font-bold tracking-[-0.04em] text-black">Founder & Lead Developer</h3>
            <div className="mt-5 grid gap-3 text-sm font-semibold text-[#555555]">
              <p>Signal Strength: <span className="text-black">High</span></p>
              <p>Narrative Impact: <span className="text-black">Strong</span></p>
              <p>Proof Layer: <span className="gradient-text">Verified</span></p>
            </div>
          </motion.div>
        </div>
      </SectionShell>

      <SectionShell
        id="how-it-works"
        eyebrow="Know the next move"
        title={<>Stop guessing what to do <span className="gradient-text">next</span>.</>}
        copy="The roadmap turns narrative gaps into concrete actions that create proof, not generic advice."
      >
        <div className="mt-14 grid items-center gap-10 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="rounded-[28px] border border-[#eaeaea] bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.06)]">
            {[1, 2, 3, 4].map((step) => (
              <RoadmapStep
                key={step}
                index={step}
                title={['Publish a public impact report', 'Collect founder testimonials', 'Create a traction dashboard', 'Submit proof to a competition'][step - 1]}
                delay={step * 0.14}
              />
            ))}
          </div>
          <BrowserFrame src="/spikd-roadmap-showcase.png" alt="Spikd roadmap page showing scores, missing signals, and roadmap actions." />
        </div>
      </SectionShell>

      <SectionShell
        eyebrow="Benchmark the gap"
        title={<>See how stronger stories are <span className="gradient-text">constructed</span>.</>}
        copy="Peer Benchmarks compare your narrative signals with admitted profiles so you understand what changed the story."
      >
        <div className="mt-14 grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div
            initial={{ opacity: 0, x: -36 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75, ease: easeOut }}
            className="glass-card p-7"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-[22px] border border-[#eaeaea] bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#999999]">Your Profile</p>
                <p className="mt-4 text-6xl font-bold tracking-[-0.08em] text-black">81</p>
              </div>
              <div className="rounded-[22px] border border-[#eaeaea] bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#999999]">Admitted Student</p>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.45 }}
                  className="mt-4 text-6xl font-bold tracking-[-0.08em] text-black"
                >
                  90
                </motion.p>
              </div>
            </div>
            <motion.div
              initial={{ width: '0%' }}
              whileInView={{ width: '100%' }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.35, ease: easeOut }}
              className="mt-6 h-2 rounded-full bg-[linear-gradient(90deg,#667eea,#f64f59,#12c2e9)]"
            />
            <div className="mt-6 rounded-[20px] border border-[#eaeaea] bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#999999]">Gap Closed</p>
              <p className="mt-3 text-xl font-bold text-black">External Validation</p>
            </div>
          </motion.div>
          <BrowserFrame src="/spikd-benchmarks-showcase.png" alt="Spikd peer benchmark page showing best match and similarity score." />
        </div>
      </SectionShell>

      <section className="relative z-10 overflow-hidden px-5 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#999999]">Trust</p>
            <h2 className="mt-5 font-sans text-4xl font-bold leading-tight tracking-[-0.07em] text-black sm:text-6xl">
              Students remember clarity.
            </h2>
          </div>
          <div className="mt-12">
            <TestimonialMarquee />
            <TestimonialMarquee reverse />
          </div>
        </div>
      </section>

      <section id="pro" className="relative z-10 px-5 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#999999]">Pricing</p>
            <h2 className="mt-5 font-sans text-4xl font-bold leading-tight tracking-[-0.07em] text-black sm:text-6xl">
              Start free. Build the prescription when you are ready.
            </h2>
          </div>
          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            <PricingCard
              name="Free"
              price="$0"
              copy="Diagnosis for your current story."
              features={['Profile and activities', 'Narrative analysis', 'Two lifetime analyses', 'Saved dashboard']}
            />
            <PricingCard
              name="Pro"
              price={PRO_PRICE_LABEL}
              copy="Prescription for building proof."
              features={['Unlimited analyses', 'Narrative Roadmap', 'Peer Benchmarks', 'Proof Score execution']}
              pro
            />
          </div>
        </div>
      </section>

      <section className="relative z-10 overflow-hidden px-5 py-28 text-center sm:px-8 sm:py-36">
        <div className="landing-floating-diamond" />
        <div className="relative mx-auto max-w-5xl">
          <Sparkles className="mx-auto h-7 w-7 text-black" />
          <h2 className="mt-7 font-sans text-5xl font-bold leading-[0.98] tracking-[-0.08em] text-black sm:text-7xl">
            Your activities already exist.
            <br />
            The question is whether anyone can understand what they mean.
          </h2>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-[#555555]">
            Spikd turns disconnected accomplishments into a story backed by proof.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/login" className="inline-flex h-12 items-center justify-center rounded-full bg-black px-6 text-sm font-bold text-white transition duration-200 hover:-translate-y-0.5">
              Start Free
            </Link>
            <Link href="#product-preview" className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#eaeaea] bg-white px-6 text-sm font-bold text-black transition duration-200 hover:-translate-y-0.5">
              See How It Works <ChevronDown className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
