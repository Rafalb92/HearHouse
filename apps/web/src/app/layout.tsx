import type { Metadata } from 'next';
import { Anta } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';
import { AuthProvider } from '@/providers/auth-provider';
import { QueryProviders } from '@/providers/query-provider';

const anta = Anta({
  variable: '--font-anta',
  weight: ['400'],
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'HearHaus | Headphone Store — over-ear, in-ear, canal',
  description:
    'Choose headphones tailored to you: active noise cancellation, Bluetooth codecs, microphones, battery life, and color options. Fast shipping and reliable returns.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={`${anta.variable} antialiased relative size-full`}>
        <QueryProviders>
          <AuthProvider>{children}</AuthProvider>
        </QueryProviders>
        <Toaster />
      </body>
    </html>
  );
}
