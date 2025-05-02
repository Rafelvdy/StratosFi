'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

interface Particle {
  x: number
  y: number
  speed: number
  size: number
  opacity: number
  targetOpacity: number
  color: string
  fadeSpeed: number
}

export default function DashboardPage() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameId = useRef<number | null>(null)
  const isComponentMounted = useRef(true)
  const particles = useRef<Particle[]>([])
  const [isAICardHovered, setIsAICardHovered] = useState(false)
  const [isKOLCardHovered, setIsKOLCardHovered] = useState(false)
  const [userCount, setUserCount] = useState(1352) // Placeholder value
  const [latestUpdate, setLatestUpdate] = useState('Enhanced Sentiment Analysis')

  // Reset state when component mounts
  useEffect(() => {
    isComponentMounted.current = true
    return () => {
      isComponentMounted.current = false
    }
  }, [])

  const handleNavigateToAI = useCallback(() => {
    router.push('/chat')
  }, [router])

  const handleNavigateToKOL = useCallback(() => {
    // For now, this just navigates to the chat page as well
    // In the future, this would navigate to a KOL reports page
    router.push('/chat')
  }, [router])

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Star colors with their weights (probability of appearance)
    const starColors = [
      { color: '#FFFFFF', weight: 60 }, // White, most common
      { color: '#CAE1FF', weight: 25 }, // Pale Blue
      { color: '#FFF4E0', weight: 15 }, // Pale Yellow
      { color: '#FFE4E1', weight: 10 }, // Very Faint Red
    ]

    // Get weighted random color
    const getRandomColor = () => {
      const totalWeight = starColors.reduce((sum, { weight }) => sum + weight, 0)
      let random = Math.random() * totalWeight
      
      for (const { color, weight } of starColors) {
        if (random < weight) return color
        random -= weight
      }
      return starColors[0].color
    }

    // Set canvas size with cleanup
    const resizeCanvas = () => {
      if (!isComponentMounted.current || !canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      // Clear particles and regenerate on resize to prevent visual artifacts
      particles.current = []
      initParticles()
    }

    // Initialize particles with memory management
    const initParticles = () => {
      if (!isComponentMounted.current) return
      particles.current = Array.from({ length: 80 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 0.5 + Math.random(),
        speed: 0.05 + Math.random() * 0.1,
        color: getRandomColor(),
        opacity: 0,
        targetOpacity: 0.3 + Math.random() * 0.4,
        fadeSpeed: 0.01
      }))
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const animate = () => {
      if (!isComponentMounted.current || !ctx || !canvas) return
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      particles.current.forEach(particle => {
        if (!isComponentMounted.current) return

        if (particle.opacity < particle.targetOpacity) {
          particle.opacity = Math.min(
            particle.opacity + particle.fadeSpeed,
            particle.targetOpacity
          )
        }

        if (Math.random() < 0.001) {
          particle.targetOpacity = 0.3 + Math.random() * 0.4
        }

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 2
        )
        gradient.addColorStop(0, particle.color)
        gradient.addColorStop(1, 'transparent')
        
        ctx.fillStyle = gradient
        ctx.globalAlpha = particle.opacity
        ctx.fill()
        ctx.globalAlpha = 1

        particle.y -= particle.speed
        if (particle.y < 0) {
          particle.y = canvas.height
          particle.x = Math.random() * canvas.width
          particle.opacity = 0
        }
      })
      
      if (isComponentMounted.current) {
        animationFrameId.current = requestAnimationFrame(animate)
      }
    }
    animate()

    return () => {
      isComponentMounted.current = false
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current)
        animationFrameId.current = null
      }
      window.removeEventListener('resize', resizeCanvas)
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
      particles.current = []
    }
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background animation */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
      />
      <div className="absolute inset-0 backdrop-blur-[1px] z-10"></div>

      {/* Header Section */}
      <header className="relative z-20 w-full py-4 px-6">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Image
              src="/logos/Stratos Bar logo (white).png"
              alt="Stratos Logo"
              width={150}
              height={50}
              priority
              className="select-none"
            />
          </div>

          {/* User Controls */}
          <div className="flex items-center space-x-6">
            <button className="text-gray-300 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <button className="text-gray-300 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Menu Area */}
      <main className="relative z-20 container mx-auto px-6 pt-20 pb-16">
        <h1 className="text-4xl font-bold text-white text-center mb-16">Dashboard</h1>
        
        <div className="flex flex-col lg:flex-row justify-center items-stretch gap-8 mb-16 relative">
          {/* Connecting line between cards */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/3 h-px bg-gradient-to-r from-[#6C3CE9] via-[#4D7EFF] to-[#2EFFD4] hidden lg:block"></div>
          
          {/* AI Analysis Card */}
          <motion.div 
            className={`relative flex-1 lg:flex-[1.2] flex flex-col bg-black/30 backdrop-blur-sm border-2 rounded-xl overflow-hidden ${isAICardHovered ? 'border-[#6C3CE9]' : 'border-[#6C3CE9]/30'}`}
            onMouseEnter={() => setIsAICardHovered(true)}
            onMouseLeave={() => setIsAICardHovered(false)}
            onClick={handleNavigateToAI}
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            {/* Purple glow effect */}
            <div className={`absolute inset-0 bg-[#6C3CE9]/10 blur-xl transition-opacity duration-300 ${isAICardHovered ? 'opacity-100' : 'opacity-40'}`}></div>
            
            <div className="relative p-6 flex-1 flex flex-col">
              {/* Card header with icon */}
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-[#6C3CE9]/20 rounded-full flex items-center justify-center mr-4">
                  {/* AI brain icon */}
                  <Image 
                    src="/Icons/chat-bot-icon.png"
                    alt="AI Brain"
                    width={30}
                    height={30}
                    className="object-contain"
                  />
                </div>
                <h2 className="text-2xl font-bold text-white">Stratos AI</h2>
              </div>
              
              {/* Status indicator */}
              <div className="flex items-center mb-4">
                <div className="relative mr-2 w-2 h-2">
                  <div className="absolute inset-0 bg-green-400 rounded-full"></div>
                  <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
                </div>
                <p className="text-sm text-green-400">Active</p>
              </div>
              
              {/* Card content */}
              <p className="text-gray-300 mb-6">Real-time sentiment analysis powered by AI</p>
              
              {/* Feature list */}
              <ul className="space-y-2 mb-8 text-sm text-gray-400">
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-[#2EFFD4]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  Crypto Twitter analysis
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-[#2EFFD4]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  Market sentiment scoring
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-[#2EFFD4]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  Web3 education assistant
                </li>
              </ul>
              
              {/* Action button */}
              <div className="mt-auto">
                <button className="w-full py-3 bg-[#6C3CE9] hover:bg-[#6C3CE9]/80 rounded-lg text-white font-medium transition-colors">
                  Launch AI Analysis
                </button>
              </div>
            </div>
          </motion.div>
          
          {/* KOL Report Card */}
          <motion.div 
            className={`relative flex-1 flex flex-col bg-black/30 backdrop-blur-sm border-2 rounded-xl overflow-hidden ${isKOLCardHovered ? 'border-amber-500' : 'border-amber-500/30'}`}
            onMouseEnter={() => setIsKOLCardHovered(true)}
            onMouseLeave={() => setIsKOLCardHovered(false)}
            onClick={handleNavigateToKOL}
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            {/* Amber glow effect */}
            <div className={`absolute inset-0 bg-amber-500/10 blur-xl transition-opacity duration-300 ${isKOLCardHovered ? 'opacity-100' : 'opacity-40'}`}></div>
            
            <div className="relative p-6 flex-1 flex flex-col">
              {/* Card header with icon */}
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mr-4">
                  {/* Document icon */}
                  <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">KOL Analysis</h2>
              </div>
              
              {/* Latest report date */}
              <div className="flex items-center mb-4">
                <svg className="w-4 h-4 mr-2 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-amber-400">Latest report: May 1, 2025</p>
              </div>
              
              {/* Card content */}
              <p className="text-gray-300 mb-6">Insights from the KOLs that matter</p>
              
              {/* Feature list */}
              <ul className="space-y-2 mb-8 text-sm text-gray-400">
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-amber-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  KOLs without the BS
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-amber-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  Whole Project / Chain KOL Reports
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-amber-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  Find the right KOLs for your project!
                </li>
              </ul>
              
              {/* Action button */}
              <div className="mt-auto">
                <button className="w-full py-3 bg-amber-500 hover:bg-amber-500/80 rounded-lg text-white font-medium transition-colors">
                  View KOL Reports
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Bottom Action Bar */}
      <footer className="relative z-20 bg-black/50 backdrop-blur-sm border-t border-gray-800 py-4 px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            {/* Metrics Section */}
            <div className="flex items-center mb-4 md:mb-0">
              <div className="mr-6">
                <span className="text-xs text-gray-400 block">Active Users</span>
                <span className="text-xl text-white font-bold">{userCount.toLocaleString()}</span>
              </div>
            </div>
            
            {/* What's New Section */}
            <div className="flex items-center mb-4 md:mb-0">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-[#2EFFD4] rounded-full mr-2"></div>
                <span className="text-sm text-gray-300">Latest Update: {latestUpdate}</span>
              </div>
            </div>
            
            {/* Help Section */}
            <div>
              <button className="flex items-center text-gray-300 hover:text-white transition-colors">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Help & Support</span>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 