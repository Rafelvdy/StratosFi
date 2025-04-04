/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    env: {
        DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
        TWITTER_API_KEY: process.env.TWITTER_API_KEY,
        TWITTER_API_BASE_URL: process.env.TWITTER_API_BASE_URL,
    },
}

// Debug log
console.log('Next.js Environment Variables:');
console.log('DEEPSEEK_API_KEY:', process.env.DEEPSEEK_API_KEY ? 'Present' : 'Missing');
console.log('TWITTER_API_KEY:', process.env.TWITTER_API_KEY ? 'Present' : 'Missing');
console.log('TWITTER_API_BASE_URL:', process.env.TWITTER_API_BASE_URL ? 'Present' : 'Missing');

module.exports = nextConfig 