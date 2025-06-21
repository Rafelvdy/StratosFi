'use client';
import styles from './page.module.css';
import Image from 'next/image';
import { useState } from 'react';

export default function Dashboard() {
    const [isProfileOpen, setIsProfileOpen] = useState(false);

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
                        <div className={styles.WalletConnectIndicator}></div>
                        <div className={styles.WalletConnectText}>Connect Wallet</div>
                    </div>
                    <div className={styles.Profile}>
                        <Image src="/icons/pfp-icon.webp" alt="Profile" width={90} height={90} objectFit='contain' className={styles.ProfileImage} onClick={handleProfileClick} />
                    </div>
                </div>
            </div>
        </main>
    );
}