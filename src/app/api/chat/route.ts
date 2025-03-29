import { NextResponse } from 'next/server'
import { classifyIntent, IntentType } from '@/app/utils/intentClassifier'

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()
    
    // Classify the user's intent
    const intent: IntentType = classifyIntent(prompt)
    console.log('Detected intent:', intent)

    // TODO: Add your AI processing logic here
    // For now, we'll return a mock response
    const response = {
      message: prompt,
      intent,
      sentiment: 0.5,
      mood: 0.3
    }
 
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error processing chat request:', error)
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
} 