'use client'

import { motion, AnimatePresence } from 'framer-motion';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
import { clearChatForWallet } from '../utils/walletStorage';

interface WalletPanelProps {
  isOpen: boolean;
  onCloseAction: () => void;
}

export function WalletPanel({ isOpen, onCloseAction }: WalletPanelProps) {
  const { connected, publicKey, disconnect } = useWallet();
  const [error, setError] = useState<string | null>(null);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Reset error when panel opens/closes
  useEffect(() => {
    setError(null);
  }, [isOpen]);

  const handleDisconnect = async () => {
    if (!publicKey) return;
    
    setIsDisconnecting(true);
    setError(null);
    
    try {
      // Clear stored chat data
      clearChatForWallet(publicKey.toBase58());
      // Disconnect wallet
      await disconnect();
    } catch (err) {
      console.error('Failed to disconnect:', err);
      setError('Failed to disconnect wallet. Please try again.');
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseAction}
          />
          <motion.div
            className="fixed right-6 top-24 bottom-6 w-96 rounded-2xl z-50 overflow-hidden"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            <div className="h-full bg-[#1A1A1A]/80 backdrop-blur-xl border border-[#2A2A2A] shadow-lg flex flex-col">
              <div className="p-6 border-b border-[#2A2A2A]">
                <h2 className="text-xl font-semibold text-white">Connect Wallet</h2>
              </div>
              <div className="flex-1 p-6">
                <div className="space-y-4">
                  {error && (
                    <div className="text-red-400 text-sm mb-4">
                      {error}
                    </div>
                  )}
                  {connected ? (
                    <div className="space-y-4">
                      <div className="text-green-400">
                        Connected: {publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)}
                      </div>
                      <button
                        onClick={handleDisconnect}
                        disabled={isDisconnecting}
                        className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 disabled:bg-red-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                      >
                        {isDisconnecting ? 'Disconnecting...' : 'Disconnect Wallet'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <WalletMultiButton className="!bg-[#6C3CE9] hover:!bg-[#8150FF] transition-colors" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 