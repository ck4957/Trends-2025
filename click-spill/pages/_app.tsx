import Head from "next/head";
import type { AppProps } from "next/app";
import { ThemeProvider } from "../context/ThemeContext";
import "../styles/globals.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <Head>
        {/* Add key attributes to all meta tags */}
        <title key="title">
          ClickSpill - Daily Trending Topics | Latest Trending News
        </title>
        <meta
          key="viewport"
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        <meta
          key="description"
          name="description"
          content="ClickSpill provides daily trending topics with AI-Driven Summaries, news updates, and viral content in one place. Stay updated with the latest trends and breaking news."
        />
        <meta
          key="keywords"
          name="keywords"
          content="trending topics, viral news, daily trends, breaking news, popular content, current events"
        />
        <meta key="robots" name="robots" content="index, follow" />
        <meta
          key="content-type"
          httpEquiv="Content-Type"
          content="text/html; charset=utf-8"
        />
        <meta key="language" name="language" content="English" />
        <meta key="revisit-after" name="revisit-after" content="1 days" />
        <meta key="author" name="author" content="ClickSpill" />
        <meta
          key="google-site-verification"
          name="google-site-verification"
          content="ww1oAvtDmJgQ76OAIWy7izbQduMtWwS4cac_BCD1Jok"
        />
        <link
          key="sitemap"
          rel="sitemap"
          type="application/xml"
          href="/sitemap.xml"
        />
        <meta key="theme-color" name="theme-color" content="#2563eb" />
        <meta
          key="mobile-web-app-capable"
          name="mobile-web-app-capable"
          content="yes"
        />
        <meta
          key="mobile-web-app-status-bar-style"
          name="mobile-web-app-status-bar-style"
          content="default"
        />
        <meta
          key="format-detection"
          name="format-detection"
          content="telephone=no"
        />

        {/* IMPORTANT: Move these social/OG tags to page-specific components */}
        {/* Only include canonical for the homepage here */}
        <link key="canonical" rel="canonical" href="https://clickspill.com" />
        <link key="favicon" rel="icon" href="/cs.ico" />

        {/* The rest of your head content */}
      </Head>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
