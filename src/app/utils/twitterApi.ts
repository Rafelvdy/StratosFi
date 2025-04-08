import { SearchParams } from './twitterAnalyzer';

class TwitterApiError extends Error {
    constructor(
        public code: string,
        message: string,
        public details?: Record<string, unknown>
    ) {
        super(message);
        this.name = 'TwitterApiError';
    }
}

export interface KOLTweet extends Tweet {
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
            profile_image_url: string;
        };
    }>;
    has_next_page: boolean;
    next_cursor: string;
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
        profile_image_url: string;
    };
}

export class TwitterApi {
    private static readonly API_KEY = process.env.TWITTER_API_KEY;
    private static readonly BASE_URL = process.env.TWITTER_API_BASE_URL?.replace(/\/+$/, '');
    private static readonly ENDPOINT = '/twitter/tweet/advanced_search';
    private static readonly EXCLUDED_PHRASES = [
        "giveaway",
        "contest",
        "airdrop",
        "pump",
        "dm me",
        "dm for",
        "lets collaborate",
        "win",
        "claim",
        "free",
        "bot",
        "spam"
    ];

    private static readonly TICKER_MAPPING: { [key: string]: string } = {
        // Bitcoin variations
        'bitcoin': 'BTC',
        'btc': 'BTC',
        'Bitcoin': 'BTC',
        '$btc': 'BTC',
        '#btc': 'BTC',
        
        // Ethereum variations
        'ethereum': 'ETH',
        'eth': 'ETH',
        'Ethereum': 'ETH',
        '$eth': 'ETH',
        '#eth': 'ETH',
        
        // Solana variations
        'solana': 'SOL',
        'sol': 'SOL',
        'Solana': 'SOL',
        '$sol': 'SOL',
        '#sol': 'SOL',
        
        // Dogecoin variations
        'dogecoin': 'DOGE',
        'doge': 'DOGE',
        'Dogecoin': 'DOGE',
        '$doge': 'DOGE',
        '#doge': 'DOGE',
        
        // XRP variations
        'ripple': 'XRP',
        'xrp': 'XRP',
        'Ripple': 'XRP',
        '$xrp': 'XRP',
        '#xrp': 'XRP',
        
        // Cardano variations
        'cardano': 'ADA',
        'ada': 'ADA',
        'Cardano': 'ADA',
        '$ada': 'ADA',
        '#ada': 'ADA'
    };

    private static readonly KOL_THRESHOLDS = {
        MIN_FOLLOWERS: 5000
    };

    private static readonly MAX_RETRIES = 3;
    private static readonly RETRY_DELAY = 1000;

    private static validateRequest(params: SearchParams): void {
        if (!this.API_KEY) {
            throw new TwitterApiError('NO_API_KEY', 'Twitter API key not configured');
        }

        if (!this.BASE_URL) {
            throw new TwitterApiError('NO_BASE_URL', 'Twitter API base URL not configured');
        }

        if (!params.ticker) {
            throw new TwitterApiError('INVALID_PARAMS', 'Ticker symbol is required');
        }

        const validTimeframes = ['1h', '24h', '7d', '30d'];
        if (params.timeframe && !validTimeframes.includes(params.timeframe)) {
            // Convert to default timeframe instead of throwing error
            params.timeframe = '24h';
            console.log('Invalid timeframe provided, defaulting to 24h');
        }
    }

    private static validateResponse(response: Response): void {
        if (!response.ok) {
            const status = response.status;
            if (status === 429) {
                throw new TwitterApiError('RATE_LIMIT', 'Rate limit exceeded');
            } else if (status === 401) {
                throw new TwitterApiError('UNAUTHORIZED', 'Invalid API key');
            } else if (status === 400) {
                throw new TwitterApiError('BAD_REQUEST', 'Invalid request parameters');
            } else {
                throw new TwitterApiError('API_ERROR', `Twitter API error: ${response.statusText}`);
            }
        }
    }

