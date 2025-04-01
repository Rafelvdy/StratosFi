require('dotenv').config({ path: '.env.local' });

const requiredEnvVars = ['DEEPSEEK_API_KEY'];

function checkEnv() {
    const missing = requiredEnvVars.filter(key => !process.env[key]);
    if (missing.length > 0) {
        console.error('Error: Missing required environment variables:');
        missing.forEach(key => console.error(`- ${key}`));
        process.exit(1);
    }
}

checkEnv(); 