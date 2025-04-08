'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { saveChatToWallet, loadChatFromWallet } from '../utils/walletStorage'
import { debounce } from 'lodash'
import { KOLTweetList } from './KOLTweetList'
import { KOLTweet, Tweet } from '../utils/twitterApi'
import { SentimentData } from '../../hooks/useSentimentData'
import { useSentimentData } from '../../hooks/useSentimentData'
import { useWindowSize } from '../../hooks/useWindowSize'

interface ChatPanelProps {
  isOpen: boolean
  onCloseAction: () => void
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  colorValue?: {
    value: string
    color: string
  }
  isExpanded?: boolean
}

export const ChatPanel = ({ isOpen, onCloseAction }: ChatPanelProps) => {
  const { connected, publicKey } = useWallet()
  const messageCounterRef = useRef(1);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-0',
      role: 'assistant',
      content: 'Hello! I am Stratos AI, your personal sentiment analysis assistant. How can I help you today?',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isKOLView, setIsKOLView] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const previousWalletRef = useRef<string | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
  const [isNearBottom, setIsNearBottom] = useState(true)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [kolTweets, setKolTweets] = useState<KOLTweet[]>([])
  const [currentTicker, setCurrentTicker] = useState<string>('')
  const { data: sentimentData } = useSentimentData({ 
    ticker: currentTicker,
    timeframe: '24h'
  });
  const { isMobile } = useWindowSize();

  interface ExpandedState {
    insights: boolean;
    events: boolean;
  }
  
  const [expandedSections, setExpandedSections] = useState<{[key: string]: ExpandedState}>({});
  
  const toggleSection = (messageId: string, section: keyof ExpandedState) => {
    setExpandedSections(prev => ({
      ...prev,
      [messageId]: {
        ...prev[messageId] || { insights: false, events: false },
        [section]: !prev[messageId]?.[section]
      }
    }));
  };

  // Create debounced save function with useCallback
  const debouncedSave = React.useCallback(
    debounce((walletAddress: string, msgs: ChatMessage[]) => {
      if (!walletAddress || !msgs.length) return;
      
      try {
        console.log('Saving chat history...', {
          walletAddress,
          messageCount: msgs.length
        });
        saveChatToWallet(walletAddress, msgs);
      } catch (error) {
        console.error('Failed to save chat history:', error);
      }
    }, 1000),
    []
  );

  // Load chat history when wallet connects
  useEffect(() => {
    const currentWallet = publicKey?.toBase58() || null;

    if (connected && currentWallet) {
      try {
        const savedMessages = loadChatFromWallet(currentWallet);
        if (savedMessages && savedMessages.length > 0) {
          setMessages(savedMessages);
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    } else if (!connected && previousWalletRef.current) {
      // On disconnect, save current state before resetting UI
      const disconnectingWallet = previousWalletRef.current;
      if (messages.length > 1) {
        saveChatToWallet(disconnectingWallet, messages);
      }
      
      // Reset UI only
      setMessages([{
        id: 'welcome-0',
        role: 'assistant',
        content: 'Hello! I am Stratos AI, your personal sentiment analysis assistant. How can I help you today?',
        timestamp: new Date()
      }]);
    }

    previousWalletRef.current = currentWallet;
  }, [connected, publicKey]); // Removed messages dependency

  // Save chat history when messages change, with proper conditions
  useEffect(() => {
    const shouldSave = connected && 
                      publicKey && 
                      messages.length > 1 && 
                      !isLoading; // Don't save while loading new messages

    if (shouldSave) {
      const walletAddress = publicKey.toBase58();
      debouncedSave(walletAddress, messages);
    }

    return () => {
      debouncedSave.cancel();
    };
  }, [messages, connected, publicKey, debouncedSave, isLoading]);

  // Add scroll position tracking
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
      const scrollBottom = scrollHeight - scrollTop - clientHeight
      const isCloseToBottom = scrollBottom < 100 // within 100px of bottom
      setIsNearBottom(isCloseToBottom)
      setShouldAutoScroll(isCloseToBottom)
    }
  }

  // Update scroll effect for new messages
  useEffect(() => {
    if (messagesEndRef.current && !isLoading && shouldAutoScroll) {
      messagesEndRef.current.scrollIntoView({
        behavior: isNearBottom ? 'smooth' : 'auto',
        block: 'end'
      })
    }
  }, [messages.length, isLoading, shouldAutoScroll, isNearBottom])

  // Add initial scroll effect when panel opens
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      // Use a small delay to ensure content is rendered
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
        setShouldAutoScroll(true)
        setIsNearBottom(true)
      }, 100)
    }
  }, [isOpen])

  // Add scroll listener effect
  useEffect(() => {
    const scrollElement = scrollContainerRef.current
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll)
      return () => scrollElement.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Add resize observer for panel resizing
  useEffect(() => {
    if (!scrollContainerRef.current) return

    const resizeObserver = new ResizeObserver(() => {
      if (shouldAutoScroll && messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'auto' })
      }
    })

    resizeObserver.observe(scrollContainerRef.current)
    return () => resizeObserver.disconnect()
  }, [shouldAutoScroll])

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle click outside to close panel
  useEffect(() => {
    if (!isOpen) return; // Don't add listener if panel is closed

    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onCloseAction();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onCloseAction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: `${Date.now()}-${messageCounterRef.current++}`,
      role: 'user',
      content: input,
      timestamp: new Date()
    }
    
    // Clear input immediately after creating message
    setInput('')
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Extract ticker from user message
      const tickerMatch = input.match(/\b(BTC|ETH|SOL|DOGE|XRP|ADA)\b/i);
      if (tickerMatch) {
        setCurrentTicker(tickerMatch[0].toUpperCase());
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: input }),
      })

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response')
      }

      const data = await response.json()
      console.log('DEBUG: Chat API Response:', data)

      if (data.success && Array.isArray(data.messages)) {
        // Add each message separately
        for (const msg of data.messages) {
          const assistantMessage: ChatMessage = {
            id: `${Date.now()}-${messageCounterRef.current++}`,
            role: 'assistant',
            content: msg.content,
            timestamp: new Date(),
            colorValue: msg.colorValue
          }
          setMessages(prev => [...prev, assistantMessage])
        }
      } else {
        // Handle error case
        const errorMessage: ChatMessage = {
          id: `${Date.now()}-${messageCounterRef.current++}`,
          role: 'assistant',
          content: "I couldn't process that request. Please try asking about cryptocurrency sentiment (e.g., BTC, ETH, SOL).",
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (err) {
      console.error('Error:', err)
      const assistantMessage: ChatMessage = {
        id: `${Date.now()}-${messageCounterRef.current++}`,
        role: 'assistant',
        content: "I'm having trouble processing requests right now. Please try again in a moment.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const toggleExpand = () => {
    setIsExpanded(prev => !prev)
  }

  const toggleKOLView = () => {
    setIsKOLView(prev => !prev)
  }

  const handleResetChat = () => {
    setShowResetConfirm(true)
  }

  const confirmReset = () => {
    // Reset to initial welcome message
    setMessages([{
      id: 'welcome-0',
      role: 'assistant',
      content: 'Hello! I am Stratos AI, your personal sentiment analysis assistant. How can I help you today?',
      timestamp: new Date()
    }])
    
    // Clear wallet storage if connected
    if (connected && publicKey) {
      saveChatToWallet(publicKey.toBase58(), [])
    }
    
    // Reset other states
    setExpandedSections({})
    setShowResetConfirm(false)
    setShouldAutoScroll(true)
    setIsNearBottom(true)
  }

  // Update kolTweets when sentiment data changes
  useEffect(() => {
    if (sentimentData?.tweets) {
      const kolTweetsFromData = sentimentData.tweets.filter((tweet: Tweet): tweet is KOLTweet => 
        'influence_score' in tweet && 'time_factor' in tweet
      );
      setKolTweets(kolTweetsFromData);
    }
  }, [sentimentData]);

  const panelVariants = {
    hidden: { 
      x: isMobile ? '100%' : '100%', 
      opacity: 0 
    },
    visible: { 
      x: '0%', 
      opacity: 1,
      width: isMobile ? '100%' : '400px',
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
      width: isMobile ? '100%' : 'calc(100vw - 385px)',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        duration: 0.5
      }
    },
    exit: { 
      x: isMobile ? '100%' : '100%', 
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

  const viewTransitionVariants = {
    chat: {
      x: '0%',
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    kol: {
      x: '-100%',
      opacity: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  }

  const kolViewVariants = {
    hidden: {
      x: '100%',
      opacity: 0
    },
    visible: {
      x: '0%',
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  }

  const resetButtonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        delay: 0.4,
        type: 'spring',
        stiffness: 300,
        damping: 25
      }
    }
  }

  const confirmDialogVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay with Blur */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-md z-45 pointer-events-auto"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onCloseAction}
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            className={`fixed right-0 top-0 h-screen z-50 flex flex-col ${
              isMobile 
                ? 'inset-0' 
                : 'w-[600px] rounded-l-2xl'
            }`}
            variants={panelVariants}
            initial="hidden"
            animate={isExpanded ? "expanded" : "visible"}
            exit="exit"
          >
            {/* Panel Background */}
            <div className="absolute inset-0 bg-[#1F2937]/95 border-l border-[#6C3CE9]/30 shadow-[0_0_15px_0_rgba(46,255,212,0.3)] pointer-events-none" />

            {/* Panel Content */}
            <div className="relative flex flex-col h-full w-full">
              {/* Expand Arrow Button */}
              {!isMobile && (
                <motion.button
                  onClick={toggleExpand}
                  className="absolute -left-12 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#1F2937] border border-[#6C3CE9]/30 rounded-full flex items-center justify-center text-white hover:bg-[#6C3CE9]/20 transition-colors shadow-[0_0_15px_0_rgba(46,255,212,0.2)] cursor-pointer z-50"
                  variants={arrowVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </motion.button>
              )}

              {/* Reset Button */}
              <motion.button
                onClick={handleResetChat}
                className={`absolute w-10 h-10 bg-[#1F2937] border border-[#6C3CE9]/30 rounded-full flex items-center justify-center text-white hover:bg-[#6C3CE9]/20 transition-colors shadow-[0_0_15px_0_rgba(46,255,212,0.2)] cursor-pointer group z-50 ${
                  isMobile ? 'left-4 top-4' : '-left-12 top-6'
                }`}
                variants={resetButtonVariants}
                initial="hidden"
                animate="visible"
                title="Reset Chat"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 group-hover:text-[#2EFFD4] transition-colors" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </motion.button>

              {/* KOL Treasury Button (Desktop) */}
              {!isMobile && (
                <motion.button
                  onClick={toggleKOLView}
                  className="absolute -right-[180px] top-1/2 -translate-y-1/2 flex items-center gap-2 px-4 py-2.5 bg-[#1F2937] border border-[#FFD700]/30 rounded-xl text-white hover:bg-[#1F2937]/90 transition-all duration-300 shadow-[0_0_15px_0_rgba(255,215,0,0.2)] group cursor-pointer z-50"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="text-sm font-medium bg-gradient-to-r from-[#FFD700] to-[#FFA500] bg-clip-text text-transparent">
                    KOL Treasury
                  </span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 text-[#FFD700] group-hover:scale-110 transition-transform duration-300" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2}
                      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-14 0l2-2m12 0l-2-2"
                    />
                  </svg>
                </motion.button>
              )}

              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-[#6C3CE9]/30 bg-[#1F2937] shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#6C3CE9] rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                      <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-medium text-white">Stratos AI</h2>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={onCloseAction}
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content Container with Views */}
              <div className="relative flex-1 min-h-0 overflow-hidden bg-[#1F2937]">
                {/* Chat View */}
                <motion.div
                  className="absolute inset-0 w-full h-full flex flex-col"
                  variants={viewTransitionVariants}
                  initial="chat"
                  animate={isKOLView ? "kol" : "chat"}
                >
                  {/* Messages Container */}
                  <div 
                    ref={scrollContainerRef}
                    className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 messages-container scroll-smooth bg-[#1F2937]"
                    onScroll={handleScroll}
                  >
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
                          {message.colorValue ? (
                            <p>
                              {message.content.split(message.colorValue.value).map((part, i, arr) => (
                                <React.Fragment key={`${message.id}-color-${i}`}>
                                  {part}
                                  {i < arr.length - 1 && message.colorValue && (
                                    <span style={{ color: message.colorValue.color }}>
                                      {message.colorValue.value}
                                    </span>
                                  )}
                                </React.Fragment>
                              ))}
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {message.content.includes('Key Insights:') || message.content.includes('Significant Events:') ? (
                                <>
                                  {(() => {
                                    const sections = {
                                      insights: message.content.includes('Key Insights:') ? 
                                        message.content.substring(
                                          message.content.indexOf('Key Insights:'),
                                          message.content.includes('Significant Events:') ? 
                                            message.content.indexOf('Significant Events:') : 
                                            undefined
                                        ) : '',
                                      events: message.content.includes('Significant Events:') ?
                                        message.content.substring(message.content.indexOf('Significant Events:')) : ''
                                    };

                                    return (
                                      <>
                                        {/* Render Key Insights section */}
                                        {sections.insights && (
                                          <div className="mb-4">
                                            <p className="font-medium mb-2">Key Insights:</p>
                                            {(() => {
                                              const lines = sections.insights.split('\n').slice(1);
                                              const isExpanded = expandedSections[message.id]?.insights;
                                              const displayLines = isExpanded ? lines : lines.slice(0, 1);
                                              
                                              return (
                                                <>
                                                  {displayLines.map((line, index) => (
                                                    <div key={`${message.id}-insight-${index}`} className="pl-4 -mt-1">
                                                      <p className="whitespace-pre-line">{line.trim()}</p>
                                                    </div>
                                                  ))}
                                                  {lines.length > 1 && (
                                                    <button
                                                      onClick={() => toggleSection(message.id, 'insights')}
                                                      className="text-[#2EFFD4] text-sm mt-2 hover:text-[#2EFFD4]/80 transition-colors cursor-pointer"
                                                    >
                                                      {isExpanded ? 'Show less' : `Show ${lines.length - 1} more`}
                                                    </button>
                                                  )}
                                                </>
                                              );
                                            })()}
                                          </div>
                                        )}

                                        {/* Render Significant Events section */}
                                        {sections.events && (
                                          <div>
                                            <p className="font-medium mb-2">Significant Events:</p>
                                            {(() => {
                                              const lines = sections.events.split('\n').slice(1);
                                              const isExpanded = expandedSections[message.id]?.events;
                                              const displayLines = isExpanded ? lines : lines.slice(0, 1);
                                              
                                              return (
                                                <>
                                                  {displayLines.map((line, index) => (
                                                    <div key={`${message.id}-event-${index}`} className="pl-4 -mt-1">
                                                      <p className="whitespace-pre-line">{line.trim()}</p>
                                                    </div>
                                                  ))}
                                                  {lines.length > 1 && (
                                                    <button
                                                      onClick={() => toggleSection(message.id, 'events')}
                                                      className="text-[#2EFFD4] text-sm mt-2 hover:text-[#2EFFD4]/80 transition-colors cursor-pointer"
                                                    >
                                                      {isExpanded ? 'Show less' : `Show ${lines.length - 1} more`}
                                                    </button>
                                                  )}
                                                </>
                                              );
                                            })()}
                                          </div>
                                        )}
                                      </>
                                    );
                                  })()}
                                </>
                              ) : (
                                <p>{message.content}</p>
                              )}
                            </div>
                          )}
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
                    <div ref={messagesEndRef} className="h-0" /> {/* Add height-0 to prevent unwanted spacing */}
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
                        className="bg-[#2EFFD4] text-black rounded-lg px-4 py-2 hover:bg-opacity-80 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        disabled={isLoading || !input.trim()}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </form>
                  </div>
                </motion.div>

                {/* KOL Treasury View */}
                <motion.div
                  className="absolute inset-0 w-full h-full flex flex-col bg-[#1F2937]/80"
                  variants={kolViewVariants}
                  initial="hidden"
                  animate={isKOLView ? "visible" : "hidden"}
                >
                  {/* KOL Treasury Header */}
                  <div className="flex items-center justify-between p-5 border-b border-[#FFD700]/30 shrink-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-[#FFD700] rounded-full flex items-center justify-center">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5 text-[#1F2937]" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2}
                            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-14 0l2-2m12 0l-2-2"
                          />
                        </svg>
                      </div>
                      <h2 className="text-xl font-medium text-white">KOL Treasury</h2>
                    </div>
                    <button
                      onClick={toggleKOLView}
                      className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* KOL Treasury Content */}
                  <div className="flex-1 overflow-y-auto">
                    {kolTweets.length > 0 ? (
                      <KOLTweetList tweets={kolTweets} />
                    ) : (
                      <div className="text-white text-center py-8">
                        <p className="text-lg mb-4">KOL Treasury Content</p>
                        <p className="text-gray-400">Your collected KOL tweets will appear here</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Add Confirmation Dialog */}
              <AnimatePresence>
                {showResetConfirm && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 rounded-xl"
                    variants={confirmDialogVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <div className="bg-[#1F2937] border border-[#6C3CE9]/30 rounded-lg p-6 max-w-sm mx-4 shadow-lg">
                      <h3 className="text-lg font-medium text-white mb-4">Reset Chat?</h3>
                      <p className="text-gray-300 mb-6">This will delete all messages and cannot be undone.</p>
                      <div className="flex justify-end space-x-4">
                        <button
                          onClick={() => setShowResetConfirm(false)}
                          className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={confirmReset}
                          className="px-4 py-2 text-sm font-medium bg-red-500/20 text-red-300 hover:bg-red-500/30 hover:text-red-200 rounded transition-colors"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
} 