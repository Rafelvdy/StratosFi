import Image from "next/image";
import styles from "./page.module.css";
import LiquidBackground from "@/components/ui/LiquidBackground";
import LaunchAppButton from "@/components/ui/button/LaunchApp";

export default function Home() {
  return (
    <main>
      <LiquidBackground />
      <div className={styles.NavBar}>
        <div className={styles.NavBarTextContainer}>
          <p className={styles.NavBarText}>Explore KOL reports | Stake for insights</p>
        </div>
        <div className={styles.NavBarButtonContainer}>
          <LaunchAppButton />
        </div>
      </div>

      <div className={styles.HeroContainer}>
        <div className={styles.LogoContainer}>
          <Image src="/logos/Stratos Bar logo (White).png" alt="Stratos Bar Logo" width={200} height={200} objectFit="contain" className={styles.Logo} />
          <p className={styles.LogoText}>Stratos scans the chatter. You stake for insights.</p>
        </div>

        <div className={styles.HeroDescriptionContainer}>
          <p className={styles.HeroDescription}>Our AI cuts through the noise - tracking sentiment, surfacing events, and scoring voices that matter - so you don't have to waste hours researching.
            Access clean, actionable reports built from thousands of tweets in seconds.
          </p>
          <LaunchAppButton />
        </div>
      </div>
    </main>
  );
}
