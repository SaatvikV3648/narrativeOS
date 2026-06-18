type PremiumHeroBackgroundProps = {
  className?: string;
};

export function PremiumHeroBackground({ className }: PremiumHeroBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={[
        'pointer-events-none absolute inset-0 z-0 overflow-hidden',
        className,
      ].filter(Boolean).join(' ')}
    >
      <div className="hero-depth-gradient absolute inset-0" />
      <div className="hero-grid-overlay absolute inset-0" />
      <div className="hero-noise-overlay absolute inset-0" />
      <div className="hero-headline-glow hero-headline-glow-left" />
      <div className="hero-headline-glow hero-headline-glow-right" />
      <div className="hero-drift-field hero-drift-field-one" />
      <div className="hero-drift-field hero-drift-field-two" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-white" />
    </div>
  );
}
