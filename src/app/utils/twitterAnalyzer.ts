import { TwitterApi } from './twitterApi';
import { analyzeTweets } from './nlpAnalyzer';

// Types
export interface SearchParams {
    ticker: string;
    timeframe?: string;
}

export interface AnalysisMessage {
    type: 'mood' | 'insights' | 'events';
    content: string;
    colorValue?: {
        value: string;
        color: string;
    };
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
    // Extract ticker with expanded pattern to include full names and variations
    const tickerPattern = /\b(BTC|ETH|SOL|DOGE|XRP|ADA|bitcoin|ethereum|solana|dogecoin|ripple|cardano)\b/i;
    const prefixPattern = /[$#](btc|eth|sol|doge|xrp|ada)\b/i;
    
    // Try to match standard tickers or full names
    let ticker = message.match(tickerPattern)?.[0] || '';
    
    // If no match, try prefix pattern
    if (!ticker) {
        ticker = message.match(prefixPattern)?.[0] || '';
    }
    
    // Convert to uppercase ticker if it's a full name
    if (ticker.toLowerCase() === 'bitcoin') ticker = 'BTC';
    else if (ticker.toLowerCase() === 'ethereum') ticker = 'ETH';
    else if (ticker.toLowerCase() === 'solana') ticker = 'SOL';
    else if (ticker.toLowerCase() === 'dogecoin') ticker = 'DOGE';
    else if (ticker.toLowerCase() === 'ripple') ticker = 'XRP';
    else if (ticker.toLowerCase() === 'cardano') ticker = 'ADA';
    else if (ticker.startsWith('$') || ticker.startsWith('#')) {
        ticker = ticker.substring(1).toUpperCase();
    } else {
        ticker = ticker.toUpperCase();
    }

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
    if (mood < 2.5) return '#ff4444'; // Red for bearish/negative
    if (mood <= 3.5) return '#ffa500'; // Orange for neutral
    return '#00c853'; // Green for bullish/positive
}

// Add function to check if content is relevant to ticker
function isTickerRelevant(content: string, ticker: string): boolean {
    const tickerPattern = new RegExp(`\\b${ticker}\\b|\\$${ticker}\\b|#${ticker}\\b`, 'i');
    return tickerPattern.test(content);
}

// Add function to check for cross-ticker relationships
function hasCrossTickerRelationship(content: string, mainTicker: string, mentionedTicker: string): boolean {
    const relationshipPatterns = [
        `${mentionedTicker}.*impact.*${mainTicker}`,
        `${mentionedTicker}.*affect.*${mainTicker}`,
        `${mentionedTicker}.*influence.*${mainTicker}`,
        `correlation.*${mentionedTicker}.*${mainTicker}`,
        `relationship.*${mentionedTicker}.*${mainTicker}`
    ];
    
    return relationshipPatterns.some(pattern => 
        new RegExp(pattern, 'i').test(content)
    );
}

// Main analysis function
export async function analyzeCryptoSentiment(message: string): Promise<{
    success: boolean;
    messages: AnalysisMessage[];
}> {
    const params = extractSearchParams(message);
    if (!params.ticker) {
        return {
            success: false,
            messages: [{
                type: 'mood',
                content: "I couldn't understand which cryptocurrency you're asking about. Please specify a cryptocurrency name or symbol."
            }]
        };
    }

    try {
        const tweets = await TwitterApi.fetchTweets(params);
        
        if (tweets.community_tweets.length === 0) {
            return {
                success: false,
                messages: [{
                    type: 'mood',
                    content: `No community tweets found for ${params.ticker} in the specified timeframe.`
                }]
            };
        }

        const analysis = await analyzeTweets(tweets.community_tweets);
        const messages: AnalysisMessage[] = [];
        
        // Add mood message
        messages.push({
            type: 'mood',
            content: `Community Mood for ${params.ticker}: ${analysis.averageMood.toFixed(1)}/5`,
            colorValue: {
                value: analysis.averageMood.toFixed(1),
                color: getMoodColor(analysis.averageMood)
            }
        });

        // Filter and format insights
        if (analysis.insights && analysis.insights.length > 0) {
            const relevantInsights = analysis.insights
                .filter(insight => {
                    if (!insight) return false;
                    
                    // Check if insight is directly about the queried ticker
                    if (isTickerRelevant(insight, params.ticker)) return true;
                    
                    // Check for cross-ticker relationships
                    const otherTickers = ['BTC', 'ETH', 'SOL', 'DOGE', 'XRP', 'ADA']
                        .filter(t => t !== params.ticker.toUpperCase());
                    
                    return otherTickers.some(otherTicker => 
                        insight.includes(otherTicker) && 
                        hasCrossTickerRelationship(insight, params.ticker.toUpperCase(), otherTicker)
                    );
                })
                .map(insight => `• ${insight.trim()}`);

            if (relevantInsights.length > 0) {
                messages.push({
                    type: 'insights',
                    content: `Key Insights:\n${relevantInsights.join('\n')}`
                });
            }
        }

        // Filter and format events
        if (analysis.events && analysis.events.length > 0) {
            const relevantEvents = analysis.events
                .filter(event => {
                    if (!event) return false;
                    
                    // Check if event is directly about the queried ticker
                    if (isTickerRelevant(event, params.ticker)) return true;
                    
                    // Check for cross-ticker relationships
                    const otherTickers = ['BTC', 'ETH', 'SOL', 'DOGE', 'XRP', 'ADA']
                        .filter(t => t !== params.ticker.toUpperCase());
                    
                    return otherTickers.some(otherTicker => 
                        event.includes(otherTicker) && 
                        hasCrossTickerRelationship(event, params.ticker.toUpperCase(), otherTicker)
                    );
                })
                .map(event => `• ${event.trim()}`);

            if (relevantEvents.length > 0) {
                messages.push({
                    type: 'events',
                    content: `Significant Events:\n${relevantEvents.join('\n')}`
                });
            }
        }

        return {
            success: true,
            messages
        };

    } catch (error) {
        console.error('Error in sentiment analysis:', error);
        return {
            success: false,
            messages: [{
                type: 'mood',
                content: error instanceof Error ? error.message : 'Failed to analyze sentiment'
            }]
        };
    }
} 