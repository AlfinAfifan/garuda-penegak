import type { Metadata } from 'next';
import './globals.css';
import { TanstackProviders } from '@/providers/tanstack-providers';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Garuda Penegak',
  description: 'Platform Manajemen Anggota dan Kegiatan',
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <TanstackProviders>
            <Toaster position="top-center" reverseOrder={false} />
            {children}
        </TanstackProviders>
      </body>
    </html>
  );
}
