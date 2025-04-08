# StratosFi - Cryptocurrency Sentiment Analysis Assistant

## Overview
StratosFi is an AI-powered cryptocurrency sentiment analysis platform that provides real-time community mood analysis and insights for major cryptocurrencies. The application integrates with Solana wallets for secure user authentication and chat history persistence. Designed and optimized for deployment on virtual machines, with proven deployment on Debian 12 (bookworm).

## Features

### Sentiment Analysis
- **Real-time Mood Analysis**: Analyzes community sentiment for major cryptocurrencies
- **Supported Cryptocurrencies**:
  - Core Tokens: BTC, ETH, SOL, DOGE, XRP, ADA
  - Additional Support: DOT (Polkadot), AVAX (Avalanche), ATOM (Cosmos)
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
- **Expandable Interface**: Dynamic panel sizing for better readability
- **Reset Functionality**: Easy chat history reset with confirmation dialog

### Wallet Integration
- **Solana Wallet Support**: Compatible with major Solana wallets (Phantom, Solflare)
- **Secure Authentication**: Wallet-based user authentication
- **Data Persistence**: Chat history stored and retrieved based on wallet address
- **Automatic Sync**: Seamless synchronization of chat history across sessions
- **KOL Treasury Integration**: Special features for Key Opinion Leader analysis

## Technical Implementation

### Core Components
1. **Twitter Analysis Engine**
   - Advanced tweet filtering and analysis
   - Sentiment scoring with DeepSeek integration
   - Cross-ticker relationship analysis
   - Spam and bot filtering
   - KOL identification and tracking

2. **Chat System**
   - Real-time message processing
   - Structured response formatting
   - Debounced chat history saving
   - Expandable UI with smooth animations
   - Message categorization and formatting

3. **Wallet Integration**
   - Secure wallet connection handling
   - Local storage management for chat persistence
   - Automatic state synchronization
   - Cross-session data management

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

## Deployment

### VM Requirements
- **Recommended OS**: Debian 12 (bookworm)
- **Minimum Specs**:
  - 2 CPU cores
  - 4GB RAM
  - 20GB SSD storage
- **Network**: Stable internet connection with port 3000 accessible

### Installation Steps
1. Clone repository
2. Install dependencies:
   ```bash
   # Using npm
   npm install
   # OR using pnpm
   pnpm install
   ```
3. Set up environment variables
4. Build application:
   ```bash
   # Using npm
   npm run build
   # OR using pnpm
   pnpm build
   ```
5. Start server:
   ```bash
   # Using npm
   npm start
   # OR using pnpm
   pnpm start
   ```

### Production Deployment
```bash
# Install PM2 for process management
npm install -g pm2
# OR using pnpm
pnpm add -g pm2

# Build and start the application
# Using npm
npm run build
pm2 start npm --name "stratosfi" -- start

# OR using pnpm
pnpm build
pm2 start pnpm --name "stratosfi" -- start

# Monitor the application
pm2 monitor
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

### Cross-Ticker Analysis
```
User: "how is ETH affecting BTC today"
Assistant:
[Provides relationship analysis between cryptocurrencies]
```

## Technical Requirements
- Node.js 18+
- Next.js 13+
- Solana Web3.js
- Twitter API access
- DeepSeek API key for sentiment analysis
- PM2 for production deployment

## Environment Setup
Required environment variables:
```env
DEEPSEEK_API_KEY=your_api_key
TWITTER_API_KEY=your_twitter_key
NEXT_PUBLIC_RPC_ENDPOINT=your_solana_rpc
DATABASE_URL=your_database_url
```

## Security Features
- Secure wallet integration
- API key protection
- Rate limiting
- Error handling and validation
- Secure data persistence
- Cross-Origin Resource Sharing (CORS) protection
- Input sanitization and validation

## Error Handling
- Graceful handling of API failures
- User-friendly error messages
- Automatic retry mechanisms
- Connection state management
- Rate limit handling
- API fallback strategies

## Monitoring and Maintenance
- PM2 process monitoring
- Error logging and tracking
- Performance metrics
- Automatic restart on failure
- Memory usage monitoring
- API quota management

## Future Enhancements
- Support for additional cryptocurrencies
- Advanced technical analysis integration
- Enhanced data visualization
- Multi-wallet support
- Historical trend analysis
- Machine learning model improvements
- Real-time price correlation
- Advanced KOL tracking features

## Contributing
Contributions are welcome! Please read our contributing guidelines and submit pull requests for any enhancements.

## License
This project is licensed under the **GNU Affero General Public License v3.0 (AGPLv3)**.

See the [LICENSE](LICENSE) file for the full license text. The core requirement is that if you run a modified version of this software as a network service, you must make the source code of your modified version available to its users under the AGPLv3.
