'use client'

import { SolanaWalletProvider } from "./providers/WalletProvider";
import { WalletErrorBoundary } from "../components/ErrorBoundary";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WalletErrorBoundary>
      <SolanaWalletProvider>
        {children}
      </SolanaWalletProvider>
    </WalletErrorBoundary>
  );
} 