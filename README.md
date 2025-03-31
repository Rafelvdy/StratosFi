# StratosFi - Crypto Sentiment Analysis Platform

## Overview
StratosFi is a modern Web3 platform that provides real-time cryptocurrency sentiment analysis through Twitter data integration. The platform helps users make informed trading decisions by analyzing social media sentiment and market trends.

## Features
- **Real-time Sentiment Analysis**: Analyze Twitter discussions about cryptocurrencies
- **Flexible Time Ranges**: Query sentiment data from 1 hour up to 4 weeks
- **Support for Major Cryptocurrencies**: Including BTC, ETH, SOL, ADA, DOT, AVAX, and more
- **Interactive Chat Interface**: Natural language processing for easy data queries
- **Comprehensive Tweet Metrics**: Track likes, retweets, replies, and user engagement
- **Web3 Integration**: Built-in Solana wallet connection support
- **Modern UI**: Space-themed design with dynamic animations
- **Responsive Design**: Fully responsive across all devices

## Tech Stack
- **Frontend**: Next.js 13+, TypeScript, Tailwind CSS
- **API Integration**: Twitter API via twitterapi.io
- **Authentication**: Environment-based API key management
- **State Management**: React hooks and context
- **UI Components**: Custom-built components with Tailwind
- **Web3**: Solana Web3.js and Wallet Adapter
- **Animations**: Framer Motion

## Project Structure
```
stratosfi/
├── src/
│   ├── app/            # Next.js app router pages
│   │   ├── components/ # Page-specific components
│   │   ├── chat/      # Chat interface
│   │   ├── utils/     # Utility functions
│   │   └── providers/ # Context providers
│   └── components/    # Shared UI components
```

## Getting Started

### Prerequisites
- Node.js 16+
- pnpm (recommended package manager)
- Twitter API key from twitterapi.io

### Environment Setup
Create a `.env.local` file in the root directory:
```env
TWITTER_API_KEY=your_api_key_here
```

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/stratosfi.git

# Install dependencies
pnpm install

# Run development server
pnpm dev
```

## Usage
1. Launch the application
2. Use the chat interface to query cryptocurrency sentiment
3. Format your queries like: "What is BTC like in the last hour?"
4. View real-time sentiment analysis results

## Query Examples
- "How is ETH doing in the last 24 hours?"
- "Show me BTC sentiment for the past week"
- "What's the sentiment for SOL in the last hour?"

## Time Range Support
- Hours: 1h minimum
- Days: 1-30 days
- Weeks: Up to 4 weeks

## Features in Detail

### Sentiment Analysis
- Real-time processing of Twitter data
- Social media sentiment tracking
- Customizable time ranges
- Support for major cryptocurrencies

### Web3 Integration
- Solana wallet connection
- Support for Phantom and Solflare wallets
- Devnet integration
- Wallet state management

### User Interface
- Dynamic space-themed background
- Smooth animations with Framer Motion
- Responsive design
- Interactive chat panel
- Trading bot panel
- Wallet connection panel

## Development Guidelines
- Follow TypeScript best practices
- Maintain component modularity
- Ensure proper error handling
- Write clean, maintainable code
- Use Tailwind CSS for styling

## Legal Notice
© 2024 StratosFi. All rights reserved. This is a private repository and proprietary software. No part of this codebase may be reproduced, distributed, or transmitted in any form or by any means without the prior written permission of the copyright holder.

## Acknowledgments
- Built with twitterapi.io
- Powered by Next.js and TypeScript
- Solana blockchain integration
