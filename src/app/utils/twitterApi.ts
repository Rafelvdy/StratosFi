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
    has_next_page: boolean;
    next_cursor: string;
}

export class TwitterApi {
    private static readonly API_KEY = process.env.TWITTER_API_KEY;
    private static readonly BASE_URL = 'https://api.twitterapi.io/twitter/tweet/advanced_search';

    static async fetchTweets(params: SearchParams): Promise<Tweet[]> {
        if (!this.API_KEY) {
            throw new Error('Twitter API key not configured');
        }

        let allTweets: Tweet[] = [];
        let cursor: string | undefined;
        let hasNextPage = true;

        while (hasNextPage) {
            const query = this.constructQuery(params);
            const queryParams = new URLSearchParams({
                query,
                queryType: 'Latest'
            });
            
            if (cursor) {
                queryParams.append('cursor', cursor);
            }

            const url = `${this.BASE_URL}?${queryParams}`;

            // DEBUG START
            console.log('DEBUG: Query URL:', url);
            console.log('DEBUG: Headers:', { 'X-API-Key': '***' });
            // DEBUG END

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
                // DEBUG START
                console.log('DEBUG: Raw API Response:', JSON.stringify(data, null, 2));
                // DEBUG END

                const transformedTweets = this.transformResponse(data);
                allTweets = [...allTweets, ...transformedTweets];

                hasNextPage = data.has_next_page;
                cursor = data.next_cursor;

                // Limit to 100 tweets maximum to avoid excessive API calls
                if (allTweets.length >= 100) {
                    break;
                }
            } catch (error) {
                console.error('Error fetching tweets:', error);
                throw error;
            }
        }

        return allTweets;
    }

    private static constructQuery(params: SearchParams): string {
        const { ticker, timeframe } = params;
        
        // Convert timeframe to Twitter API format
        const timestamp = this.convertTimeframe(timeframe);
        
        // Use text: operator to match only in tweet text content
        const query = `text:${ticker} since:${timestamp}`;
        // DEBUG START
        console.log('DEBUG: Constructed Query:', query);
        // DEBUG END
        return query;
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

        const timestamp = startTime.toISOString().replace(/[:.]/g, '_').slice(0, -5) + '_UTC';
        // DEBUG START
        console.log('DEBUG: Converted Timestamp:', timestamp);
        // DEBUG END
        return timestamp;
    }

    private static transformResponse(data: TwitterApiResponse): Tweet[] {
        // DEBUG START
        console.log('DEBUG: Transforming tweets:', data.tweets.length, 'tweets found');
        if (data.tweets.length > 0) {
            console.log('DEBUG: First tweet structure:', JSON.stringify(data.tweets[0], null, 2));
        }
        // DEBUG END
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
                username: tweet.user?.screen_name || 'unknown',
                followers_count: tweet.user?.followers_count || 0
            }
        }));
    }
} 