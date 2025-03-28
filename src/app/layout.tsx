'use client'

import "./globals.css";
import { Space_Grotesk } from 'next/font/google'
import { usePathname } from 'next/navigation'
import { SolanaWalletProvider } from "./providers/WalletProvider";

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isHomePage = usePathname() === '/';

  return (
    <html lang="en" className={spaceGrotesk.className}>
      <body>
        <SolanaWalletProvider>
          {children}
        </SolanaWalletProvider>
        {isHomePage && (
          <div className="fixed bottom-4 left-4">
            <a
              href="https://github.com/stratosfi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/50 hover:text-white transition-colors"
            >
              GitHub
            </a>
          </div>
        )}
      </body>
    </html>
  );
}
