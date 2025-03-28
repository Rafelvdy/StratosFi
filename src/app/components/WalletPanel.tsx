import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface WalletPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletPanel({ isOpen, onClose }: WalletPanelProps) {
  const { connected, publicKey } = useWallet();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
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
                  {connected ? (
                    <div className="text-green-400">
                      Connected: {publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)}
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