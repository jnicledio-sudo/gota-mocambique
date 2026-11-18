import type { Metadata } from 'next';
import './globals.css';
import { Suspense } from 'react';
import Navigation from '../components/Navigation';

export const metadata: Metadata = {
  title: 'Gota: Comunicação e Monitorização de Fugas de Água em Moçambique',
  description: 'Cada gota conta. Cada ocorrência importa. Plataforma para comunicar, localizar e acompanhar a reparação de fugas de água em zonas urbanas de Moçambique.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt" className="h-full">
      <body className="min-h-full flex flex-col bg-[#F5FAFC] text-[#243746] antialiased">
        <Suspense fallback={null}>
          <Navigation />
        </Suspense>
        <main className="flex-1 pb-20 md:pb-12">
          {children}
        </main>
      </body>
    </html>
  );
}
