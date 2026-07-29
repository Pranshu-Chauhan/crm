import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '../providers/query-provider';

export const metadata: Metadata = {
  title: 'Skyline CRM - Real Estate Management Platform',
  description:
    'Professional real estate CRM for managing leads, contacts, properties, and deals. Built for high-performing sales teams.',
  keywords: 'real estate CRM, lead management, property sales, deal pipeline',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
