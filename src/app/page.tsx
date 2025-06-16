import Image from "next/image";
import styles from "./page.module.css";
import LiquidBackground from "@/components/ui/LiquidBackground";


export default function Home() {
  return (
    <main>
      <LiquidBackground />
      <div className={styles.NavBar}>
        <div className={styles.NavBarTextContainer}>
          <p className={styles.NavBarText}>Find your reports | Stake for insights</p>
        </div>
        <div className={styles.NavBarButtonContainer}>
          <button className={styles.NavBarButton}>Launch App</button>
        </div>
      </div>
    </main>
  );
}
