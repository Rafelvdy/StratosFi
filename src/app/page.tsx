'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

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

  useEffect(() => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Star colors with their weights (probability of appearance)
    const starColors = [
      { color: '#FFFFFF', weight: 50 }, // White, most common
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

    // Create particles with natural distribution
    const particles: Particle[] = []
    const createParticles = () => {
      const particleCount = 80 // Reduced count for subtlety
      
      for (let i = 0; i < particleCount; i++) {
        // Create clusters by occasionally grouping stars
        const isCluster = Math.random() < 0.3
        const baseX = Math.random() * canvas.width
        const baseY = Math.random() * canvas.height
        
        if (isCluster) {
          // Add 2-3 stars in a cluster
          const clusterSize = Math.floor(Math.random() * 2) + 2
          for (let j = 0; j < clusterSize; j++) {
            particles.push({
              x: baseX + (Math.random() - 0.5) * 30,
              y: baseY + (Math.random() - 0.5) * 30,
              speed: 0.05 + Math.random() * 0.1, // Slower movement
              size: 0.5 + Math.random() * 1.5,   // Smaller sizes
              opacity: 0,
              targetOpacity: 0.3 + Math.random() * 0.4,
              color: getRandomColor(),
              fadeSpeed: 0.002 + Math.random() * 0.003
            })
          }
        } else {
          particles.push({
            x: baseX,
            y: baseY,
            speed: 0.05 + Math.random() * 0.1,
            size: 0.5 + Math.random() * 1.5,
            opacity: 0,
            targetOpacity: 0.3 + Math.random() * 0.4,
            color: getRandomColor(),
            fadeSpeed: 0.002 + Math.random() * 0.003
          })
        }
      }
    }
    createParticles()

    const animate = () => {
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach(particle => {
        // Update opacity with smooth transition
        if (particle.opacity < particle.targetOpacity) {
          particle.opacity = Math.min(
            particle.opacity + particle.fadeSpeed,
            particle.targetOpacity
          )
        }

        // Create subtle twinkling effect
        if (Math.random() < 0.001) {
          particle.targetOpacity = 0.3 + Math.random() * 0.4
        }

        // Draw star with current opacity
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        
        // Create subtle glow effect
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 2
        )
        gradient.addColorStop(0, `${particle.color}`)
        gradient.addColorStop(1, 'transparent')
        
        ctx.fillStyle = gradient
        ctx.globalAlpha = particle.opacity
        ctx.fill()
        ctx.globalAlpha = 1

        // Move particle
        particle.y -= particle.speed
        if (particle.y < 0) {
          particle.y = canvas.height
          particle.x = Math.random() * canvas.width
          particle.opacity = 0 // Reset opacity for fade-in
        }
      })
      
      requestAnimationFrame(animate)
    }
    animate()

    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])

  return (
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
                onClick={() => router.push('/chat')}
                className="px-8 py-3 bg-[#6C3CE9] hover:bg-opacity-80 rounded-full transition-all text-white"
              >
                Launch App
              </button>
              <button className="px-8 py-3 border border-[#2EFFD4] text-[#2EFFD4] hover:bg-[#2EFFD4] hover:text-black rounded-full transition-all">
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
              <button className="px-8 py-3 bg-[#2EFFD4] text-black hover:bg-opacity-80 rounded-full transition-all font-bold">
                Launch App
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
