'use client';
import styles from './page.module.css';
import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import MessageBubble from '@/components/ui/graphics/MessageBubble';

export default function Dashboard() {
    const { setVisible } = useWalletModal();

    const { connected, disconnect } = useWallet();

    //Internal state synced with actual wallet connection
    const [isWalletConnectOpen, setIsWalletConnectOpen] = useState(connected);

    useEffect(() => {
        setIsWalletConnectOpen(connected);
    }, [connected]);
    const handleWalletClick = async () => {
        try {
            if (connected) {
                await disconnect();
            } else {
                setVisible(true);
            }
        } catch (error) {
            console.error('Error connecting/disconnecting wallet:', error);
        }
    };

    return (
        <main>
            <div className={styles.DashboardContainer}>
                <div className={styles.WalletConnectContainer} onClick={handleWalletClick}>
                    <div className={styles.WalletConnectIndicator} style={{
                        transition: 'opacity 0.2s ease-in-out',
                        background: isWalletConnectOpen ? 'green' : 'red',
                        boxShadow: isWalletConnectOpen ? '0 0 10px 0 rgba(17, 142, 40, 0.816)' : '0 0 10px 0 rgba(167, 19, 19, 0.816)',
                    }}></div>
                    <div className={styles.WalletConnectTextContainer}>
                        <div className={styles.WalletConnectText}
                        >{isWalletConnectOpen ? 'Connected' : 'Connect Wallet'}</div>
                        <div className={styles.ConnectPrompt}>{isWalletConnectOpen ? 'Click Here to Disconnect' : 'Click Here to Connect'}</div>
                    </div>
                </div>
                {/* <MessageBubble background='sender'>Hello, how are you sdgafshSFhasfhasha?</MessageBubble>
                <MessageBubble background='receiver'>Hello, how are you sdgafshSFhasfhasha?</MessageBubble> */}
                <div className={styles.MessageContainer}>
                    <MessageBubble background='sender'>I am Stratos, your AI X research and Web3 educator assistant.</MessageBubble>
                    <MessageBubble background='receiver'>What is Solana like in the last hour?</MessageBubble>
                </div>
            </div>
        </main>
    );
}