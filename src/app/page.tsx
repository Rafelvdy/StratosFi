"use client"
import Image from "next/image";
import styles from "./page.module.css";
import LiquidBackground from "@/components/ui/LiquidBackground";
import LaunchAppButton from "@/components/ui/button/LaunchApp";
import { Calendar, Code, FileText, User, Clock } from "lucide-react";
import RadialOrbitalTimeLine from "@/components/ui/radial-orbital-timeline";

const timelineData = [
  {
    id: 1,
    title: "Planning",
    date: "Jan 2024",
    content: "Project planning and requirements gathering phase.",
    category: "Planning",
    icon: Calendar,
    relatedIds: [2],
    status: "completed" as const,
    energy: 100,
  },
  {
    id: 2,
    title: "Design",
    date: "Feb 2024",
    content: "UI/UX design and system architecture.",
    category: "Design",
    icon: FileText,
    relatedIds: [1, 3],
    status: "completed" as const,
    energy: 90,
  },
  {
    id: 3,
    title: "Development",
    date: "Mar 2024",
    content: "Core features implementation and testing.",
    category: "Development",
    icon: Code,
    relatedIds: [2, 4],
    status: "in-progress" as const,
    energy: 60,
  },
  {
    id: 4,
    title: "Testing",
    date: "Apr 2024",
    content: "User testing and bug fixes.",
    category: "Testing",
    icon: User,
    relatedIds: [3, 5],
    status: "pending" as const,
    energy: 30,
  },
  {
    id: 5,
    title: "Release",
    date: "May 2024",
    content: "Final deployment and release.",
    category: "Release",
    icon: Clock,
    relatedIds: [4],
    status: "pending" as const,
    energy: 10,
  },
];


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
        <RadialOrbitalTimeLine timelineData={timelineData} />
        {/* <div className={styles.LogoContainer}>
          <Image src="/logos/Stratos Bar logo (White).png" alt="Stratos Bar Logo" width={200} height={200} objectFit="contain" className={styles.Logo} />
          <p className={styles.LogoText}>Stratos scans the chatter. You stake for insights.</p>
        </div>

        <div className={styles.HeroDescriptionContainer}>
          <p className={styles.HeroDescription}>Our AI cuts through the noise - tracking sentiment, surfacing events, and scoring voices that matter - so you don't have to waste hours researching.
            Access clean, actionable reports built from thousands of tweets in seconds.
          </p>
          <LaunchAppButton />
        </div> */}
      </div>
    </main>
  );
}
