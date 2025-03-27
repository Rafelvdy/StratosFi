'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface PageTransitionProps {
  onTransitionComplete: () => void
}

export const PageTransition = ({ onTransitionComplete }: PageTransitionProps) => {
  const [isAnimating, setIsAnimating] = useState(true)

  const barVariants = {
    initial: (custom: number) => ({
      y: '100vh',
      height: `${custom * 30}vh`,
    }),
    animate: (custom: number) => ({
      y: 0,
      transition: {
        duration: 0.5,
        delay: custom * 0.1,
        ease: [0.645, 0.045, 0.355, 1.000], // Cubic bezier for smooth animation
      },
    }),
    exit: (custom: number) => ({
      y: '-100vh',
      transition: {
        duration: 0.5,
        delay: (2 - custom) * 0.1,
        ease: [0.645, 0.045, 0.355, 1.000],
      },
    }),
  }

  const bars = [
    { color: '#2EFFD4', height: 1 },
    { color: '#4D7EFF', height: 2 },
    { color: '#6C3CE9', height: 3 },
  ]

  return (
    <AnimatePresence
      onExitComplete={() => {
        setIsAnimating(false)
        onTransitionComplete()
      }}
    >
      {isAnimating && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          {bars.map((bar, index) => (
            <motion.div
              key={index}
              custom={bar.height}
              variants={barVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: bar.color,
                height: `${bar.height * 30}vh`,
                transformOrigin: 'bottom',
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  )
} 