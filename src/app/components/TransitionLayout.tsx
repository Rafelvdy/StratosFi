'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, ReactNode } from 'react'

interface TransitionLayoutProps {
  children: ReactNode
  nextPage: ReactNode
  isTransitioning: boolean
  onTransitionComplete: () => void
}

export const TransitionLayout = ({
  children,
  nextPage,
  isTransitioning,
  onTransitionComplete,
}: TransitionLayoutProps) => {
  const [animationPhase, setAnimationPhase] = useState<'initial' | 'extend' | 'swap' | 'retract'>('initial')
  const [showNextPage, setShowNextPage] = useState(false)

  useEffect(() => {
    if (!isTransitioning) {
      setAnimationPhase('initial')
      setShowNextPage(false)
      return
    }

    // Phase 1: Extend bars
    setAnimationPhase('extend')

    // Phase 2: Swap pages
    const swapTimer = setTimeout(() => {
      setAnimationPhase('swap')
      setShowNextPage(true)
    }, 700) // 500ms extension + 200ms buffer

    // Phase 3: Retract bars
    const retractTimer = setTimeout(() => {
      setAnimationPhase('retract')
    }, 900) // 700ms + 200ms swap duration

    // Complete transition
    const completeTimer = setTimeout(() => {
      onTransitionComplete()
    }, 1400) // 900ms + 500ms retraction

    return () => {
      clearTimeout(swapTimer)
      clearTimeout(retractTimer)
      clearTimeout(completeTimer)
    }
  }, [isTransitioning, onTransitionComplete])

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
        delay: (2 - custom) * 0.1,
        ease: [0.645, 0.045, 0.355, 1.000],
      },
    }),
  }

  const pageVariants = {
    initial: { opacity: 1 },
    fadeOut: { opacity: 0 },
    fadeIn: { opacity: 1 },
  }

  const bars = [
    { color: '#2EFFD4', height: '40vh', zIndex: 53 },
    { color: '#4D7EFF', height: '75vh', zIndex: 52 },
    { color: '#6C3CE9', height: '100vh', zIndex: 51 },
  ]

  return (
    <div className="relative w-full h-full">
      {/* Current Page */}
      <motion.div
        className="absolute inset-0 z-40"
        variants={pageVariants}
        initial="initial"
        animate={showNextPage ? 'fadeOut' : 'initial'}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>

      {/* Next Page */}
      <motion.div
        className="absolute inset-0 z-30"
        variants={pageVariants}
        initial="fadeOut"
        animate={showNextPage ? 'fadeIn' : 'fadeOut'}
        transition={{ duration: 0.2 }}
      >
        {nextPage}
      </motion.div>

      {/* Transition Bars */}
      <AnimatePresence>
        {isTransitioning && (
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
                  marginBottom: index > 0 ? '2px' : 0,
                  transformOrigin: 'bottom',
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
} 