    private static async delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private static async retryWithBackoff<T>(
        operation: () => Promise<T>,
        retries: number = this.MAX_RETRIES
    ): Promise<T> {
        for (let i = 0; i < retries; i++) {
            try {
                return await operation();
            } catch (error) {
                if (i === retries - 1) throw error;
                
                const isRetryable = error instanceof TwitterApiError && 
                    ['RATE_LIMIT', 'API_ERROR'].includes(error.code);
                
                if (!isRetryable) throw error;

                const delayMs = this.RETRY_DELAY * Math.pow(2, i);
                console.log(`Retry attempt ${i + 1}/${retries} after ${delayMs}ms`);
                await this.delay(delayMs);
            }
        }
        throw new TwitterApiError('MAX_RETRIES', 'Maximum retry attempts exceeded');
    }

    static async fetchTweets(params: SearchParams): Promise<TweetCategories> {
        try {
            this.validateRequest(params);

            let allTweets: Tweet[] = [];
            let cursor: string | undefined;
            let hasNextPage = true;

            while (hasNextPage) {
                const query = this.constructQuery(params);
                const url = `${this.BASE_URL}${this.ENDPOINT}?queryType=Latest&query=${encodeURIComponent(query)}`;
                const finalUrl = cursor ? `${url}&cursor=${cursor}` : url;

                console.log('\n=== API Request ===');
                console.log('DEBUG: Query URL:', finalUrl);
                console.log('DEBUG: Headers:', { 'X-API-Key': '***' });

                const fetchOperation = async () => {
                    console.log('\n=== Request Details ===');
                    console.log('DEBUG: Full URL:', finalUrl);
                    console.log('DEBUG: API Key:', this.API_KEY?.substring(0, 5) + '...');
                    console.log('DEBUG: Headers being sent:', {
                        'x-api-key': this.API_KEY?.substring(0, 5) + '...'
                    });
                    
                    const response = await fetch(finalUrl, {
                        headers: {
                            'x-api-key': this.API_KEY!
                        }
                    });

                    console.log('\n=== Response Details ===');
                    console.log('DEBUG: Status:', response.status);
                    console.log('DEBUG: Status Text:', response.statusText);
                    const responseText = await response.text();
                    console.log('DEBUG: Raw Response:', responseText);
                    
                    if (!response.ok) {
                        throw new TwitterApiError('API_ERROR', `Twitter API error: ${response.statusText}`, {
                            status: response.status,
                            response: responseText
                        });
                    }

                    const data = JSON.parse(responseText) as TwitterApiResponse;
                    
                    if (!data || !Array.isArray(data.tweets)) {
                        throw new TwitterApiError('INVALID_RESPONSE', 'Invalid response format from Twitter API');
                    }

                    console.log('\n=== API Response ===');
                    console.log('DEBUG: Raw tweet count:', data.tweets.length);
                    if (data.tweets.length > 0) {
                        console.log('DEBUG: First raw tweet:', JSON.stringify(data.tweets[0], null, 2));
                    }

                    return data;
                };

                const data = await this.retryWithBackoff(fetchOperation);
                const transformedTweets = this.transformResponse(data);
                allTweets = [...allTweets, ...transformedTweets];

                hasNextPage = data.has_next_page;
                cursor = data.next_cursor;

                if (allTweets.length >= 100) break;
            }

            return this.categorizeTweets(allTweets);

        } catch (error) {
            if (error instanceof TwitterApiError) {
                console.error(`Twitter API Error: [${error.code}] ${error.message}`, error.details);
                throw error;
            }
            console.error('Unexpected error:', error);
            throw new TwitterApiError('UNKNOWN_ERROR', 'An unexpected error occurred', { originalError: error });
        }
    }

