import { SearchParams, Tweet } from './twitterAnalyzer';

interface TwitterApiResponse {
    tweets: Array<{
        id: string;
        text: string;
        created_at: string;
        favorite_count: number;
        retweet_count: number;
        reply_count: number;
        user: {
            screen_name: string;
            followers_count: number;
        };
    }>;
}

export class TwitterApi {
    private static readonly API_KEY = process.env.TWITTER_API_KEY;
    private static readonly BASE_URL = 'https://api.twitterapi.io/twitter/tweet/advanced_search';

    static async fetchTweets(params: SearchParams): Promise<Tweet[]> {
        if (!this.API_KEY) {
            throw new Error('Twitter API key not configured');
        }

        const query = this.constructQuery(params);
        const url = `${this.BASE_URL}?${new URLSearchParams({ query })}`;

        try {
            const response = await fetch(url, {
                headers: {
                    'X-API-Key': this.API_KEY
                }
            });

            if (!response.ok) {
                throw new Error(`Twitter API error: ${response.statusText}`);
            }

            const data: TwitterApiResponse = await response.json();
            return this.transformResponse(data);
        } catch (error) {
            console.error('Error fetching tweets:', error);
            throw error;
        }
    }

    private static constructQuery(params: SearchParams): string {
        const { ticker, timeframe } = params;
        
        // Convert timeframe to Twitter API format
        const timeRange = this.convertTimeframe(timeframe);
        
        return `(${ticker} OR $${ticker}) lang:en min_faves:10 -is:retweet ${timeRange}`;
    }

    private static convertTimeframe(timeframe: string): string {
        const now = new Date();
        const startTime = new Date();

        switch (timeframe) {
            case '1h':
                startTime.setHours(now.getHours() - 1);
                break;
            case '24h':
                startTime.setHours(now.getHours() - 24);
                break;
            case '7d':
                startTime.setDate(now.getDate() - 7);
                break;
            case '30d':
                startTime.setDate(now.getDate() - 30);
                break;
            default:
                startTime.setHours(now.getHours() - 24); // Default to 24h
        }

        return `since:${startTime.toISOString().replace(/[:.]/g, '_')}_UTC`;
    }

    private static transformResponse(data: TwitterApiResponse): Tweet[] {
        return data.tweets.map(tweet => ({
            id: tweet.id,
            text: tweet.text,
            created_at: tweet.created_at,
            metrics: {
                likes: tweet.favorite_count || 0,
                retweets: tweet.retweet_count || 0,
                replies: tweet.reply_count || 0
            },
            author: {
                username: tweet.user.screen_name,
                followers_count: tweet.user.followers_count
            }
        }));
    }
} 