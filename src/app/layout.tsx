import "./globals.css";
import Image from "next/image";
import { Space_Grotesk } from 'next/font/google'

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  display: 'swap',
})

export const metadata = {
  title: "StratosFi | Rise Above Market Noise!",
  description: "Rise Above Market Noise!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={spaceGrotesk.className}>
      <body>
        {children}
        <div className="fixed bottom-4 left-4">
          <Image
            src="/logos/Stratos Circle logo.png"
            alt="Circle Logo"
            width={128}
            height={128}
          />
        </div>
      </body>
    </html>
  );
}
