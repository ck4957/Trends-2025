import React, { useState } from "react";
import Head from "next/head";
import Script from "next/script";

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
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <Head>
        <title>{title}</title>
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
      <header className="bg-gray-200 dark:bg-gray-900 shadow sticky top-0 z-30">
        <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <a href="/" className="flex items-center">
              <img
                src="/logo.png"
                alt="ClickSpill Logo"
                className="h-10 w-10 rounded-md object-contain bg-black p-1 shadow-md mr-3"
              />
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
      <footer className="bg-gray-200 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 overflow-hidden sm:px-6 lg:px-8 flex flex-col items-center">
          <nav className="flex flex-wrap justify-center gap-4 mb-2">
            <a
              href="/about"
              className="text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition"
            >
              About
            </a>
            <a
              href="/contact"
              className="text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition"
            >
              Contact
            </a>
            <a
              href="/terms"
              className="text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition"
            >
              Terms
            </a>
            <a
              href="/privacy"
              className="text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition"
            >
              Privacy
            </a>
          </nav>
          <p className="text-center text-gray-300 dark:text-gray-600 text-xs sm:text-sm">
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
