// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

// Wagmi / RainbowKit imports
import { Providers } from './providers'; // Importando o componente Providers
import '@rainbow-me/rainbowkit/styles.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BabyCoin DApp',
  description: 'Your decentralized BabyCoin application',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Aqui é onde o componente Providers é usado */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}