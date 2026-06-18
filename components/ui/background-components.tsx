type LandingTopWashProps = {
  className?: string;
};

export function LandingTopWash({ className }: LandingTopWashProps) {
  return (
    <div
      aria-hidden="true"
      className={[
        'landing-top-wash pointer-events-none absolute inset-x-0 top-0 z-0 h-[300px] overflow-hidden sm:h-[420px]',
        className,
      ].filter(Boolean).join(' ')}
    />
  );
}
