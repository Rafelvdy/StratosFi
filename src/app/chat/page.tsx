'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'

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

    // Create particles
    const particles: Particle[] = []
    const createParticles = () => {
      const particleCount = 80
      
      for (let i = 0; i < particleCount; i++) {
        const isCluster = Math.random() < 0.3
        const baseX = Math.random() * canvas.width
        const baseY = Math.random() * canvas.height
        
        if (isCluster) {
          const clusterSize = Math.floor(Math.random() * 2) + 2
          for (let j = 0; j < clusterSize; j++) {
            particles.push({
              x: baseX + (Math.random() - 0.5) * 30,
              y: baseY + (Math.random() - 0.5) * 30,
              speed: 0.05 + Math.random() * 0.1,
              size: 0.5 + Math.random() * 1.5,
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
        gradient.addColorStop(0, `${particle.color}`)
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
      
      requestAnimationFrame(animate)
    }
    animate()

    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])

  return (
    <div className="min-h-screen bg-black">
      {/* Space Background */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0"
      />

      {/* Header */}
      <header className="fixed top-0 w-full bg-background/80 backdrop-blur-md z-50 border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Image
              src="/logos/Stratos Bar logo (white).png"
              alt="Stratos Logo"
              width={240}
              height={130}
              priority
              className="select-none"
            />
          </div>
        </div>
      </header>

      {/* Navigation Panel */}
      <div className="fixed left-0 top-0 h-screen w-[280px] bg-[#1F2937] z-40 mt-[89px] shadow-[0_0_15px_0_rgba(46,255,212,0.3)]">
        <div className="p-8">
          <h2 className="text-2xl font-semibold text-white mb-8">Navigation</h2>
          <nav className="space-y-2">
            <button className="w-full text-left px-6 py-3 rounded-lg bg-[#6C3CE9]/20 text-white hover:bg-[#6C3CE9]/30 transition-all duration-200 hover:shadow-[0_0_10px_0_rgba(46,255,212,0.2)]">
              Chatbot
            </button>
          </nav>
        </div>
      </div>
    </div>
  )
} 