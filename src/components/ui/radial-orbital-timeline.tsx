"use client";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, Link, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

interface TimelineItem {
  id: number;
  title: string;
  date: string;
  content: string;
  category: string;
  icon: React.ElementType;
  relatedIds: number[];
  status: "completed" | "in-progress" | "pending";
  energy: number;
  customCard?: {
    content: React.ReactNode;
    width?: string;
    className?: string;
    useDefaultStyles?: boolean;
  };
}

interface RadialOrbitalTimelineProps {
  timelineData: TimelineItem[];
}

// Responsive breakpoint hook
const useResponsiveBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [screenSize, setScreenSize] = useState({ width: 1024, height: 768 });

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setScreenSize({ width, height });
      
      if (width < 768) {
        setBreakpoint('mobile');
      } else if (width < 1024) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('desktop');
      }
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return { breakpoint, screenSize };
};

// Responsive sizing calculations
const getResponsiveSizes = (breakpoint: string, screenSize: { width: number; height: number }) => {
  const baseRadius = Math.min(screenSize.width, screenSize.height) * 0.25; // 25% of smallest dimension
  
  switch (breakpoint) {
    case 'mobile':
      const mobileRadius = Math.max(120, Math.min(180, baseRadius));
      return {
        orbitalRadius: mobileRadius,
        logoContainer: 'w-24 h-24', // Increased from w-20 h-20 (96px)
        logoSize: 'w-20 h-20', // Increased from w-16 h-16 (80px) 
        animationRing1: 'w-28 h-28', // Increased proportionally (112px)
        animationRing2: 'w-32 h-32', // Increased proportionally (128px)
        orbitalRing: `w-[${mobileRadius * 2}px] h-[${mobileRadius * 2}px]`,
        nodeSize: 'w-8 h-8', // 32px
        cardWidth: 'w-72', // 288px
        cardTop: 'top-20', // 80px
        maxContainer: 'max-w-none',
        padding: 'p-6',
        cardPadding: 'p-5',
        spacing: 'space-y-6'
      };
    case 'tablet':
      const tabletRadius = Math.max(160, Math.min(220, baseRadius));
      return {
        orbitalRadius: tabletRadius,
        logoContainer: 'w-32 h-32', // Increased from w-28 h-28 (128px)
        logoSize: 'w-28 h-28', // Increased from w-24 h-24 (112px)
        animationRing1: 'w-36 h-36', // Increased proportionally (144px)
        animationRing2: 'w-40 h-40', // Increased proportionally (160px)
        orbitalRing: `w-[${tabletRadius * 2}px] h-[${tabletRadius * 2}px]`,
        nodeSize: 'w-9 h-9', // 36px
        cardWidth: 'w-80', // 320px
        cardTop: 'top-24', // 96px
        maxContainer: 'max-w-5xl',
        padding: 'p-8',
        cardPadding: 'p-6',
        spacing: 'space-y-8'
      };
    default: // desktop
      const desktopRadius = Math.max(200, Math.min(280, baseRadius));
      return {
        orbitalRadius: desktopRadius,
        logoContainer: 'w-40 h-40', // Increased from w-36 h-36 (160px) - much larger!
        logoSize: 'w-36 h-36', // Increased from w-32 h-32 (144px) - substantial increase
        animationRing1: 'w-44 h-44', // Increased proportionally (176px)
        animationRing2: 'w-48 h-48', // Increased proportionally (192px)
        orbitalRing: `w-[${desktopRadius * 2}px] h-[${desktopRadius * 2}px]`,
        nodeSize: 'w-10 h-10', // 40px
        cardWidth: 'w-80', // 320px
        cardTop: 'top-28', // 112px
        maxContainer: 'max-w-6xl',
        padding: 'p-10',
        cardPadding: 'p-6',
        spacing: 'space-y-10'
      };
  }
};

