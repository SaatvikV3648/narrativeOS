export default function Input({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`spikd-liquid-input ${className}`}
    />
  );
}
