'use client'

import Image from 'next/image'

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <header className="fixed top-0 w-full bg-background/80 backdrop-blur-md z-50 border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Image
              src="/logos/Stratos Bar logo (white).png"
              alt="Stratos Logo"
              width={120}
              height={65}
              priority
              className="select-none"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-8">
          {/* Left Sidebar - Future Navigation */}
          <div className="lg:col-span-3 hidden lg:block">
            <div className="bg-neutral p-6 rounded-xl">
              <h2 className="text-xl font-semibold text-white mb-4">Navigation</h2>
              <nav className="space-y-2">
                <button className="w-full text-left px-4 py-2 rounded-lg bg-primary/20 text-white hover:bg-primary/30 transition-colors">
                  Chat
                </button>
              </nav>
            </div>
          </div>

          {/* Main Chat Area - Placeholder for future implementation */}
          <div className="lg:col-span-9">
            <div className="bg-neutral p-8 rounded-xl min-h-[600px] flex flex-col">
              <h1 className="text-3xl font-bold text-white mb-6">AI Trading Assistant</h1>
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <p className="text-gray-400">Chat interface coming soon...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 