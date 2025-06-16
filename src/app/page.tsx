"use client"
import Image from "next/image";
import styles from "./page.module.css";
import LiquidBackground from "@/components/ui/LiquidBackground";
import LaunchAppButton from "@/components/ui/button/LaunchApp";
import { Calendar, Code, FileText, User, Clock, Target, Zap, MessageCircle, BarChart3, Coins, TrendingUp, Users } from "lucide-react";
import RadialOrbitalTimeLine from "@/components/ui/radial-orbital-timeline";
import { Badge } from "@/components/ui/badge";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// StratosFi Enhanced Timeline Data with 5 Feature Cards
const timelineData = [
  {
    id: 1,
    title: "Community",
    date: "Live Analysis",
    content: "AI-powered community sentiment analysis with real-time mood tracking.",
    category: "Sentiment",
    icon: MessageCircle,
    relatedIds: [4, 5],
    status: "completed" as const,
    energy: 95,
    customCard: {
      content: (
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Badge className="bg-green-500 text-white">LIVE</Badge>
            <span className="text-xs text-white/50">Real-time</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-4">Community Sentiment</h3>
          <div className="space-y-4">
            <p className="text-sm text-white/80">
              Our AI analyzes community conversations to generate mood insights that give you a pulse on market sentiment.
            </p>
            
            {/* Community Mood Visualization */}
            <div className="border-t border-white/20 pt-4">
              <h4 className="text-xs uppercase tracking-wider font-medium text-white/70 mb-3">
                Current Market Mood
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/80">1/5 Negative</span>
                  <span className="text-sm font-bold text-red-400">1/5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/80">3/5 Neutral</span>
                  <span className="text-sm font-bold text-orange-400">3/5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/80">5/5 Positive</span>
                  <span className="text-sm font-bold text-green-400">5/5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      width: "w-80",
    }
  },
  {
    id: 2,
    title: "Reports",
    date: "On-Demand",
    content: "Performance-based KOL analysis reports for communities, projects, and blockchains.",
    category: "Analytics",
    icon: BarChart3,
    relatedIds: [5],
    status: "completed" as const,
    energy: 88,
    customCard: {
      content: (
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Badge className="bg-blue-500 text-white">ACTIONABLE</Badge>
            <span className="text-xs text-white/50">On-Demand</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-4">KOL Analysis Reports</h3>
          <div className="space-y-4">
            <p className="text-sm text-white/80">
              Generate comprehensive performance-based analysis reports about key opinion leaders and their influence on your community or project.
            </p>
            
            
            
            <div className="bg-white/10 rounded p-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-white/70">Actionable Insights</span>
                <span className="text-white font-bold">Real-time</span>
              </div>
              <p className="text-xs text-white/60">Data-driven decisions for your ecosystem</p>
            </div>
          </div>
        </div>
      ),
      width: "w-80",
    }
  },
  {
    id: 3,
    title: "Staking",
    date: "Earn & Access",
    content: "Free AI access with earning opportunities through staking rewards.",
    category: "DeFi",
    icon: Coins,
    relatedIds: [1, 2],
    status: "completed" as const,
    energy: 92,
    customCard: {
      content: (
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Badge className="bg-yellow-500 text-black font-bold">EARN</Badge>
            <span className="text-xs text-white/50">Active</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-4">Stake for Insights</h3>
          <div className="space-y-4">
            <p className="text-sm text-white/80">
              <span className="font-bold text-green-400">Free AI access!</span> Earn interest while you stake for premium insights and enhanced features.
            </p>
            
            <div className="border-t border-white/20 pt-4">
              <h4 className="text-xs uppercase tracking-wider font-medium text-white/70 mb-3">
                Staking Benefits
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/80">AI Access</span>
                  <span className="text-sm font-bold text-green-400">FREE</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/80">Staking APY</span>
                  <span className="text-sm font-bold text-yellow-400">8.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/80">Premium Features</span>
                  <span className="text-sm font-bold text-blue-400">Unlocked</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-500/20 to-green-500/20 rounded p-3 border border-yellow-400/30">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">Earn While You Learn</span>
                <Coins size={16} className="text-yellow-400" />
              </div>
              <p className="text-xs text-white/70 mt-1">Passive income meets intelligent insights</p>
            </div>
          </div>
        </div>
      ),
      width: "w-80",
    }
  },
  {
    id: 4,
    title: "Insights & Events",
    date: "Custom Tracking",
    content: "AI aggregation of key insights and events from X for specified tickers and timeframes.",
    category: "Intelligence",
    icon: TrendingUp,
    relatedIds: [1],
    status: "completed" as const,
    energy: 90,
    customCard: {
      content: (
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Badge className="bg-purple-500 text-white">SMART</Badge>
            <span className="text-xs text-white/50">Custom</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-4">Smart Aggregation</h3>
          <div className="space-y-4">
            <p className="text-sm text-white/80">
              Our AI scans X (Twitter) to aggregate key insights and events for any ticker within your specified timeframe.
            </p>
            
            <div className="border-t border-white/20 pt-4">
              <h4 className="text-xs uppercase tracking-wider font-medium text-white/70 mb-3">
                Tracking Options
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 rounded p-2">
                  <div className="text-xs text-white/60">Timeframe</div>
                  <div className="text-sm font-bold text-white">1H - 30D</div>
                </div>
                <div className="bg-white/10 rounded p-2">
                  <div className="text-xs text-white/60">Ticker</div>
                  <div className="text-sm font-bold text-white">Any Token</div>
                </div>
                <div className="bg-white/10 rounded p-2">
                  <div className="text-xs text-white/60">Events</div>
                  <div className="text-sm font-bold text-white">Auto-Detect</div>
                </div>
                <div className="bg-white/10 rounded p-2">
                  <div className="text-xs text-white/60">Insights</div>
                  <div className="text-sm font-bold text-white">Curated</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white">Latest Alert</span>
                <TrendingUp size={14} className="text-purple-400" />
              </div>
              <p className="text-xs text-white/70">$ETH: Major partnership announcement detected</p>
              <span className="text-xs text-white/50">2 minutes ago</span>
            </div>
          </div>
        </div>
      ),
      width: "w-80",
    }
  },
  {
    id: 5,
    title: "KOLs",
    date: "Premium Treasury",
    content: "Curated treasury of analyzed tweets meeting KOL requirements - the real gold.",
    category: "Premium",
    icon: Users,
    relatedIds: [1, 2],
    status: "completed" as const,
    energy: 98,
    customCard: {
      content: (
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold">GOLD</Badge>
            <span className="text-xs text-white/50">Premium</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-4">KOL Treasury</h3>
          <div className="space-y-4">
            <p className="text-sm text-white/80">
              Every analyzed tweet that meets our rigorous KOL requirements is stored in our premium treasury. This is where you find <span className="font-bold text-yellow-400">the real gold</span>.
            </p>
            
            <div className="border-t border-white/20 pt-4">
              <h4 className="text-xs uppercase tracking-wider font-medium text-white/70 mb-3">
                Quality Filters
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/80">Follower Count</span>
                  <span className="text-sm font-bold text-white">10K+ Verified</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/80">Engagement Rate</span>
                  <span className="text-sm font-bold text-white">Top 5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/80">Content Quality</span>
                  <span className="text-sm font-bold text-white">AI Scored</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/80">Influence Score</span>
                  <span className="text-sm font-bold text-white">Premium Only</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded p-3 border border-yellow-400/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white">Treasury Stats</span>
                <Users size={14} className="text-yellow-400" />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-white/60">KOLs Tracked:</span>
                  <span className="text-white font-bold ml-1">2,847</span>
                </div>
                <div>
                  <span className="text-white/60">Gold Tweets:</span>
                  <span className="text-yellow-400 font-bold ml-1">48,392</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      width: "w-80",
    }
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
