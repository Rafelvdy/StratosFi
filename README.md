# StratosFi - Cryptocurrency Sentiment Analysis Assistant

## Overview
StratosFi is an AI-powered cryptocurrency sentiment analysis platform that provides real-time community mood analysis and insights for major cryptocurrencies. The application integrates with Solana wallets for secure user authentication and chat history persistence.

## Features

### Sentiment Analysis
- **Real-time Mood Analysis**: Analyzes community sentiment for major cryptocurrencies (BTC, ETH, SOL, DOGE, XRP, ADA)
- **Timeframe Support**: Supports various analysis timeframes (1 hour, 24 hours, 1 week, 1 month)
- **Mood Visualization**: Displays sentiment scores with color-coded indicators:
  - Red (< 2.5/5): Bearish sentiment
  - Orange (2.5-3.5/5): Neutral sentiment
  - Green (> 3.5/5): Bullish sentiment

### Chat Interface
- **Interactive AI Assistant**: Conversational interface for sentiment analysis queries
- **Multi-Message Format**: Structured response format with:
  1. Community mood score (color-coded)
  2. Key market insights
  3. Significant events
- **Message History**: Persistent chat history tied to user's wallet address

### Wallet Integration
- **Solana Wallet Support**: Compatible with major Solana wallets (Phantom, Solflare)
- **Secure Authentication**: Wallet-based user authentication
- **Data Persistence**: Chat history stored and retrieved based on wallet address
- **Automatic Sync**: Seamless synchronization of chat history across sessions

## Technical Implementation

### Core Components
1. **Twitter Analysis Engine**
   - Fetches and analyzes community tweets
   - Implements sentiment scoring algorithm
   - Filters and categorizes market events and insights

2. **Chat System**
   - Real-time message processing
   - Structured response formatting
   - Debounced chat history saving

3. **Wallet Integration**
   - Secure wallet connection handling
   - Local storage management for chat persistence
   - Automatic state synchronization

### API Structure
- **Endpoint**: `/api/chat`
- **Method**: POST
- **Request Format**: `{ prompt: string }`
- **Response Format**:
```typescript
{
  success: boolean;
  messages: Array<{
    type: 'mood' | 'insights' | 'events';
    content: string;
    colorValue?: {
      value: string;
      color: string;
    };
  }>;
}
```

## Usage Examples

### Basic Query
```
User: "what is sol like in the last hour"
Assistant: 
1. "Community Mood for SOL: 3.8/5" (in green)
2. "Key Insights: [relevant market insights]"
3. "Significant Events: [relevant events]"
```

### Timeframe Specification
Supports natural language timeframes:
- "last hour"
- "last 24 hours"
- "last week"
- "last month"

## Technical Requirements
- Node.js
- Next.js
- Solana Web3.js
- Twitter API access
- DeepSeek API key for sentiment analysis

## Environment Setup
Required environment variables:
- `DEEPSEEK_API_KEY`: For sentiment analysis
- `TWITTER_API_KEY`: For tweet fetching
- Additional configuration for Solana network and RPC endpoints

## Security Features
- Secure wallet integration
- API key protection
- Rate limiting
- Error handling and validation
- Secure data persistence

## Error Handling
- Graceful handling of API failures
- User-friendly error messages
- Automatic retry mechanisms
- Connection state management

## Future Enhancements
- Support for additional cryptocurrencies
- Advanced technical analysis integration
- Enhanced data visualization
- Multi-wallet support
- Historical trend analysis
