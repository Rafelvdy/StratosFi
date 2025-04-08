import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { KOLTweet } from '../utils/twitterApi';

interface KOLTweetListProps {
  tweets: KOLTweet[];
}

export const KOLTweetList = ({ tweets }: KOLTweetListProps) => {
  // Sort tweets by timestamp (newest first)
  const sortedTweets = [...tweets].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="flex flex-col space-y-4 p-4">
      {sortedTweets.map((tweet) => (
        <motion.div
          key={tweet.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#374151] rounded-lg p-4 border border-[#FFD700]/20 hover:border-[#FFD700]/40 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <img
                src={tweet.author.profile_image_url}
                alt={tweet.author.username}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h3 className="text-white font-medium">@{tweet.author.username}</h3>
                <p className="text-gray-400 text-sm">
                  {formatDistanceToNow(new Date(tweet.created_at))} ago
                </p>
              </div>
            </div>
            <div className="bg-[#FFD700]/10 px-3 py-1 rounded-full">
              <span className="text-[#FFD700] text-sm font-medium">
                Score: {Math.round(tweet.influence_score)}
              </span>
            </div>
          </div>
          <p className="text-white mt-2">{tweet.text}</p>
          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-400">
            <div className="flex items-center space-x-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{tweet.metrics.likes}</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span>{tweet.metrics.retweets}</span>
            </div>
          </div>
        </motion.div>
      ))}
      {sortedTweets.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400">No KOL tweets found for this timeframe</p>
        </div>
      )}
    </div>
  );
}; 