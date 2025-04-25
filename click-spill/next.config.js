/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "*.gstatic.com", // Google images thumbnails
      "lh3.googleusercontent.com", // Google user content
      "pbs.twimg.com", // Twitter images
      "abs.twimg.com", // Twitter images
      "media.tenor.com", // Tenor GIFs
      "i.ytimg.com", // YouTube thumbnails
      "img.youtube.com", // YouTube thumbnails
      "cdn.pixabay.com", // Pixabay images
      "images.unsplash.com", // Unsplash images
      "avatars.githubusercontent.com", // GitHub avatars
      "picsum.photos", // Lorem Picsum (placeholder images)
      "via.placeholder.com", // Placeholder images
      "placehold.co", // Placeholder images
      "dummyimage.com", // Dummy images
      "supabase.co", // Supabase hosted content
    ],
    // Optional: add remote patterns for more flexibility with wildcards
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.gstatic.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.ggpht.com",
        pathname: "/**",
      },
    ],
  },
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
  async rewrites() {
    return [
      {
        source: "/sitemap.xml",
        destination: "/api/sitemap.xml",
      },
    ];
  },
};

module.exports = nextConfig;
