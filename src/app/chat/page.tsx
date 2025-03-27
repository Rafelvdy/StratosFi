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
  const planetRef = useRef<HTMLDivElement>(null)
  const animationFrameId = useRef<number | undefined>(undefined)
  const rotationFrameId = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!canvasRef.current || !planetRef.current) return
    
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
      ctx.clearRect(0, 0, canvas.width, canvas.height)
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
      
      animationFrameId.current = requestAnimationFrame(animate)
    }
    animate()

    // Subtle planet rotation animation
    let rotation = 0
    const rotatePlanet = () => {
      if (planetRef.current) {
        rotation += 0.02
        planetRef.current.style.transform = `rotate(${rotation}deg)`
        rotationFrameId.current = requestAnimationFrame(rotatePlanet)
      }
    }
    rotatePlanet()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
      if (rotationFrameId.current) {
        cancelAnimationFrame(rotationFrameId.current)
      }
    }
  }, [])

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
            <button className="w-full text-left px-6 py-3 rounded-lg bg-[#6C3CE9]/20 text-white hover:bg-[#6C3CE9]/30 transition-all duration-200 hover:shadow-[0_0_10px_0_rgba(46,255,212,0.2)]">
              Chatbot
            </button>
          </nav>
        </div>
      </div>
    </div>
  )
} 