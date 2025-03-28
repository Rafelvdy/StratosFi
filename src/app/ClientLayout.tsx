'use client'

import { SolanaWalletProvider } from "./providers/WalletProvider";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SolanaWalletProvider>
      {children}
    </SolanaWalletProvider>
  );
} 