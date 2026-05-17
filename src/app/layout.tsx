import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | GSTP Enterprise',
    default: 'Goal Setting & Tracking Portal',
  },
  description: 'Enterprise-grade performance management and goal tracking platform.',
  keywords: ['goal tracking', 'performance management', 'OKR', 'enterprise HR'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
