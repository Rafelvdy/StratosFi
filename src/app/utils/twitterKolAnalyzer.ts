import { format, sub } from 'date-fns'

// List of prominent crypto KOLs
const KOL_HANDLES = [
  'VitalikButerin',
  'cz_binance',
  'SBF_FTX',
  'michaeljburry',
  'elonmusk',
  'CryptoCapo_',
  'PeterLBrandt',
  'RaoulGMI',
  'cryptowhale',
  'WClementeIII'
]

export interface Tweet {
  content: string
  author: string
  timestamp: string
  metrics: {
    likes: number
    retweets: number
    replies: number
  }
}

interface TwitterSearchParams {
  ticker: string
  timeframe: string
  startTime: string
  endTime: string
}

// Extract ticker and timeframe from user message
export function extractSearchParams(message: string): TwitterSearchParams | null {
  try {
    // Match common crypto tickers (3-5 characters, case insensitive)
    const tickerMatch = message.match(/\b(btc|eth|sol|doge|xrp|ada|dot|bnb|link)\b/i)
    if (!tickerMatch) return null
    
    // Match timeframe patterns
    const timeMatch = message.match(/\b(\d+\s*(?:hour|hr|day|week|month|h|d|w|m)s?)\b/i)
    if (!timeMatch) return null

    const ticker = tickerMatch[0].toUpperCase()
    const timeframe = normalizeTimeframe(timeMatch[0])
    
    // Calculate time range
    const now = new Date()
    const { startTime, endTime } = calculateTimeRange(timeframe, now)

    return {
      ticker,
      timeframe,
      startTime,
      endTime
    }
  } catch (error) {
    console.error('Error extracting search parameters:', error)
    return null
  }
}

// Normalize timeframe to Twitter format
function normalizeTimeframe(timeframe: string): string {
  const normalized = timeframe.toLowerCase().trim()
  
  // Convert various time formats to a standardized format
  if (normalized.includes('hour') || normalized.includes('hr') || normalized.endsWith('h')) {
    const hours = parseInt(normalized.match(/\d+/)?.[0] || '1')
    return `${hours}h`
  }
  
  if (normalized.includes('day') || normalized.endsWith('d')) {
    const days = parseInt(normalized.match(/\d+/)?.[0] || '1')
    return `${days}d`
  }
  
  if (normalized.includes('week') || normalized.endsWith('w')) {
    const weeks = parseInt(normalized.match(/\d+/)?.[0] || '1')
    return `${weeks * 7}d`
  }
  
  if (normalized.includes('month') || normalized.endsWith('m')) {
    const months = parseInt(normalized.match(/\d+/)?.[0] || '1')
    return `${months * 30}d`
  }
  
  return '24h' // Default timeframe
}

// Calculate start and end times for the Twitter query
function calculateTimeRange(timeframe: string, now: Date): { startTime: string; endTime: string } {
  const amount = parseInt(timeframe.match(/\d+/)?.[0] || '24')
  const unit = timeframe.slice(-1) as 'h' | 'd'
  
  let startTime: Date
  if (unit === 'h') {
    startTime = sub(now, { hours: amount })
  } else {
    startTime = sub(now, { days: amount })
  }
  
  return {
    startTime: format(startTime, "yyyy-MM-dd'T'HH:mm:ss'.000Z'"),
    endTime: format(now, "yyyy-MM-dd'T'HH:mm:ss'.000Z'")
  }
}

// Construct Twitter search query
export function constructTwitterQuery(params: TwitterSearchParams): string {
  const kolHandles = KOL_HANDLES.map(handle => `from:${handle}`).join(' OR ')
  const tickerVariations = [params.ticker, `#${params.ticker}`].join(' OR ')
  
  return `(${kolHandles}) (${tickerVariations}) until:${params.endTime} since:${params.startTime}`
} 