'use client';
import styles from './page.module.css';
import { useState, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import MessageBubble from '@/components/ui/graphics/MessageBubble';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { useRouter } from 'next/navigation';



gsap.registerPlugin(ScrollTrigger);

export default function Dashboard() {
    const router = useRouter();
    const { setVisible } = useWalletModal();
    const { connected, disconnect } = useWallet();
    //Internal state synced with actual wallet connection
    const [isWalletConnectOpen, setIsWalletConnectOpen] = useState(connected);

    const messageContainerRef = useRef<HTMLDivElement>(null);
    const messageBubbleRefs = useRef<HTMLDivElement[]>([]);

    useEffect(() => {
        setIsWalletConnectOpen(connected);
    }, [connected]);

    useEffect(() => {
        if (messageContainerRef.current && messageBubbleRefs.current.length > 0) {
            gsap.to(messageBubbleRefs.current, {
                opacity: 0,
                y: 30,
                scale: 0.9,
            });

            gsap.timeline({
                ScrollTrigger: {
                    trigger:messageContainerRef.current,
                    start: 'top 80%',
                    end: 'bottom 20%',
                    toggleActions: 'play none none reverse',
                }
            }).to(messageBubbleRefs.current, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.5,
                stagger: 0.2,
                ease: 'back.out(1.7)',
            });
        }

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);

    const addToRefs = (el: HTMLDivElement) => {
        if (el && !messageBubbleRefs.current.includes(el)) {
            messageBubbleRefs.current.push(el);
        }
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
            <div className={styles.CornerLogoContainer}>
                <Image src="/logos/Stratos circle logo.png" alt="Stratos Bar Logo" width={55} height={55} onClick={() => router.push('/')}/>
            </div>
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
                <div className={styles.MessageContainer} ref={messageContainerRef}>
                    <div ref={addToRefs} className={styles.MessageBubbleContainer}>
                    <MessageBubble background='sender'>I am Stratos, your AI X research and Web3 educator assistant.</MessageBubble>
                    </div>
                    <div ref={addToRefs} className={styles.MessageBubbleContainer}>
                    <MessageBubble background='receiver'>What is Solana like in the last hour?</MessageBubble>
                    </div>
                    <div ref={addToRefs} className={styles.MessageBubbleContainer}>
                    <MessageBubble background='sender'>Community Mood for SOL: <span style={{ color: 'rgb(80, 200, 120)' }}>3.8</span>/5</MessageBubble>
                    </div>
                    <div ref={addToRefs} className={styles.MessageBubbleContainer}>
                    <MessageBubble background='sender'><span style={{ fontWeight: 'bold' }}>Key Insights:</span>
                        <ul>
                            <li>- Potential accumulation of SOL at lower price levels may indicate long-term confidence in the asset</li>
                            <li>- Recent price action suggests a potential bullish trend, with a 1.5% increase in the last hour</li>
                        </ul>
                        <span style={{ fontWeight: 'bold', cursor: 'pointer' }}>Show More</span>
                    </MessageBubble>
                    </div>
                    <div ref={addToRefs} className={styles.MessageBubbleContainer}>
                    <MessageBubble background='sender'><span style={{ fontWeight: 'bold' }}>Key Events:</span>
                        <ul>
                            <li>- Binance increasing their SOL holdings</li>
                            <li>- PayPal supercharges crypto oferring with Solana integration</li>
                        </ul>
                        <span style={{ fontWeight: 'bold', cursor: 'pointer' }}>Show More</span>
                    </MessageBubble>
                    </div>
                </div>
            </div>
        </main>
    );
}