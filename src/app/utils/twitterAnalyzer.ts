import { TwitterApi } from './twitterApi';

// Types
export interface SearchParams {
    ticker: string;
    timeframe: string;
}

export interface Tweet {
    id: string;
    text: string;
    created_at: string;
    metrics: {
        likes: number;
        retweets: number;
        replies: number;
    };
    author: {
        username: string;
        followers_count: number;
    };
}

export interface KOLTweet extends Tweet {
    influence_score: number;
    time_factor: number;
}

export interface TweetCategories {
    kol_tweets: KOLTweet[];
    community_tweets: Tweet[];
}

export interface AnalysisResponse {
    success: boolean;
    message: string;
    params?: SearchParams;
    tweets?: TweetCategories;
}

// Core function
export function extractSearchParams(userMessage: string): SearchParams {
    const message = userMessage.toLowerCase();
    
    // Extract ticker
    const tickerMatch = message.match(/\b(bitcoin|btc|eth|ethereum|sol|solana|ada|cardano|dot|polkadot|avax|avalanche|atom|cosmos)\b/);
    const ticker = tickerMatch ? tickerMatch[1] : '';
    
    // Extract timeframe with constraints
    const lastTimeMatch = message.match(/last\s+(hour|day|week|month)/);
    const numberTimeMatch = message.match(/(\d+\.?\d*)\s*(hour|day|week|month)/);
    let timeframe = '24h'; // default
    let invalidTimeframe = false;
    let timeframeError = '';

    if (lastTimeMatch) {
        const [, unit] = lastTimeMatch;
        if (unit === 'month') {
            invalidTimeframe = true;
            timeframeError = 'Invalid timeframe:\nMinimum - 1 Hour\nMaximum - 4 Weeks';
        } else {
            timeframe = `1${unit[0]}`;
        }
    } else if (numberTimeMatch) {
        const [, value, unit] = numberTimeMatch;
        const numValue = parseFloat(value);

        // Check if the value is a decimal
        if (!Number.isInteger(numValue)) {
            invalidTimeframe = true;
            timeframeError = 'Only whole numbers allowed for timeframe';
        } else if (unit === 'hour' && numValue >= 1) {
            timeframe = `${numValue}h`;
        } else if (unit === 'day') {
            timeframe = `${numValue}d`;
        } else if (unit === 'week') {
            if (numValue <= 4) {
                timeframe = `${numValue}w`;
            } else {
                invalidTimeframe = true;
                timeframeError = 'Invalid timeframe:\nMinimum - 1 Hour\nMaximum - 4 Weeks';
            }
        } else if (unit === 'month') {
            invalidTimeframe = true;
            timeframeError = 'Invalid timeframe:\nMinimum - 1 Hour\nMaximum - 4 Weeks';
        }

        if (unit === 'hour' && numValue < 1) {
            invalidTimeframe = true;
            timeframeError = 'Invalid timeframe:\nMinimum - 1 Hour\nMaximum - 4 Weeks';
        }
    }
    
    if (!ticker) {
        throw new Error('Please specify a cryptocurrency (e.g., BTC, ETH, SOL)');
    }

    if (invalidTimeframe) {
        throw new Error(timeframeError);
    }
    
    return { ticker, timeframe };
}

// Main analysis function
export async function analyzeCryptoSentiment(userMessage: string): Promise<AnalysisResponse> {
    try {
        const params = extractSearchParams(userMessage);
        const tweets = await TwitterApi.fetchTweets(params);
        
        const totalTweets = tweets.kol_tweets.length + tweets.community_tweets.length;
        
        return {
            success: true,
            message: `Found ${totalTweets} relevant tweets for ${params.ticker} in the last ${params.timeframe} (${tweets.kol_tweets.length} KOL, ${tweets.community_tweets.length} Community)`,
            params,
            tweets
        };
    } catch (error) {
        console.error('Error in sentiment analysis:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
} 