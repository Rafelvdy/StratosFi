import { NextResponse } from 'next/server'
import { analyzeCryptoSentiment } from '@/app/utils/twitterAnalyzer'

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()
    // DEBUG START
    console.log('DEBUG: Received prompt:', prompt);
    // DEBUG END
    
    const analysis = await analyzeCryptoSentiment(prompt)
    // DEBUG START
    console.log('DEBUG: Analysis result:', JSON.stringify(analysis, null, 2));
    // DEBUG END
    return NextResponse.json(analysis)

  } catch (error) {
    console.error('Error in chat route:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to process request' },
      { status: 500 }
    )
  }
} 