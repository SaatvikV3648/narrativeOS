import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Spikd',
  description: 'Build evidence, reputation, proof, and narrative credibility.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