    private static categorizeTweets(tweets: Tweet[]): TweetCategories {
        const categories: TweetCategories = {
            kol_tweets: [],
            community_tweets: []
        };

        // DEBUG START
        console.log('\n=== Starting KOL Tweet Analysis ===');
        console.log(`Processing ${tweets.length} total tweets`);
        // DEBUG END

        tweets.forEach(tweet => {
            const { author: { followers_count } } = tweet;

            // Check if account meets KOL criteria (only follower count)
            const isKOL = followers_count >= this.KOL_THRESHOLDS.MIN_FOLLOWERS;

            if (isKOL) {
                // Calculate influence score based solely on follower count
                const influence_score = Math.min(100, (followers_count / this.KOL_THRESHOLDS.MIN_FOLLOWERS) * 100);
                
                const kolTweet: KOLTweet = {
                    ...tweet,
                    influence_score,
                    time_factor: 1
                };
                categories.kol_tweets.push(kolTweet);

                // DEBUG START - KOL Tweet Found
                console.log('\n🌟 KOL Tweet Found:');
                console.log('------------------------');
                console.log(`Author: @${tweet.author.username}`);
                console.log(`Followers: ${tweet.author.followers_count.toLocaleString()}`);
                console.log(`Influence Score: ${influence_score.toFixed(2)}`);
                console.log(`Tweet: ${tweet.text}`);
                console.log('------------------------');
                // DEBUG END
            } else {
                categories.community_tweets.push(tweet);
            }
        });

        // Sort KOL tweets by influence score
        categories.kol_tweets.sort((a, b) => b.influence_score - a.influence_score);

        // DEBUG Summary - Only show KOL stats
        console.log('\n=== KOL Analysis Summary ===');
        console.log(`Found ${categories.kol_tweets.length} KOL tweets`);
        if (categories.kol_tweets.length > 0) {
            console.log(`Top Influence Score: ${categories.kol_tweets[0].influence_score.toFixed(2)}`);
        }
        console.log('===========================\n');

        return categories;
    }

    private static transformResponse(data: TwitterApiResponse): Tweet[] {
        // DEBUG START
        console.log('\n=== Transform Response ===');
        console.log('DEBUG: Raw tweet count:', data.tweets?.length || 0);
        console.log('DEBUG: First raw tweet:', data.tweets?.[0]);
        // DEBUG END
        
        if (!data.tweets?.length) {
            console.log('DEBUG: No tweets found in API response');
            return [];
        }

        const transformed = data.tweets.map(tweet => ({
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
                followers_count: tweet.user?.followers_count || 0,
                profile_image_url: tweet.user?.profile_image_url || ''
            }
        }));

        // DEBUG START
        console.log('DEBUG: Transformed tweet count:', transformed.length);
        if (transformed.length > 0) {
            console.log('DEBUG: First transformed tweet:', JSON.stringify(transformed[0], null, 2));
        }
        console.log('=======================\n');
        // DEBUG END

        return transformed;
    }

    private static constructQuery(params: SearchParams): string {
        const { ticker, timeframe } = params;
        const searchTerm = this.TICKER_MAPPING[ticker.toLowerCase()] || ticker.toUpperCase();
        const timestamp = this.convertTimeframe(timeframe);
        
        // Create exclusion filters
        const exclusionFilters = this.EXCLUDED_PHRASES
            .map(phrase => `-"${phrase}"`)
            .join(' ');
            
        // Create username exclusion filters
        const usernameExclusions = [
            `-from:*${searchTerm}*`,
            `-from:*${ticker.toLowerCase()}*`,
            `-from:*${ticker.toUpperCase()}*`
        ].join(' ');
        
        // Create search terms with common variations
        const searchVariations = [
            searchTerm,
            ticker.toLowerCase(),
            `#${searchTerm}`,
            `$${searchTerm}`,
            `#${ticker.toLowerCase()}`,
            `$${ticker.toLowerCase()}`
        ].join(' OR ');
        
        // Add language filter and quality filters (removed -has:links)
        const query = `(${searchVariations}) ${exclusionFilters} ${usernameExclusions} lang:en min_faves:2 -is:bot -is:nullcast since:${timestamp}`;
        
        // DEBUG START
        console.log('\n=== Query Construction ===');
        console.log('DEBUG: Input ticker:', ticker);
        console.log('DEBUG: Mapped search term:', searchTerm);
        console.log('DEBUG: Search variations:', searchVariations);
        console.log('DEBUG: Username exclusions:', usernameExclusions);
        console.log('DEBUG: Constructed query:', query);
        console.log('========================\n');
        // DEBUG END

        return query;
    }

    private static convertTimeframe(timeframe: string = '24h'): string {
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

        return startTime.toISOString().split('.')[0] + 'Z';
    }
} 