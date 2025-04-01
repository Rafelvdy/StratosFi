'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'

interface ChatPanelProps {
  isOpen: boolean
  onClose: () => void
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export const ChatPanel = ({ isOpen, onClose }: ChatPanelProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I am Stratos AI, your personal sentiment analysis assistant. How can I help you today?',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 500)
    }
  }, [isOpen])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: input }),
      })

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Non-JSON response:', await response.text())
        throw new Error('Server returned non-JSON response')
      }

      const data = await response.json()
      console.log('DEBUG: Chat API Response:', data)

      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        let errorMessage = data.message
        if (response.status === 500) {
          errorMessage = "An internal server error occurred. Please try again."
        }
        setError(errorMessage)
        if (!errorMessage.includes('timeframe')) {
          setMessages(prev => prev.slice(0, -1))
        }
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Failed to get response. Please try again.')
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setIsLoading(false)
    }
  }

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
            className="fixed top-6 bottom-6 right-6 bg-[#1F2937]/80 backdrop-blur-md border border-[#6C3CE9]/30 rounded-xl z-50 shadow-[0_0_15px_0_rgba(46,255,212,0.2)] flex flex-col"
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
            <div className="flex items-center justify-between p-5 border-b border-[#6C3CE9]/30 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#6C3CE9] rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                  </svg>
                </div>
                <h2 className="text-xl font-medium text-white">Stratos AI</h2>
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

            {/* Messages Container */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 messages-container">
              {messages.map(message => (
                <div 
                  key={message.id} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-2xl p-4 ${
                      message.role === 'user' 
                        ? 'bg-[#6C3CE9] text-white' 
                        : 'bg-[#2EFFD4]/10 border border-[#2EFFD4]/30 text-white'
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className="text-xs opacity-70 mt-1 text-right">
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#2EFFD4]/10 border border-[#2EFFD4]/30 text-white rounded-2xl p-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-[#2EFFD4] rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-[#2EFFD4] rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-[#2EFFD4] rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
              {error && (
                <div className="flex justify-center">
                  <div className="bg-red-500/10 border border-red-500/30 text-red-500 rounded-2xl p-4">
                    {error}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-[#6C3CE9]/30 shrink-0">
              <form onSubmit={handleSubmit} className="flex space-x-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-[#374151] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2EFFD4]/50"
                  disabled={isLoading}
                />
                <button 
                  type="submit"
                  className="bg-[#2EFFD4] text-black rounded-lg px-4 py-2 hover:bg-opacity-80 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading || !input.trim()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
} 