'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ChatPanel } from '../components/ChatPanel'
import { TradingBotPanel } from '../components/TradingBotPanel'

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

export default function ChatPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const planetRef = useRef<HTMLDivElement>(null)
  const animationFrameId = useRef<number | null>(null)
  const rotationFrameId = useRef<number | null>(null)
  const isComponentMounted = useRef(true)
  const particles = useRef<Particle[]>([])
  const rotationAngle = useRef(0)
  const [isChatPanelOpen, setIsChatPanelOpen] = useState(false)
  const [isTradingBotPanelOpen, setIsTradingBotPanelOpen] = useState(false)

  useEffect(() => {
    if (!canvasRef.current || !planetRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Star colors with their weights
    const starColors = [
      { color: '#FFFFFF', weight: 50 }, // White
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

    // Initialize first set of particles
    initParticles()

    // Set canvas size with cleanup
    const resizeCanvas = () => {
      if (!isComponentMounted.current || !canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      // Clear particles and regenerate on resize to prevent visual artifacts
      particles.current = []
      initParticles()
    }

    // Set up initial canvas size and event listener
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

    // Subtle planet rotation animation with memory management
    const rotatePlanet = () => {
      if (!isComponentMounted.current || !planetRef.current) return
      
      rotationAngle.current += 0.02
      planetRef.current.style.transform = `rotate(${rotationAngle.current}deg)`
      
      if (isComponentMounted.current) {
        rotationFrameId.current = requestAnimationFrame(rotatePlanet)
      }
    }
    rotatePlanet()

    return () => {
      isComponentMounted.current = false
      
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current)
        animationFrameId.current = null
      }
      
      if (rotationFrameId.current !== null) {
        cancelAnimationFrame(rotationFrameId.current)
        rotationFrameId.current = null
      }
      
      window.removeEventListener('resize', resizeCanvas)
      
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
      
      particles.current = []
      rotationAngle.current = 0
      
      if (planetRef.current) {
        planetRef.current.style.transform = 'rotate(0deg)'
      }
    }
  }, [])

  const toggleChatPanel = () => {
    setIsChatPanelOpen(prev => !prev)
  }

  const toggleTradingBotPanel = () => {
    setIsTradingBotPanelOpen(prev => !prev)
  }

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      {/* Star Field Base Layer */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0"
        style={{ zIndex: 0 }}
      />

      {/* Content Layer with Blur */}
      <div className="fixed inset-0" style={{ zIndex: 10 }}>
        {/* Blur Effect */}
        <div className="absolute inset-0 backdrop-blur-[2px]" />

        {/* Planet Logo */}
        <div 
          ref={planetRef}
          className="absolute opacity-90"
          style={{
            top: '15%',
            right: '10%',
            zIndex: 20,
            filter: 'drop-shadow(0 0 20px rgba(46,255,212,0.2)) blur(1.5px)',
            transition: 'transform 0.05s linear'
          }}
        >
          <Image
            src="/logos/Stratos Circle logo.png"
            alt="Stratos Planet"
            width={200}
            height={200}
            priority
            className="select-none"
          />
        </div>
      </div>

      {/* Floating Navigation Panel */}
      <div 
        className="fixed left-6 top-6 h-[calc(100vh-48px)] w-[280px] bg-[#1F2937] rounded-xl shadow-[0_0_15px_0_rgba(46,255,212,0.3)]"
        style={{ zIndex: 40 }}
      >
        <div className="p-8">
          <h2 className="text-2xl font-semibold text-white mb-8">Navigation</h2>
          <nav className="space-y-2">
            <button 
              className={`w-full text-left px-6 py-3 rounded-lg text-white transition-all duration-200 hover:shadow-[0_0_10px_0_rgba(46,255,212,0.2)] ${isChatPanelOpen ? 'bg-[#6C3CE9] hover:bg-[#6C3CE9]/90' : 'bg-[#6C3CE9]/20 hover:bg-[#6C3CE9]/30'}`}
              onClick={toggleChatPanel}
            >
              Chatbot
            </button>
            <button 
              className={`w-full text-left px-6 py-3 rounded-lg text-white transition-all duration-200 hover:shadow-[0_0_10px_0_rgba(46,255,212,0.2)] ${isTradingBotPanelOpen ? 'bg-[#6C3CE9] hover:bg-[#6C3CE9]/90' : 'bg-[#6C3CE9]/20 hover:bg-[#6C3CE9]/30'}`}
              onClick={toggleTradingBotPanel}
            >
              Trading Bot
            </button>
          </nav>
        </div>
      </div>

      {/* Chat Panel */}
      <ChatPanel 
        isOpen={isChatPanelOpen} 
        onClose={() => setIsChatPanelOpen(false)} 
      />

      {/* Trading Bot Panel */}
      <TradingBotPanel 
        isOpen={isTradingBotPanelOpen} 
        onClose={() => setIsTradingBotPanelOpen(false)} 
      />
    </div>
  )
} 