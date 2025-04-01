import { SearchParams, Tweet } from './twitterAnalyzer';

interface KOLTweet extends Tweet {
    influence_score: number;
    time_factor: number;
}

interface TweetCategories {
    kol_tweets: KOLTweet[];
    community_tweets: Tweet[];
}

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
    private static readonly EXCLUDED_PHRASES = [
        'giveaway',
        'drop your',
        'you can do this too',
        'entry',
        'memecoin',
        'contest',
        'retweet to win',
        'promotion',
        'vip access'
    ];

    private static readonly KOL_THRESHOLDS = {
        MIN_FOLLOWERS: 10000,
        MIN_ENGAGEMENT_RATE: 0.01,
        MIN_RETWEETS: 10,
        MIN_LIKES: 20
    };

    static async fetchTweets(params: SearchParams): Promise<TweetCategories> {
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

        return this.categorizeTweets(allTweets);
    }

    private static categorizeTweets(tweets: Tweet[]): TweetCategories {
        const categories: TweetCategories = {
            kol_tweets: [],
            community_tweets: []
        };

        const now = new Date();

        tweets.forEach(tweet => {
            const {
                metrics: { likes, retweets },
                author: { followers_count },
                created_at
            } = tweet;

            // Calculate time-based factors
            const tweetDate = new Date(created_at);
            const hoursElapsed = Math.max(1, (now.getTime() - tweetDate.getTime()) / (1000 * 60 * 60));
            
            // Calculate time-adjusted engagement
            const timeAdjustedEngagement = (likes + retweets) / hoursElapsed;
            const engagementRate = timeAdjustedEngagement / followers_count;

            // Check if tweet meets KOL criteria
            const isKOL = 
                followers_count >= this.KOL_THRESHOLDS.MIN_FOLLOWERS &&
                engagementRate >= this.KOL_THRESHOLDS.MIN_ENGAGEMENT_RATE &&
                retweets >= this.KOL_THRESHOLDS.MIN_RETWEETS &&
                likes >= this.KOL_THRESHOLDS.MIN_LIKES;

            if (isKOL) {
                const followersImpact = (followers_count / this.KOL_THRESHOLDS.MIN_FOLLOWERS) * 0.4;
                const engagementImpact = (timeAdjustedEngagement / this.KOL_THRESHOLDS.MIN_ENGAGEMENT_RATE) * 0.6;
                
                const kolTweet: KOLTweet = {
                    ...tweet,
                    influence_score: Math.min(100, (followersImpact + engagementImpact) * 100),
                    time_factor: 1 / hoursElapsed
                };
                categories.kol_tweets.push(kolTweet);
            } else {
                categories.community_tweets.push(tweet);
            }
        });

        // Sort KOL tweets by influence score
        categories.kol_tweets.sort((a, b) => b.influence_score - a.influence_score);

        return categories;
    }

    private static constructQuery(params: SearchParams): string {
        const { ticker, timeframe } = params;
        
        // Convert timeframe to Twitter API format
        const timestamp = this.convertTimeframe(timeframe);
        
        // Create exclusion filters
        const exclusionFilters = this.EXCLUDED_PHRASES
            .map(phrase => `-text:"${phrase}"`)
            .join(' ');
        
        // Combine ticker search with exclusion filters
        const query = `text:${ticker} ${exclusionFilters} since:${timestamp}`;
        
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