'use client';
import styles from './page.module.css';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

export default function Dashboard() {
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const { setVisible } = useWalletModal();

    const { connected, disconnect } = useWallet();

    //Internal state synced with actual wallet connection
    const [isWalletConnectOpen, setIsWalletConnectOpen] = useState(connected);

    useEffect(() => {
        setIsWalletConnectOpen(connected);
    }, [connected]);

    const handleProfileClick = () => {
        setIsProfileOpen((prev) => !prev);
    };

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
                <div className={styles.ProfileContainer}>
                    <div className={styles.WalletConnectContainer}
                        style={{
                            width: isProfileOpen ? '200px' : '0px',
                            height: isProfileOpen ? '50px' : '0px',
                            transition: 'all 0.3s ease-in-out',
                            overflow: 'hidden',
                            visibility: isProfileOpen ? 'visible' : 'hidden',
                        }}
                        onClick={handleWalletClick}
                    >
                        <div className={styles.WalletConnectIndicator} style={{
                            opacity: isProfileOpen ? 0.8 : 0,
                            transition: 'opacity 0.2s ease-in-out',
                            background: isWalletConnectOpen ? 'green' : 'red',
                            boxShadow: isWalletConnectOpen ? '0 0 10px 0 rgba(17, 142, 40, 0.816)' : '0 0 10px 0 rgba(167, 19, 19, 0.816)',
                        }}></div>
                        <div className={styles.WalletConnectTextContainer}>
                            <div className={styles.WalletConnectText}
                                style={{
                                    opacity: isProfileOpen ? 1 : 0,
                                    transition: 'opacity 0.2s ease-in-out',
                                }}
                            >{isWalletConnectOpen ? 'Connected' : 'Connect Wallet'}</div>
                            <div className={styles.ConnectPrompt}>{isWalletConnectOpen ? 'Click Here to Disconnect' : 'Click Here to Connect'}</div>
                        </div>
                    </div>
                    <div className={styles.Profile}>
                        <Image src="/icons/pfp-icon.webp" alt="Profile" width={90} height={90} objectFit='contain' className={styles.ProfileImage} onClick={handleProfileClick} />
                    </div>
                </div>
            </div>
        </main>
    );
}