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
      canvas.height = window.innerHeight
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
        ctx.fillStyle = '#2EFFD420'
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
    <div className="relative min-h-screen bg-background text-white overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
      />
      
      {/* Navigation */}
      <nav className="relative z-10 p-6">
        <div className="container mx-auto flex justify-between items-center">
          <Image
            src="/logos/Stratos Circle logo.png"
            alt="Stratos Logo"
            width={40}
            height={40}
            className="dark:invert"
          />
          <div className="space-x-8">
            <a href="#features" className="hover:text-secondary transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-secondary transition-colors">How It Works</a>
            <button className="px-6 py-2 bg-primary hover:bg-opacity-80 rounded-full transition-all">
              Launch App
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 pt-20 pb-32">
        <div className="max-w-4xl">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
            Intelligent Crypto Trading Through Sentiment Analysis
          </h1>
          <p className="text-xl mb-8 text-gray-300">
            Harness the power of AI to analyze market sentiment and automate your trading strategy
          </p>
          <div className="space-x-4">
            <button className="px-8 py-3 bg-primary hover:bg-opacity-80 rounded-full transition-all">
              Get Started
            </button>
            <button className="px-8 py-3 border border-secondary text-secondary hover:bg-secondary hover:text-background rounded-full transition-all">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 bg-neutral bg-opacity-50 backdrop-blur-lg">
        <div className="container mx-auto px-6 py-24">
          <h2 className="text-4xl font-bold mb-16 text-center">
            <span className="bg-gradient-to-r from-secondary to-tertiary bg-clip-text text-transparent">
              Powerful Features
            </span>
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
              <div key={index} className="p-6 rounded-2xl bg-neutral border border-primary border-opacity-20 hover:border-opacity-100 transition-all">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-secondary">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10">
        <div className="container mx-auto px-6 py-24">
          <h2 className="text-4xl font-bold mb-16 text-center">
            <span className="bg-gradient-to-r from-tertiary to-primary bg-clip-text text-transparent">
              How It Works
            </span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Connect', description: 'Link your trading accounts' },
              { step: '2', title: 'Configure', description: 'Set up your trading parameters' },
              { step: '3', title: 'Monitor', description: 'Track sentiment and market trends' },
              { step: '4', title: 'Trade', description: 'Execute trades automatically' }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="w-12 h-12 rounded-full bg-secondary text-background flex items-center justify-center font-bold text-xl mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
                {index < 3 && (
                  <div className="hidden md:block absolute top-6 left-16 w-full h-0.5 bg-gradient-to-r from-secondary to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10">
        <div className="container mx-auto px-6 py-24">
          <div className="bg-gradient-to-r from-primary to-tertiary rounded-3xl p-12 text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Start Trading Smarter?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of traders using AI-powered sentiment analysis to make better trading decisions
            </p>
            <button className="px-8 py-3 bg-secondary text-background hover:bg-opacity-80 rounded-full transition-all font-bold">
              Get Started Now
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
