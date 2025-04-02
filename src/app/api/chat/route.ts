import { analyzeCryptoSentiment } from '@/app/utils/twitterAnalyzer'

export async function POST(request: Request) {
  try {
    // Check environment variables first
    if (!process.env.DEEPSEEK_API_KEY) {
      console.error('DEEPSEEK_API_KEY is not configured')
      return new Response(JSON.stringify({
        success: false,
        messages: [{
          type: 'mood',
          content: 'API configuration error. Please check server environment setup.'
        }]
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }

    const { prompt } = await request.json()
    
    if (!prompt) {
      return new Response(JSON.stringify({
        success: false,
        messages: [{
          type: 'mood',
          content: 'No prompt provided'
        }]
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }

    const result = await analyzeCryptoSentiment(prompt)
    
    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('API Error:', error)
    
    return new Response(JSON.stringify({
      success: false,
      messages: [{
        type: 'mood',
        content: error instanceof Error ? error.message : 'An unexpected error occurred'
      }]
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
} 