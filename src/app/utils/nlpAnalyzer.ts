// DeepSeek API interfaces

interface DeepSeekRequest {
    model: string;
    messages: {
        role: 'system' | 'user';
        content: string;
    }[];
}

interface DeepSeekResponse {
    choices: {
        message: {
            content: string;
        };
    }[];
}

interface MoodAnalysis {
    mood: number;
    events?: string[];
    insights?: string[];
}

interface AnalysisResult {
    averageMood: number;
    events: string[];
    insights: string[];
}

// Analysis prompt for sentiment analysis
const ANALYSIS_PROMPT = `You are a Crypto Community Mood Analyzer that processes tweets to extract sentiment while filtering out noise. Your primary outputs are:

1. COMMUNITY MOOD VALUE: Assign a score from 1-5 where:
   - 1: Extremely Negative (panic, despair, capitulation)
   - 2: Negative (disappointment, concern, skepticism)
   - 3: Neutral (factual, questioning, balanced)
   - 4: Positive (optimistic, supportive, confident)
   - 5: Extremely Positive (euphoric, highly bullish, excitement)

2. SIGNIFICANT EVENT DETECTION (only if present):
   - Identify specific events/catalysts mentioned that are directly impacting the cryptocurrency
   - Note only substantial developments (exchange listings, protocol upgrades, hacks, regulatory actions)
   - Exclude minor news, speculation, or routine market movements

3. HIGH-VALUE INSIGHTS (extremely selective):
   - Surface only truly valuable/unique information not commonly known
   - Include only if the content provides exceptional utility or alpha
   - Omit standard opinions, typical market commentary, or common sentiments

Format your response as:
MOOD VALUE: [1-5]
EVENT: [Only if significant event detected - otherwise omit this field]
INSIGHT: [Only if exceptional value detected - otherwise omit this field]

Prioritize accurate mood assessment above all else. Most responses should only include the MOOD VALUE with other fields appearing only when truly warranted.`;

function parseAnalysisResponse(content: string): MoodAnalysis {
    const moodMatch = content.match(/MOOD VALUE:\s*(\d)/);
    const eventMatch = content.match(/EVENT:\s*(.+?)(?=\n|$)/);
    const insightMatch = content.match(/INSIGHT:\s*(.+?)(?=\n|$)/);

    return {
        mood: moodMatch ? parseInt(moodMatch[1]) : 3, // Default to neutral if no match
        events: eventMatch ? [eventMatch[1].trim()] : undefined,
        insights: insightMatch ? [insightMatch[1].trim()] : undefined
    };
}

// Function to check if two tweets are similar
function areTweetsSimilar(tweet1: string, tweet2: string): boolean {
    // Convert to lowercase and remove common noise
    const clean1 = tweet1.toLowerCase().replace(/[^\w\s]/g, '');
    const clean2 = tweet2.toLowerCase().replace(/[^\w\s]/g, '');
    
    // Split into words
    const words1 = clean1.split(/\s+/);
    const words2 = clean2.split(/\s+/);
    
    // Calculate word overlap
    const commonWords = words1.filter(word => words2.includes(word));
    const similarity = commonWords.length / Math.max(words1.length, words2.length);
    
    // Consider tweets similar if they share more than 70% of their words
    return similarity > 0.7;
}

// Function to filter tweets
function filterTweets(tweets: { text: string }[]): { text: string }[] {
    const filtered: { text: string }[] = [];
    const seen = new Set<string>();
    
    for (const tweet of tweets) {
        // Skip exact duplicates
        if (seen.has(tweet.text)) continue;
        
        // Check for similar tweets
        const isSimilar = filtered.some(existingTweet => 
            areTweetsSimilar(tweet.text, existingTweet.text)
        );
        
        if (!isSimilar) {
            filtered.push(tweet);
            seen.add(tweet.text);
        }
    }
    
    return filtered;
}

// Function to analyze tweets
export async function analyzeTweets(tweets: { text: string }[]): Promise<AnalysisResult> {
    if (!tweets || tweets.length === 0) {
        throw new Error('No tweets provided for analysis');
    }

    // Filter tweets before processing
    const filteredTweets = filterTweets(tweets);
    console.log(`Filtered ${tweets.length - filteredTweets.length} duplicate/similar tweets`);

    const analyses: MoodAnalysis[] = [];
    const allEvents = new Set<string>();
    const allInsights = new Set<string>();

    // Process tweets in batches of 10
    const batchSize = 10;
    const batches = [];
    
    // Create batches
    for (let i = 0; i < filteredTweets.length; i += batchSize) {
        batches.push(filteredTweets.slice(i, i + batchSize));
    }

    try {
        // Process all batches in parallel
        const batchResults = await Promise.all(
            batches.map(async (batch) => {
                // Combine batch tweets with separator
                const batchContent = batch.map(tweet => tweet.text).join('\n[NEXT_TWEET]\n');
                
                const request: DeepSeekRequest = {
                    model: 'deepseek-chat',
                    messages: [
                        { role: 'system', content: ANALYSIS_PROMPT },
                        { role: 'user', content: batchContent }
                    ]
                };

                const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
                    },
                    body: JSON.stringify(request)
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('DeepSeek API error:', {
                        status: response.status,
                        statusText: response.statusText,
                        error: errorText
                    });
                    throw new Error(`DeepSeek API error: ${response.statusText}`);
                }

                const data: DeepSeekResponse = await response.json();
                if (!data || !data.choices || !data.choices[0]?.message?.content) {
                    throw new Error('Invalid response format from DeepSeek API');
                }

                // Split response into individual tweet analyses
                return data.choices[0].message.content
                    .split('[NEXT_TWEET]')
                    .map(content => parseAnalysisResponse(content.trim()));
            })
        );

        // Combine all batch results
        batchResults.forEach(batchAnalyses => {
            analyses.push(...batchAnalyses);
            batchAnalyses.forEach(analysis => {
                if (analysis.events) analysis.events.forEach(e => allEvents.add(e));
                if (analysis.insights) analysis.insights.forEach(i => allInsights.add(i));
            });
        });

    } catch (error) {
        console.error('Error analyzing tweet batches:', error);
        throw error; // Propagate error to be handled by UI
    }

    if (analyses.length === 0) {
        throw new Error('Failed to analyze any tweets');
    }

    const totalMood = analyses.reduce((sum, analysis) => sum + analysis.mood, 0);
    const averageMood = totalMood / analyses.length;

    return {
        averageMood,
        events: Array.from(allEvents),
        insights: Array.from(allInsights)
    };
}
