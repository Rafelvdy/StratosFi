require('dotenv').config({ path: '.env.local' });

console.log('Testing environment variables:');
console.log('DEEPSEEK_API_KEY:', process.env.DEEPSEEK_API_KEY ? 'Present' : 'Missing');
console.log('TWITTER_API_KEY:', process.env.TWITTER_API_KEY ? 'Present' : 'Missing');
console.log('TWITTER_API_BASE_URL:', process.env.TWITTER_API_BASE_URL ? 'Present' : 'Missing'); 