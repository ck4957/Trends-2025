import React, { useState } from "react";
import Head from "next/head";
import Script from "next/script";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title = "Click Spill - Daily Trending Topics",
  description = "AI-powered insights on daily trending topics",
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);

    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta
          name="google-adsense-account"
          content="ca-pub-3911596373332918"
        ></meta>
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
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                ClickSpill
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                AI-powered trending topics & insights
              </p>
            </div>

            {/* Theme Toggle Button */}
            {/* <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle dark mode"
            >
              <i className={`fas ${isDarkMode ? "fa-sun" : "fa-moon"}`}></i>
            </button> */}
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl w-full mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Ad display before content */}

        {children}
      </main>
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
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 overflow-hidden sm:px-6 lg:px-8">
          <p className="text-center text-gray-400 dark:text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Click Spill. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
