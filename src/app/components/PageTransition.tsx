'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

interface PageTransitionProps {
  onTransitionComplete: () => void
}

export const PageTransition = ({ onTransitionComplete }: PageTransitionProps) => {
  const [animationPhase, setAnimationPhase] = useState<'extend' | 'hold' | 'retract'>('extend')

  useEffect(() => {
    if (animationPhase === 'extend') {
      // After extension, move to hold phase
      const holdTimer = setTimeout(() => {
        setAnimationPhase('hold')
      }, 800) // 500ms for extension + 300ms buffer

      return () => clearTimeout(holdTimer)
    }

    if (animationPhase === 'hold') {
      // After hold, move to retraction phase
      const retractTimer = setTimeout(() => {
        setAnimationPhase('retract')
      }, 200) // Hold duration

      return () => clearTimeout(retractTimer)
    }

    if (animationPhase === 'retract') {
      // After retraction completes (handled by AnimatePresence)
      const completeTimer = setTimeout(() => {
        onTransitionComplete()
      }, 800) // 500ms for retraction + 300ms buffer

      return () => clearTimeout(completeTimer)
    }
  }, [animationPhase, onTransitionComplete])

  const barVariants = {
    initial: {
      y: '100vh',
    },
    extend: (custom: number) => ({
      y: 0,
      transition: {
        duration: 0.5,
        delay: custom * 0.1,
        ease: [0.645, 0.045, 0.355, 1.000],
      },
    }),
    retract: (custom: number) => ({
      y: '-100vh',
      transition: {
        duration: 0.5,
        delay: (2 - custom) * 0.1, // Reverse order for retraction
        ease: [0.645, 0.045, 0.355, 1.000],
      },
    }),
  }

  const bars = [
    { color: '#2EFFD4', height: '33vh', zIndex: 53 },  // Teal - highest
    { color: '#4D7EFF', height: '66vh', zIndex: 52 },  // Blue - middle
    { color: '#6C3CE9', height: '90vh', zIndex: 51 },  // Purple - lowest
  ]

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
        {bars.map((bar, index) => (
          <motion.div
            key={index}
            custom={index}
            variants={barVariants}
            initial="initial"
            animate={animationPhase === 'retract' ? 'retract' : 'extend'}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: bar.color,
              height: bar.height,
              zIndex: bar.zIndex,
              marginBottom: index > 0 ? '2px' : 0, // Add gap between bars
              transformOrigin: 'bottom',
            }}
          />
        ))}
      </div>
    </AnimatePresence>
  )
} 