module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6C3CE9',    // Purple
        secondary: '#2EFFD4',  // Cyan
        tertiary: '#4D7EFF',   // Blue
        background: '#000000', // Black
        neutral: '#1F2937',    // Dark gray for cards
      }
    }
  },
  plugins: [],
} 