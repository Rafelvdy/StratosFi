'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ChatPanel } from '../components/ChatPanel'
import { TradingBotPanel } from '../components/TradingBotPanel'
import { WalletPanel } from '../components/WalletPanel'
import { useWallet } from '@solana/wallet-adapter-react'

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
  const [isWalletPanelOpen, setIsWalletPanelOpen] = useState(false)
  const { connected, publicKey } = useWallet()

  // Reset state when component mounts
  useEffect(() => {
    isComponentMounted.current = true
    rotationAngle.current = 0
    return () => {
      isComponentMounted.current = false
    }
  }, [])

  useEffect(() => {
    if (!canvasRef.current || !planetRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const currentPlanetRef = planetRef.current
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
      if (!isComponentMounted.current || !currentPlanetRef) return
      
      rotationAngle.current += 0.02
      currentPlanetRef.style.transform = `rotate(${rotationAngle.current}deg)`
      
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
      
      if (currentPlanetRef) {
        currentPlanetRef.style.transform = 'rotate(0deg)'
      }
    }
  }, [])

  const toggleChatPanel = () => setIsChatPanelOpen(!isChatPanelOpen)
  const toggleTradingBotPanel = () => setIsTradingBotPanelOpen(!isTradingBotPanelOpen)
  const toggleWalletPanel = () => setIsWalletPanelOpen(!isWalletPanelOpen)

  return (
    <div className="relative min-h-screen bg-[#0A0A0A] text-white">
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
        className="fixed left-6 top-6 h-[calc(100vh-48px)] w-[280px] bg-[#1F2937] rounded-xl shadow-[0_0_15px_0_rgba(46,255,212,0.3)] relative"
        style={{ zIndex: 40 }}
      >
        <div className="p-8">
          <h2 className="text-2xl font-semibold text-white mb-8">Navigation</h2>
          <nav className="flex flex-col items-center space-y-6">
            <div className="relative group">
              <button 
                className={`w-48 h-48 flex items-center justify-center rounded-xl text-white transition-all duration-300 hover:scale-105 cursor-pointer ${
                  isChatPanelOpen 
                    ? 'bg-gradient-to-br from-[#2EFFD4]/30 to-[#6C3CE9]/50 hover:from-[#2EFFD4]/40 hover:to-[#6C3CE9]/60 shadow-[0_0_20px_0_rgba(46,255,212,0.3)]' 
                    : 'bg-gradient-to-br from-[#2EFFD4]/10 to-[#6C3CE9]/20 hover:from-[#2EFFD4]/20 hover:to-[#6C3CE9]/30 hover:shadow-[0_0_20px_0_rgba(46,255,212,0.2)]'
                }`}
                onClick={toggleChatPanel}
              >
                <Image
                  src="/icons/chat bot icon.png"
                  alt="Chatbot"
                  width={96}
                  height={96}
                  className="transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute -right-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-[#1F2937]/90 rounded-lg opacity-0 -translate-x-2 pointer-events-none transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-full whitespace-nowrap text-sm font-medium backdrop-blur-sm border border-[#6C3CE9]/30">
                  Chatbot
                </div>
              </button>
            </div>
            
            <div className="relative group">
              <button 
                className={`w-48 h-48 flex items-center justify-center rounded-xl text-white transition-all duration-300 hover:scale-105 cursor-pointer ${
                  isTradingBotPanelOpen 
                    ? 'bg-gradient-to-br from-[#2EFFD4]/30 to-[#6C3CE9]/50 hover:from-[#2EFFD4]/40 hover:to-[#6C3CE9]/60 shadow-[0_0_20px_0_rgba(46,255,212,0.3)]' 
                    : 'bg-gradient-to-br from-[#2EFFD4]/10 to-[#6C3CE9]/20 hover:from-[#2EFFD4]/20 hover:to-[#6C3CE9]/30 hover:shadow-[0_0_20px_0_rgba(46,255,212,0.2)]'
                }`}
                onClick={toggleTradingBotPanel}
              >
                <div className="flex items-center justify-center w-full h-full">
                  <Image
                    src="/icons/trading bot icon.png"
                    alt="Trading Bot"
                    width={96}
                    height={96}
                    className="transition-transform duration-300 group-hover:scale-110 mr-5"
                  />
                </div>
                <div className="absolute -right-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-[#1F2937]/90 rounded-lg opacity-0 -translate-x-2 pointer-events-none transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-full whitespace-nowrap text-sm font-medium backdrop-blur-sm border border-[#6C3CE9]/30">
                  Trading Bot
                </div>
              </button>
            </div>
          </nav>
        </div>

        {/* Wallet Connection Button */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="relative group">
            <button
              onClick={toggleWalletPanel}
              className={`w-full flex items-center justify-center gap-4 px-6 py-3 bg-[#1A1A1A] hover:bg-[#2A2A2A] rounded-xl border border-[#2A2A2A] transition-all duration-200 group relative ${
                isWalletPanelOpen ? 'bg-[#2A2A2A]' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-[#6C3CE9]/10 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-[#2EFFD4]"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21 7V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V7C3 4 4.5 2 8 2H16C19.5 2 21 4 21 7Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M15.5 2V9.85999C15.5 10.3 14.98 10.52 14.66 10.23L12.34 8.09003C12.15 7.91003 11.85 7.91003 11.66 8.09003L9.34003 10.23C9.02003 10.52 8.5 10.3 8.5 9.85999V2H15.5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm font-medium">
                  {connected
                    ? `${publicKey?.toBase58().slice(0, 4)}...${publicKey?.toBase58().slice(-4)}`
                    : 'Connect Wallet'}
                </span>
                <div
                  className="absolute top-0 -translate-y-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                  style={{ marginTop: '-8px' }}
                >
                  <div className="bg-[#2A2A2A] px-3 py-1 rounded-lg text-sm whitespace-nowrap flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${connected ? 'bg-[#2EFFD4]' : 'bg-red-500'}`} />
                    {connected ? 'Connected' : 'Disconnected'}
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Chat Panel */}
      <ChatPanel
        isOpen={isChatPanelOpen}
        onCloseAction={toggleChatPanel}
      />

      {/* Trading Bot Panel */}
      <TradingBotPanel 
        isOpen={isTradingBotPanelOpen} 
        onCloseAction={() => setIsTradingBotPanelOpen(false)} 
      />

      <WalletPanel 
        isOpen={isWalletPanelOpen} 
        onCloseAction={() => setIsWalletPanelOpen(false)} 
      />
    </div>
  )
} 