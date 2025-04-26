import Head from "next/head";
import type { AppProps } from "next/app";
import { ThemeProvider } from "../context/ThemeContext";
import "../styles/globals.css";
import Script from "next/script";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <Head>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-CKLFFYDFCZ"
        />
        <Script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());gtag('config', 'G-CKLFFYDFCZ');`,
          }}
        />
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
        // Add these to your Head component in _app.tsx
        <meta
          name="google-site-verification"
          content="ww1oAvtDmJgQ76OAIWy7izbQduMtWwS4cac_BCD1Jok"
        />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
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
        {/* <meta
          property="og:image"
          content="https://clickspill.com/og-image.jpg"
        /> */}
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
        {/* <meta
          property="twitter:image"
          content="https://clickspill.com/twitter-image.jpg"
        /> */}
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
        {/* Font Awesome for icons */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"
        />
        {/* <!-- Google Tag Manager --> */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-MVCCTJJ4');`,
          }}
        />
        {/* <!-- End Google Tag Manager --> */}
        {/* JSON-LD structured data for better SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: `
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "ClickSpill",
              "url": "https://clickspill.com",
              "description": "Daily trending topics and AI insights content"
            }
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
            (function() {
              try {
                var theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            })();
          `,
          }}
        />
      </Head>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
