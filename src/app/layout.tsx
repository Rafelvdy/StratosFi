import "./globals.css";
import '@solana/wallet-adapter-react-ui/styles.css'
import { Space_Grotesk } from 'next/font/google'
import type { Metadata } from 'next'
import ClientLayout from './ClientLayout'

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'StratosFi | Rise Above Market Noise',
  description: 'Modern Web3 platform for crypto news sentiment analysis and automated trading',
  icons: {
    icon: '/logos/favicon.ico', // Make sure you have this favicon in your public folder
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={spaceGrotesk.className}>
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
