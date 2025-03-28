'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'

interface TradingBotPanelProps {
  isOpen: boolean
  onClose: () => void
}

export const TradingBotPanel = ({ isOpen, onClose }: TradingBotPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Handle click outside to close panel
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node) && isOpen) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  const toggleExpand = () => {
    setIsExpanded(prev => !prev)
  }

  const panelVariants = {
    hidden: { x: '100%', opacity: 0 },
    visible: { 
      x: '0%', 
      opacity: 1,
      width: '400px',
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 30,
        duration: 0.5
      }
    },
    expanded: {
      x: '0%',
      opacity: 1,
      width: 'calc(100vw - 385px)', // 304px (nav width + gap) + 24px right margin + 24px gap between panels
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        duration: 0.5
      }
    },
    exit: { 
      x: '100%', 
      opacity: 0,
      transition: { 
        duration: 0.3,
        ease: 'easeInOut'
      }
    }
  }

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 0.5, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.3 } }
  }

  const arrowVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      rotate: isExpanded ? 180 : 0,
      transition: { 
        delay: 0.3,
        type: 'spring',
        stiffness: 300,
        damping: 25
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black z-45 pointer-events-auto"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            className="fixed top-6 bottom-6 right-6 bg-[#1F2937]/80 backdrop-blur-md border border-[#6C3CE9]/30 rounded-xl z-50 shadow-[0_0_15px_0_rgba(46,255,212,0.2)]"
            variants={panelVariants}
            initial="hidden"
            animate={isExpanded ? "expanded" : "visible"}
            exit="exit"
          >
            {/* Expand Arrow Button */}
            <motion.button
              onClick={toggleExpand}
              className="absolute -left-12 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#1F2937]/80 backdrop-blur-md border border-[#6C3CE9]/30 rounded-full flex items-center justify-center text-white hover:bg-[#6C3CE9]/20 transition-colors shadow-[0_0_15px_0_rgba(46,255,212,0.2)]"
              variants={arrowVariants}
              initial="hidden"
              animate="visible"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>

            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#6C3CE9]/30">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#6C3CE9] rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-xl font-medium text-white">Trading Bot</h2>
              </div>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="h-[calc(100%-80px)] flex items-center justify-center p-5">
              <div className="text-center">
                <h3 className="text-2xl font-medium text-white mb-4">Trading Bot Coming Soon</h3>
                <p className="text-gray-300">We're working on something amazing. Stay tuned!</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
} 