// Default card content component for backward compatibility
const DefaultCardContent = ({ item, getStatusStyles, timelineData, toggleItem }: {
  item: TimelineItem;
  getStatusStyles: (status: TimelineItem["status"]) => string;
  timelineData: TimelineItem[];
  toggleItem: (id: number) => void;
}) => (
  <>
    <CardHeader className="pb-2">
      <div className="flex justify-between items-center">
        <Badge
          className={`px-2 text-xs ${getStatusStyles(item.status)}`}
        >
          {item.status === "completed"
            ? "COMPLETE"
            : item.status === "in-progress"
            ? "IN PROGRESS"
            : "PENDING"}
        </Badge>
        <span className="text-xs font-mono text-white/50">
          {item.date}
        </span>
      </div>
      <CardTitle className="text-sm mt-2">
        {item.title}
      </CardTitle>
    </CardHeader>
    <CardContent className="text-xs text-white/80">
      <p>{item.content}</p>

      <div className="mt-4 pt-3 border-t border-white/10">
        <div className="flex justify-between items-center text-xs mb-1">
          <span className="flex items-center">
            <Zap size={10} className="mr-1" />
            Energy Level
          </span>
          <span className="font-mono">{item.energy}%</span>
        </div>
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            style={{ width: `${item.energy}%` }}
          ></div>
        </div>
      </div>

      {item.relatedIds.length > 0 && (
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="flex items-center mb-2">
            <Link size={10} className="text-white/70 mr-1" />
            <h4 className="text-xs uppercase tracking-wider font-medium text-white/70">
              Connected Nodes
            </h4>
          </div>
          <div className="flex flex-wrap gap-1">
            {item.relatedIds.map((relatedId) => {
              const relatedItem = timelineData.find(
                (i) => i.id === relatedId
              );
              return (
                <Button
                  key={relatedId}
                  variant="outline"
                  size="sm"
                  className="flex items-center h-6 px-2 py-0 text-xs rounded-none border-white/20 bg-transparent hover:bg-white/10 text-white/80 hover:text-white transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleItem(relatedId);
                  }}
                >
                  {relatedItem?.title}
                  <ArrowRight
                    size={8}
                    className="ml-1 text-white/60"
                  />
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </CardContent>
  </>
);

// Helper functions for cleaner code
const getNodeStyles = (isExpanded: boolean, isRelated: boolean, breakpoint: string, responsiveSizes: any) => {
  const baseClasses = `${responsiveSizes.nodeSize} rounded-full flex items-center justify-center border-2 transition-all duration-300 transform`;
  const backgroundClasses = isExpanded ? "bg-white text-black" : isRelated ? "bg-white/50 text-black" : "bg-black text-white";
  const borderClasses = isExpanded ? "border-white shadow-lg shadow-white/30" : isRelated ? "border-white animate-pulse" : "border-white/40";
  const scaleClasses = isExpanded ? (breakpoint === 'mobile' ? "scale-125" : "scale-150") : "";
  const interactionClasses = breakpoint === 'mobile' ? 'touch-manipulation cursor-pointer hover:scale-110 active:scale-95' : 'cursor-pointer hover:scale-110';
  
  return `${baseClasses} ${backgroundClasses} ${borderClasses} ${scaleClasses} ${interactionClasses}`;
};

const getNodeLabelStyles = (isExpanded: boolean, breakpoint: string) => {
  const positionClasses = `absolute ${breakpoint === 'mobile' ? 'top-10' : 'top-12'} whitespace-nowrap`;
  const textClasses = `${breakpoint === 'mobile' ? 'text-xs' : 'text-xs'} font-semibold tracking-wider transition-all duration-300`;
  const colorClasses = isExpanded ? "text-white scale-125" : "text-white/70";
  const interactionClasses = breakpoint === 'mobile' ? 'pointer-events-none' : '';
  
  return `${positionClasses} ${textClasses} ${colorClasses} ${interactionClasses}`;
};

const getPulseEffectSize = (energy: number, breakpoint: string) => {
  const baseSize = breakpoint === 'mobile' ? 32 : 40;
  const calculatedSize = energy * 0.5 + baseSize;
  return {
    background: `radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)`,
    width: `${calculatedSize}px`,
    height: `${calculatedSize}px`,
    left: `-${(calculatedSize - baseSize) / 2}px`,
    top: `-${(calculatedSize - baseSize) / 2}px`,
  };
};

const getNodeLabelStyle = (breakpoint: string) => ({
  // Better text positioning on mobile
  left: '50%',
  transform: 'translateX(-50%)',
  textShadow: breakpoint === 'mobile' ? '1px 1px 2px rgba(0,0,0,0.8)' : 'none',
});

export default function RadialOrbitalTimeline({
  timelineData,
}: RadialOrbitalTimelineProps) {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>(
    {}
  );
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [pulseEffect, setPulseEffect] = useState<Record<number, boolean>>({});
  const [centerOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Use responsive breakpoint hook
  const { breakpoint, screenSize } = useResponsiveBreakpoint();
  const responsiveSizes = getResponsiveSizes(breakpoint, screenSize);

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
      setAutoRotate(true);
    }
  };

  const toggleItem = (id: number) => {
    setExpandedItems((prev) => {
      const newState = { ...prev };
      Object.keys(newState).forEach((key) => {
        if (parseInt(key) !== id) {
          newState[parseInt(key)] = false;
        }
      });

      newState[id] = !prev[id];

      if (!prev[id]) {
        setActiveNodeId(id);
        setAutoRotate(false);

        const relatedItems = getRelatedItems(id);
        const newPulseEffect: Record<number, boolean> = {};
        relatedItems.forEach((relId) => {
          newPulseEffect[relId] = true;
        });
        setPulseEffect(newPulseEffect);

        centerViewOnNode(id);
      } else {
        setActiveNodeId(null);
        setAutoRotate(true);
        setPulseEffect({});
      }

      return newState;
    });
  };

  useEffect(() => {
    let rotationTimer: NodeJS.Timeout;

    if (autoRotate) {
      rotationTimer = setInterval(() => {
        setRotationAngle((prev) => {
          const newAngle = (prev + 0.3) % 360;
          return Number(newAngle.toFixed(3));
        });
      }, 50);
    }

    return () => {
      if (rotationTimer) {
        clearInterval(rotationTimer);
      }
    };
  }, [autoRotate]);

  // Enhanced accessibility: keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setExpandedItems({});
        setActiveNodeId(null);
        setPulseEffect({});
        setAutoRotate(true);
      }
      
      if (event.key === 'Tab' && activeNodeId) {
        event.preventDefault();
        const currentIndex = timelineData.findIndex(item => item.id === activeNodeId);
        const nextIndex = (currentIndex + 1) % timelineData.length;
        toggleItem(timelineData[nextIndex].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeNodeId, timelineData, toggleItem]);

  const centerViewOnNode = (nodeId: number) => {
    if (!nodeRefs.current[nodeId]) return;

    const nodeIndex = timelineData.findIndex((item) => item.id === nodeId);
    const totalNodes = timelineData.length;
    const targetAngle = (nodeIndex / totalNodes) * 360;

    setRotationAngle(270 - targetAngle);
  };

  const calculateNodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radius = responsiveSizes.orbitalRadius; // Now responsive!
    const radian = (angle * Math.PI) / 180;

    const x = radius * Math.cos(radian) + centerOffset.x;
    const y = radius * Math.sin(radian) + centerOffset.y;

    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const opacity = Math.max(
      0.4,
      Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2))
    );

    return { x, y, angle, zIndex, opacity };
  };

  const getRelatedItems = (itemId: number): number[] => {
    const currentItem = timelineData.find((item) => item.id === itemId);
    return currentItem ? currentItem.relatedIds : [];
  };

  const isRelatedToActive = (itemId: number): boolean => {
    if (!activeNodeId) return false;
    const relatedItems = getRelatedItems(activeNodeId);
    return relatedItems.includes(itemId);
  };

  const getStatusStyles = (status: TimelineItem["status"]): string => {
    switch (status) {
      case "completed":
        return "text-white bg-black border-white";
      case "in-progress":
        return "text-black bg-white border-black";
      case "pending":
        return "text-white bg-black/40 border-white/50";
      default:
        return "text-white bg-black/40 border-white/50";
    }
  };

  return (
    <div
      className={`w-full h-screen flex flex-col items-center justify-center ${responsiveSizes.padding} overflow-hidden`}
      ref={containerRef}
      onClick={handleContainerClick}
    >
      <div className={`relative w-full ${responsiveSizes.maxContainer} h-full flex items-center justify-center overflow-hidden`}>
        <div
          className="absolute w-full h-full flex items-center justify-center"
          ref={orbitRef}
          style={{
            transform: `translate(${centerOffset.x}px, ${centerOffset.y}px)`,
            // Ensure content stays within bounds
            maxWidth: '100%',
            maxHeight: '100%',
          }}
        >
          {/* Responsive Center Logo with Animations */}
          <div className={`absolute ${responsiveSizes.logoContainer} flex items-center justify-center z-40`}>
            {/* Responsive animated border rings with enhanced animation */}
            <div className={`absolute ${responsiveSizes.animationRing1} rounded-full border border-white/20 animate-ping opacity-70 z-10`}
                 style={{ 
                   animationDuration: '2s',
                   animationTimingFunction: 'cubic-bezier(0.4, 0, 0.6, 1)' 
                 }}></div>
            <div
              className={`absolute ${responsiveSizes.animationRing2} rounded-full border border-white/10 animate-ping opacity-50 z-10`}
              style={{ 
                animationDelay: "0.5s",
                animationDuration: '2s',
                animationTimingFunction: 'cubic-bezier(0.4, 0, 0.6, 1)'
              }}
            ></div>
            {/* Responsive Stratos Logo with enhanced pulse */}
            <div className={`relative ${responsiveSizes.logoContainer} flex items-center justify-center z-20`}
                 style={{
                   animation: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                 }}>
              <Image
                src="/logos/Stratos Bar logo (white).png"
                alt="Stratos Logo"
                width={breakpoint === 'mobile' ? 80 : breakpoint === 'tablet' ? 112 : 144}
                height={breakpoint === 'mobile' ? 80 : breakpoint === 'tablet' ? 112 : 144}
                className="object-contain transition-all duration-500 ease-in-out"
                style={{ 
                  maxWidth: breakpoint === 'mobile' ? "85%" : "90%", 
                  maxHeight: breakpoint === 'mobile' ? "85%" : "90%"
                }}
                priority
              />
            </div>
          </div>

          {/* Responsive orbital ring - now perfectly aligned! */}
          <div 
            className="absolute rounded-full border border-white/10 z-5"
            style={{
              width: `${responsiveSizes.orbitalRadius * 2}px`,
              height: `${responsiveSizes.orbitalRadius * 2}px`
            }}
          ></div>

          {timelineData.map((item, index) => {
            const position = calculateNodePosition(index, timelineData.length);
            const isExpanded = expandedItems[item.id];
            const isRelated = isRelatedToActive(item.id);
            const isPulsing = pulseEffect[item.id];
            const Icon = item.icon;

            const nodeStyle = {
              transform: `translate(${position.x}px, ${position.y}px)`,
              zIndex: isExpanded ? 200 : position.zIndex,
              opacity: isExpanded ? 1 : position.opacity,
            };

            return (
              <div
                key={item.id}
                ref={(el) => {
                  if (el) {
                    nodeRefs.current[item.id] = el;
                  }
                }}
                className="absolute transition-all duration-700 cursor-pointer"
                style={nodeStyle}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(item.id);
                }}
                role="button"
                tabIndex={0}
                aria-label={`${item.title} - ${item.content}`}
                aria-expanded={isExpanded}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleItem(item.id);
                  }
                }}
              >
                <div
                  className={`absolute rounded-full -inset-1 transition-opacity duration-1000 ${
                    isPulsing ? "animate-pulse" : ""
                  }`}
                  style={getPulseEffectSize(item.energy, breakpoint)}
                ></div>

                <div
                  className={getNodeStyles(isExpanded, isRelated, breakpoint, responsiveSizes)}
                  style={{
                    // Improved touch targets for mobile
                    minWidth: breakpoint === 'mobile' ? '44px' : 'auto',
                    minHeight: breakpoint === 'mobile' ? '44px' : 'auto',
                  }}
                >
                  <Icon size={breakpoint === 'mobile' ? 14 : 16} />
                </div>

                <div
                  className={getNodeLabelStyles(isExpanded, breakpoint)}
                  style={getNodeLabelStyle(breakpoint)}
                >
                  {item.title}
                </div>

                {isExpanded && (
                  <Card 
                    className={
                      item.customCard?.useDefaultStyles === false
                        ? item.customCard?.className || `absolute ${responsiveSizes.cardTop} left-1/2 -translate-x-1/2`
                        : `absolute ${responsiveSizes.cardTop} left-1/2 -translate-x-1/2 ${item.customCard?.width || responsiveSizes.cardWidth} bg-black/90 backdrop-blur-lg border-white/30 shadow-xl shadow-white/10 ${item.customCard?.className || ""}`
                    }
                    style={{
                      marginTop: breakpoint === 'mobile' ? '1rem' : '1.5rem',
                      // Smart positioning to prevent viewport overflow
                      transform: `translateX(-50%) ${
                        // Adjust horizontal position if card would overflow
                        position.x > screenSize.width * 0.7 ? 'translateX(-25%)' :
                        position.x < screenSize.width * 0.3 ? 'translateX(-75%)' :
                        'translateX(-50%)'
                      }`,
                      // Ensure cards don't go off-screen vertically
                      maxHeight: breakpoint === 'mobile' 
                        ? 'calc(100vh - 200px)' 
                        : 'calc(100vh - 300px)',
                      overflowY: 'auto',
                      // Better mobile experience
                      ...(breakpoint === 'mobile' && {
                        width: 'calc(100vw - 2rem)',
                        maxWidth: '300px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                      })
                    }}
                    role="dialog"
                    aria-modal="true"
                  >
                    {/* Connection line to node */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-px h-3 bg-white/50"></div>
                    
                    {/* Render custom content if provided, otherwise use default */}
                    {item.customCard?.content ? (
                      item.customCard.content
                    ) : (
                      <DefaultCardContent 
                        item={item}
                        getStatusStyles={getStatusStyles}
                        timelineData={timelineData}
                        toggleItem={toggleItem}
                      />
                    )}
                  </Card>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}