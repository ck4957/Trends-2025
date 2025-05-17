import Head from "next/head";
import type { AppProps } from "next/app";
import { ThemeProvider } from "../context/ThemeContext";
import "../styles/globals.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <Head>
        {/* Technical meta tags */}
        <meta
          key="viewport"
          name="viewport"
          content="width=device-width, initial-scale=1.0"
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
        <link key="favicon" rel="icon" href="/cs.ico" />

        {/* Default meta tags that will be overridden by specific pages */}
        <title key="title">
          ClickSpill - Daily Trending Topics | Latest Trending News
        </title>
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
        <link key="canonical" rel="canonical" href="https://clickspill.com" />

        {/* Default OG tags that will be overridden by specific pages */}
        <meta
          key="og:title"
          property="og:title"
          content="ClickSpill - Daily Trending Topics"
        />
        <meta key="og:type" property="og:type" content="website" />
        <meta key="og:url" property="og:url" content="https://clickspill.com" />
        <meta
          key="og:description"
          property="og:description"
          content="ClickSpill provides daily trending topics with AI-Driven Summaries"
        />
        <meta
          key="og:image"
          property="og:image"
          content="https://clickspill.com/logo.png"
        />
      </Head>

      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
