import { TwitterApi } from './twitterApi';
import { analyzeTweets } from './nlpAnalyzer';

// Types
export interface SearchParams {
    ticker: string;
    timeframe?: string;
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

// Core function
export function extractSearchParams(message: string): SearchParams {
    // Extract ticker
    const ticker = message.match(/\b(BTC|ETH|SOL|DOGE|XRP|ADA)\b/i)?.[0] || '';
    
    // Update timeframe extraction to handle natural language
    let timeframe = '24h'; // default
    
    // Handle "last X" format
    const lastTimeMatch = message.match(/last\s+(hour|day|week|month)/i);
    if (lastTimeMatch) {
        const unit = lastTimeMatch[1].toLowerCase();
        switch (unit) {
            case 'hour': timeframe = '1h'; break;
            case 'day': timeframe = '24h'; break;
            case 'week': timeframe = '7d'; break;
            case 'month': timeframe = '30d'; break;
        }
    }
    
    // Handle "X hours/days/weeks/months" format
    const numberTimeMatch = message.match(/(\d+)\s*(hours?|days?|weeks?|months?)/i);
    if (numberTimeMatch) {
        const [, value, unit] = numberTimeMatch;
        const numValue = parseInt(value);
        
        if (unit.startsWith('hour')) {
            timeframe = numValue === 1 ? '1h' : '24h';
        } else if (unit.startsWith('day')) {
            timeframe = numValue === 1 ? '24h' : '7d';
        } else if (unit.startsWith('week')) {
            timeframe = numValue === 1 ? '7d' : '30d';
        } else if (unit.startsWith('month')) {
            timeframe = '30d';
        }
    }

    return { ticker, timeframe };
}

// Function to get mood color
function getMoodColor(mood: number): string {
    if (mood < 2.5) return '<span style="color: #ff4444">'; // Red for bearish/negative
    if (mood <= 3.5) return '<span style="color: #ffa500">'; // Orange for neutral
    return '<span style="color: #00c853">'; // Green for bullish/positive
}

// Main analysis function
export async function analyzeCryptoSentiment(message: string): Promise<{
    success: boolean;
    message: string;
}> {
    const params = extractSearchParams(message);
    if (!params.ticker) {
        return {
            success: false,
            message: "I couldn't understand which cryptocurrency you're asking about. Please specify a cryptocurrency name or symbol."
        };
    }

    try {
        const tweets = await TwitterApi.fetchTweets(params);
        
        if (tweets.community_tweets.length === 0) {
            return {
                success: false,
                message: `No community tweets found for ${params.ticker} in the specified timeframe.`
            };
        }

        const analysis = await analyzeTweets(tweets.community_tweets);
        const moodColor = getMoodColor(analysis.averageMood);
        
        let response = `Community Mood for ${params.ticker}: ${moodColor}${analysis.averageMood.toFixed(1)}</span>/5\n\n`;
        
        if (analysis.events.length > 0) {
            response += "Significant Events:\n" + analysis.events.join("\n") + "\n\n";
        }
        
        if (analysis.insights.length > 0) {
            response += "Key Insights:\n" + analysis.insights.join("\n");
        }

        return {
            success: true,
            message: response
        };

    } catch (error) {
        console.error('Error in sentiment analysis:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to analyze sentiment'
        };
    }
} 