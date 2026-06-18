export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
};

export default function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-zinc-500 disabled:cursor-not-allowed disabled:opacity-55';

  const variantStyles = {
    primary: 'bg-zinc-50 text-zinc-950 hover:-translate-y-0.5 hover:bg-white active:scale-[0.98]',
    secondary: 'border border-zinc-700 bg-transparent text-zinc-100 hover:-translate-y-0.5 hover:border-zinc-500 hover:bg-zinc-900',
    ghost: 'text-zinc-400 hover:text-zinc-50',
  };

  const classNames = `${baseStyles} ${variantStyles[variant]} ${className}`.trim();

  return <button className={classNames} {...props} />;
}
