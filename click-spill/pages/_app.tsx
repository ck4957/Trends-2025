import { useEffect } from "react";
import Head from "next/head";
import type { AppProps } from "next/app";
import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  // Initialize dark mode based on user preference
  useEffect(() => {
    // Check for saved theme preference or use system preference
    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <>
      <Head>
        <title>ClickSpill - Daily Trending Topics | Latest Trending News</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content="ClickSpill provides daily trending topics, news updates, and viral content in one place. Stay updated with the latest trends and breaking news."
        />
        <meta
          name="keywords"
          content="trending topics, viral news, daily trends, breaking news, popular content, current events"
        />
        <meta name="robots" content="index, follow" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="1 days" />
        <meta name="author" content="ClickSpill" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://clickspill.com/" />
        <meta
          property="og:title"
          content="ClickSpill - Daily Trending Topics"
        />
        <meta
          property="og:description"
          content="Your source for daily trending topics and viral content. Stay updated with the latest trends and breaking news."
        />
        <meta
          property="og:image"
          content="https://clickspill.com/og-image.jpg"
        />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://clickspill.com/" />
        <meta
          property="twitter:title"
          content="ClickSpill - Daily Trending Topics"
        />
        <meta
          property="twitter:description"
          content="Your source for daily trending topics and viral content. Stay updated with the latest trends and breaking news."
        />
        <meta
          property="twitter:image"
          content="https://clickspill.com/twitter-image.jpg"
        />

        {/* Mobile optimization */}
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />

        {/* Resource hints for faster loading */}
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
        <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://clickspill.com" />
        <link rel="icon" href="/cs.ico" />

        {/* Tailwind CSS via CDN */}
        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
        {/* Add Font Awesome for icons */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"
        />
        {/* Tailwind config script for dark mode */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
            tailwind.config = {
              darkMode: 'class',
              theme: {
                extend: {
                  colors: {
                    primary: {
                      DEFAULT: '#2563eb',
                      600: '#2563eb'
                    }
                  }
                }
              }
            }
          `,
          }}
        />

        {/* JSON-LD structured data for better SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: `
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "ClickSpill",
              "url": "https://clickspill.vercel.app",
              "description": "Daily trending topics and AI insights content"
            }
            `,
          }}
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
