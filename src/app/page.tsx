"use client";
import styles from "./page.module.css";
import LiquidBackground from "@/components/ui/LiquidBackground";
import LaunchAppButton from "@/components/ui/button/LaunchApp";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

export default function Home() {
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    if (!titleRef.current || !subtitleRef.current || !logoRef.current) return;

    document.fonts.ready.then(() => {
      gsap.set(titleRef.current, { opacity: 1 });
      gsap.set(subtitleRef.current, { opacity: 1 });

      gsap.from(logoRef.current, {
        y: 50,
        opacity: 0,
        duration: 0.5,
        ease: "expo.out",
      });

      let splitTitle;
      SplitText.create(titleRef.current, {
        type: "words,lines",
        linesClass: "line",
        autoSplits: true,
        mask: "lines",
        onSplit: (self) => {
          splitTitle = gsap.from(self.lines, {
            duration: 0.5,
            yPercent: 100,
            opacity: 0,
            stagger: 0.1,
            ease: "expo.out",
          });
          return splitTitle;
        }
      });

      let splitSubtitle;
      SplitText.create(subtitleRef.current, {
        type: "words,lines",
        linesClass: "line",
        autoSplits: true,
        mask: "lines",
        onSplit: (self) => {
          splitSubtitle = gsap.from(self.lines, {
            duration: 0.5,
            yPercent: 100,
            opacity: 0,
            stagger: 0.1,
            ease: "expo.out",
          });
          return splitSubtitle;
        }
      });
    });
  }, [titleRef, subtitleRef]);

  return (
    <main>
      <LiquidBackground />
      <div className={styles.NavBar}>
        <div className={styles.NavBarLogoContainer}>
          {/* <p className={styles.NavBarText}>Explore KOL reports | Stake for insights</p> */}
          <Image src="/logos/Stratos Bar logo (white).png" alt="Stratos Bar Logo" width={130} height={130} ref={logoRef} />
        </div>
        <div className={styles.NavBarButtonContainer}>
          <LaunchAppButton />
        </div>
      </div>

      <div className={styles.HeroContainer}>
        <div className={styles.HeroTitleContainer}>
          <h1 className={styles.HeroTitle} ref={titleRef}>Stake to explore Web3 with AI. Subscribe to uncover the voices that shape it.</h1>
          <p className={styles.HeroSubtitle} ref={subtitleRef}>Our AI reduces research time on X into just <b>one prompt</b>, and increases ease of education. Projects and blockchains can subscribe for performance-ranked KOL reports driven through weekly data.</p>
          <LaunchAppButton/>
        </div>
      </div>
    </main>
  );
}
