'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight // Only viewport height for space section
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Particle animation
    const particles: Array<{x: number, y: number, speed: number, size: number}> = []
    const createParticles = () => {
      for (let i = 0; i < 100; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          speed: 0.1 + Math.random() * 0.2,
          size: 1 + Math.random() * 1.5
        })
      }
    }
    createParticles()

    const animate = () => {
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach(particle => {
        ctx.fillStyle = '#ffffff20'
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
        
        particle.y -= particle.speed
        if (particle.y < 0) {
          particle.y = canvas.height
          particle.x = Math.random() * canvas.width
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
        {/* Add logo */}
        <div className="absolute top-6 left-6 z-20">
          <Image
            src="/logos/Stratos Bar logo (white).png"
            alt="Stratos Logo"
            width={150}
            height={40}
            priority
          />
        </div>

        <canvas
          ref={canvasRef}
          className="absolute inset-0"
        />
        <div className="relative z-10 h-full flex items-center justify-center px-6">
          <div className="max-w-4xl">
            <h1 className="text-6xl font-bold mb-6 text-white">
              Welcome to StratosFi
            </h1>
            <p className="text-xl mb-8 text-gray-200">
              Harness the power of AI to analyze market sentiment and automate your trading strategy
            </p>
            <div className="space-x-4">
              <button className="px-8 py-3 bg-[#6C3CE9] hover:bg-opacity-80 rounded-full transition-all text-white">
                Get Started
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
                Get Started Now
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
