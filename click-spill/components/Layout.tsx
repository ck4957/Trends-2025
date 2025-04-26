import React from "react";
import Head from "next/head";
import Script from "next/script";
import { useTheme } from "../context/ThemeContext";
import Image from "next/image";
interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const brandFont = "monospace";
const brandName = "Click Spill";
const brandTagline = "AI-powered trending topics";

const Layout: React.FC<LayoutProps> = ({
  children,
  title = "Click Spill - Daily Trending Topics",
  description = "AI-powered insights on daily trending topics",
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === "dark";

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <Head>
        <title>{title}</title>
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

        <meta name="description" content={description} />
        <meta
          name="google-adsense-account"
          content="ca-pub-3911596373332918"
        ></meta>
        <link
          href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap"
          rel="stylesheet"
        />
      </Head>
      {/* Google AdSense Script */}
      <Script
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3911596373332918"
        crossOrigin="anonymous"
      />
      <Script
        id="google-adsense"
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3911596373332918"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />

      {/* Fixed: Changed header background to light color in light mode */}
      <header className="bg-white dark:bg-gray-900 shadow sticky top-0 z-30 transition-colors duration-300">
        <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {" "}
            {/* Changed to justify-between and added items-center */}
            <a href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="ClickSpill Logo"
                className="h-10 w-10 rounded-md object-contain bg-black p-1 shadow-md mr-3"
                width={40}
                height={40}
              />
              {/* <img
                src="/logo.png"
                alt="ClickSpill Logo"
                className="h-10 w-10 rounded-md object-contain bg-black p-1 shadow-md mr-3"
              /> */}
              <div className="flex flex-col">
                <span
                  className="text-2xl tracking-tight text-gray-900 dark:text-white select-none"
                  style={{ fontFamily: brandFont }}
                >
                  {brandName}
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 italic">
                  {brandTagline}
                </p>
              </div>
            </a>
            {/* Theme toggle button */}
            {/* <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button> */}
          </div>
        </div>
      </header>

      {/* Rest of your layout remains the same */}
      <main className="flex-grow w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Ad insertion - wrapped in div with margin */}
      <div className="w-full">
        <ins
          className="adsbygoogle"
          style={{ display: "block", minHeight: "90px", width: "100%" }}
          data-ad-client="ca-pub-3911596373332918"
          data-ad-slot="1656982977"
          data-ad-format="auto"
          data-full-width-responsive="true"
        ></ins>
        <Script id="adsense-display">
          {`(adsbygoogle = window.adsbygoogle || []).push({});`}
        </Script>
      </div>

      {/* Footer remains the same */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
        {/* Footer content */}
        <div className="max-w-7xl mx-auto py-6 px-4 overflow-hidden sm:px-6 lg:px-8 flex flex-col items-center">
          <nav className="flex flex-wrap justify-center gap-4 mb-2">
            <a
              href="/about"
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition"
            >
              About
            </a>
            <a
              href="/contact"
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition"
            >
              Contact
            </a>
            <a
              href="/terms"
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition"
            >
              Terms
            </a>
            <a
              href="/privacy"
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition"
            >
              Privacy
            </a>
          </nav>
          <p className="text-center text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
            &copy; {new Date().getFullYear()}{" "}
            <span style={{ fontFamily: brandFont }}>{brandName}</span>. All
            rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
