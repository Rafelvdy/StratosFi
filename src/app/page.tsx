'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { TransitionLayout } from './components/TransitionLayout'

// Dynamically import the chat page with no SSR to prevent hydration issues
const ChatPage = dynamic(() => import('./chat/page'), { ssr: false })

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

export default function Home() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameId = useRef<number | null>(null)
  const isComponentMounted = useRef(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const particles = useRef<Particle[]>([])

  // Reset state when component mounts
  useEffect(() => {
    isComponentMounted.current = true
    setIsTransitioning(false)
    return () => {
      isComponentMounted.current = false
    }
  }, [])

  const handleLaunchApp = useCallback(() => {
    if (animationFrameId.current !== null) {
      cancelAnimationFrame(animationFrameId.current)
      animationFrameId.current = null
    }
    setIsTransitioning(true)
  }, [])

  const handleTransitionComplete = useCallback(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
    }
    particles.current = []
    router.push('/chat')
  }, [router])

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size with cleanup
    const resizeCanvas = () => {
      if (!isComponentMounted.current || !canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      // Clear particles and regenerate on resize to prevent visual artifacts
      particles.current = []
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Star colors with their weights (probability of appearance)
    const starColors = [
      { color: '#FFFFFF', weight: 60 }, // White, most common
      { color: '#CAE1FF', weight: 25 }, // Pale Blue
      { color: '#FFF4E0', weight: 15 }, // Pale Yellow
      { color: '#FFE4E1', weight: 50 }, // Very Faint Red
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
        size: 1 + Math.random(),
        speed: 0.05 + Math.random() * 0.1,
        color: getRandomColor(),
        opacity: 0,
        targetOpacity: 0.5 + Math.random() * 0.5,
        fadeSpeed: 0.02
      }))
    }
    initParticles()

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
      
      if (isComponentMounted.current && !isTransitioning) {
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
  }, [isTransitioning])

  const homeContent = (
    <div className="relative">
      {/* Space section with particles */}
      <section className="relative h-screen">
        {/* Logo with adjusted z-index to ensure it's above particles */}
        <div className="absolute top-63 left-168 z-50">
          <Image
            src="/logos/Stratos Bar logo (white).png"
            alt="Stratos Logo"
            width={240}
            height={130}
            priority
            className="select-none"
          />
        </div>

        <canvas
          ref={canvasRef}
          className="absolute inset-0 z-10"
        />
        <div className="relative z-20 h-full flex items-center justify-center px-6">
          <div className="max-w-4xl">
            <h1 className="text-6xl font-bold mb-6 text-white">
              Welcome to 
            </h1>
            <p className="text-xl mb-8 text-gray-200">
              Harness the power of AI to analyze market sentiment and automate your trading strategy
            </p>
            <div className="space-x-4">
              <button 
                onClick={handleLaunchApp}
                className="px-8 py-3 bg-[#6C3CE9] hover:bg-opacity-80 active:scale-95 active:opacity-70 rounded-full transition-all duration-150 text-white transform"
              >
                Launch App
              </button>
              <button className="px-8 py-3 border border-[#2EFFD4] text-[#2EFFD4] hover:bg-[#2EFFD4] hover:text-black active:scale-95 active:opacity-70 rounded-full transition-all duration-150 transform">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stratosphere sections */}
      <div className="relative">
        {/* Gradient background that spans features to CTA */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#6C3CE9]/40 via-[#4D7EFF]/60 to-[#2EFFD4]/80" />

        {/* Features Section */}
        <section className="relative min-h-screen">
          <div className="relative z-10 container mx-auto px-6 py-24">
            <h2 className="text-4xl font-bold mb-16 text-center text-white">
              Powerful Features
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Sentiment Analysis',
                  description: 'Real-time analysis of market sentiment from news and social media',
                  icon: '📊'
                },
                {
                  title: 'Automated Trading',
                  description: 'Set up sophisticated trading bots with custom strategies',
                  icon: '🤖'
                },
                {
                  title: 'Market Insights',
                  description: 'Deep dive into market trends with AI-powered analytics',
                  icon: '📈'
                }
              ].map((feature, index) => (
                <div key={index} 
                  className="p-6 rounded-2xl backdrop-blur-sm bg-neutral/20 border border-[#6C3CE9]/20 hover:border-[#2EFFD4]/50 transition-all">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative">
          <div className="container mx-auto px-6 py-24">
            <div className="backdrop-blur-sm bg-[#2EFFD4]/10 rounded-3xl p-12 text-center border border-[#2EFFD4]/30">
              <h2 className="text-4xl font-bold mb-4 text-white">Ready to Start Trading Smarter?</h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-200">
                Join thousands of traders using AI-powered sentiment analysis to make better trading decisions
              </p>
              <button 
                onClick={handleLaunchApp}
                className="px-8 py-3 bg-[#2EFFD4] text-black hover:bg-opacity-80 active:scale-95 active:opacity-70 rounded-full transition-all duration-150 transform font-bold"
              >
                Launch App
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )

  return (
    <TransitionLayout
      isTransitioning={isTransitioning}
      onTransitionCompleteAction={handleTransitionComplete}
      nextPage={<ChatPage />}
    >
      {homeContent}
    </TransitionLayout>
  )
}
