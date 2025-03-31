import { NextResponse } from 'next/server'
import { analyzeCryptoSentiment } from '@/app/utils/twitterAnalyzer'

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()
    
    const analysis = await analyzeCryptoSentiment(prompt)
    return NextResponse.json(analysis)

  } catch (error) {
    console.error('Error in chat route:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to process request' },
      { status: 500 }
    )
  }
} 