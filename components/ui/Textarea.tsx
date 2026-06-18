export default function Textarea({ className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`spikd-liquid-input min-h-[120px] resize-y py-3 ${className}`}
    />
  );
}
