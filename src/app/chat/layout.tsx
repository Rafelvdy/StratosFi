import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'StratosFi | AI Chat',
  description: 'Interact with our AI-powered crypto sentiment analysis assistant',
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 