import Link from 'next/link';

type LogoTone = 'light' | 'dark';

export function SpikeballIcon({
  className = 'h-7 w-7',
  tone = 'light',
}: {
  className?: string;
  tone?: LogoTone;
}) {
  return (
    <span
      className={`relative inline-flex shrink-0 overflow-hidden ${tone === 'dark' ? 'rounded-lg bg-white' : ''} ${className}`}
      aria-hidden="true"
    >
      <img
        src="/spikd-logo.png"
        alt=""
        className={`h-full w-full scale-[1.72] object-cover ${tone === 'light' ? 'mix-blend-multiply' : ''}`}
      />
    </span>
  );
}

export default function SpikdLogo({
  href,
  className = '',
  tone = 'light',
}: {
  href?: string;
  className?: string;
  tone?: LogoTone;
}) {
  const content = (
    <span
      className={`inline-flex items-center gap-2.5 font-semibold tracking-[-0.04em] ${tone === 'dark' ? 'text-zinc-50' : 'text-black'} ${className}`}
      style={{ fontFamily: 'Satoshi, Inter, sans-serif' }}
    >
      <SpikeballIcon className="h-8 w-8" tone={tone} />
      <span className="leading-none">Spikd</span>
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex">
        {content}
      </Link>
    );
  }

  return content;
}
