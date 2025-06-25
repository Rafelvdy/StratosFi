'use client';
import styles from './page.module.css';
import Image from 'next/image';
import { useState } from 'react';

export default function Dashboard() {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isWalletConnectOpen, setIsWalletConnectOpen] = useState(false);

    const handleProfileClick = () => {
        setIsProfileOpen((prev) => !prev);
    };

    return (

        <main>
            <div className={styles.DashboardContainer}>
                <div className={styles.ProfileContainer}>
                    <div className={styles.WalletConnectContainer}
                        style={{
                            width: isProfileOpen ? '0px' : '200px',
                            height: isProfileOpen ? '0px' : '50px',
                            transition: 'all 0.3s ease-in-out',
                            overflow: 'hidden',
                        }}
                    >
                        <div className={styles.WalletConnectIndicator} style={{
                            opacity: isProfileOpen ? 0 : 0.8,
                            transition: 'opacity 0.2s ease-in-out',
                            background: isWalletConnectOpen ? 'green' : 'red',
                            boxShadow: isWalletConnectOpen ? '0 0 10px 0 rgba(17, 142, 40, 0.816)' : '0 0 10px 0 rgba(167, 19, 19, 0.816)',
                        }}></div>
                        <div className={styles.WalletConnectText}
                            style={{
                                opacity: isProfileOpen ? 0 : 1,
                                transition: 'opacity 0.2s ease-in-out',
                            }}
                        >{isWalletConnectOpen ? 'Connected' : 'Connect Wallet'}</div>
                    </div>
                    <div className={styles.Profile}>
                        <Image src="/icons/pfp-icon.webp" alt="Profile" width={90} height={90} objectFit='contain' className={styles.ProfileImage} onClick={handleProfileClick} />
                    </div>
                </div>
            </div>
        </main>
    );
}