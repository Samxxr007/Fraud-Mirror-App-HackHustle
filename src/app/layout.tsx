import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Fraud Mirror — Return & Refund Fraud Detection',
  description:
    'Fraud Mirror detects return fraud in real time while preserving dignity for legitimate customers — showing the reason to both sides simultaneously.',
  keywords: ['fraud detection', 'return fraud', 'refund fraud', 'retail', 'AI'],
};

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/submit', label: 'Submit Claim' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/economics', label: 'ROI' },
  { href: '/network', label: 'Network' },
  { href: '/simulate', label: 'Simulator' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <nav className="nav-bar">
          <Link href="/" className="nav-logo">
            <span className="logo-icon">🪞</span>
            <span>Fraud Mirror</span>
          </Link>
          <div className="nav-links">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="nav-link">
                {l.label}
              </Link>
            ))}
          </div>
          <Link href="/submit" className="nav-cta">
            Submit Claim →
          </Link>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
