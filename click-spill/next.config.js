module.exports = {
  reactStrictMode: true,
  images: {
    domains: ['example.com'], // Replace with your image domains
  },
  env: {
    GOOGLE_TRENDS_API_KEY: process.env.GOOGLE_TRENDS_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
};