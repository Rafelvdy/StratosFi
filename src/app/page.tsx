import styles from "./page.module.css";
import LiquidBackground from "@/components/ui/LiquidBackground";
import LaunchAppButton from "@/components/ui/button/LaunchApp";
import Image from "next/image";



export default function Home() {
  return (
    <main>
      <LiquidBackground />
      <div className={styles.NavBar}>
        <div className={styles.NavBarLogoContainer}>
          {/* <p className={styles.NavBarText}>Explore KOL reports | Stake for insights</p> */}
          <Image src="/logos/Stratos Bar logo (white).png" alt="Stratos Bar Logo" width={130} height={130} />
        </div>
        <div className={styles.NavBarButtonContainer}>
          <LaunchAppButton />
        </div>
      </div>

      <div className={styles.HeroContainer}>
        <div className={styles.HeroTitleContainer}>
          <h1 className={styles.HeroTitle}>Stake to explore Web3 with AI. Subscribe to uncover the voices that shape it.</h1>
          <p className={styles.HeroSubtitle}>Stake Solana for access to our AI powered tool. </p>
        </div>
      </div>
    </main>
  );
}
