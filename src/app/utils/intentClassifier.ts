export type IntentType = 'general_sentiment' | 'kol_analysis' | 'community_mood'

const KOL_KEYWORDS = ['expert', 'kol', 'influencer', 'analyst', 'professional', 'whale']
const COMMUNITY_KEYWORDS = ['community', 'retail', 'public', 'traders', 'people', 'everyone']

export function classifyIntent(message: string): IntentType {
  const lowerMessage = message.toLowerCase()
  
  // Check for KOL-related keywords
  if (KOL_KEYWORDS.some(keyword => lowerMessage.includes(keyword))) {
    return 'kol_analysis'
  }
  
  // Check for community-related keywords
  if (COMMUNITY_KEYWORDS.some(keyword => lowerMessage.includes(keyword))) {
    return 'community_mood'
  }
  
  // Default to general sentiment
  return 'general_sentiment'
} 