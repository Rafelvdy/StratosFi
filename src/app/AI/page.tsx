'use client';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AI() {
    const router = useRouter();
    return (
        <main>
            <div className={styles.CornerLogoContainer}>
                <Image src="/logos/Stratos Circle logo.png" alt="Stratos Bar Logo" width={55} height={55} onClick={() => router.push('/')}/>
            </div>
        </main>
    )
}