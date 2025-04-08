import useSWR from 'swr';
import { TwitterApi } from '../app/utils/twitterApi';
import { Tweet } from '../app/utils/twitterAnalyzer';
import { analyzeTweets } from '../app/utils/nlpAnalyzer';

export interface SentimentData {
  ticker: string;
  sentiment: number;
  tweets: Tweet[];
  error?: string;
}

interface UseSentimentDataProps {
  ticker: string;
  timeframe?: '1h' | '24h' | '7d' | '30d';
  refreshInterval?: number;
}

const fetcher = async ([ticker, timeframe]: [string, string]): Promise<SentimentData> => {
  try {
    const response = await TwitterApi.fetchTweets({ ticker, timeframe });
    const allTweets = [...response.kol_tweets, ...response.community_tweets];
    const analysis = await analyzeTweets(allTweets);
    
    return {
      ticker,
      sentiment: analysis.averageMood,
      tweets: allTweets,
      error: undefined
    };
  } catch (error) {
    console.error('Error fetching sentiment data:', error);
    throw error;
  }
};

export function useSentimentData({ 
  ticker, 
  timeframe = '24h',
  refreshInterval = 30000 // 30 seconds default
}: UseSentimentDataProps) {
  const { data, error, isLoading, mutate } = useSWR<SentimentData>(
    ticker ? [ticker, timeframe] : null,
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      errorRetryCount: 3
    }
  );

  return {
    data,
    isLoading,
    isError: error,
    refresh: () => mutate()
  };
} 