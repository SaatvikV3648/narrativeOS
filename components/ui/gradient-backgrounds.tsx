type GradientBackgroundProps = {
  className?: string;
};

export function GradientBackground({ className }: GradientBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={[
        'pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]',
        className,
      ].filter(Boolean).join(' ')}
    >
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background: 'radial-gradient(125% 125% at 50% 10%, #fff 40%, #6366f1 100%)',
        }}
      />
      <div className="absolute inset-0 bg-white/45" />
    </div>
  );
}
