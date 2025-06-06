import React from "react";
import Head from "next/head";
import Image from "next/image";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AdScripts } from "./AdScripts";
import { AdContainer } from "./AdContainer";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  hasCustomMeta?: boolean;
}

const brandFont = "monospace";
const brandName = "Click Spill";
const brandTagline = "AI-powered Insights on Trending Topics";

const Layout: React.FC<LayoutProps> = ({
  children,
  title = "Click Spill - Daily Trending Topics summarized by AI",
  description = "Discover Trending Topics with AI-Driven Summaries",
  hasCustomMeta = false,
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      {/* Meta Tags */}
      {!hasCustomMeta && (
        <Head>
          <title>{title}</title>
          <meta name="description" content={description} />
        </Head>
      )}
      {/* <Head>
        <meta name="google-adsense-account" content="ca-pub-3911596373332918" />
        <link
          href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap"
          rel="stylesheet"
        />
      </Head> */}

      {/* All Ad Scripts */}
      <AdScripts />

      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow sticky top-0 z-30 transition-colors duration-300">
        <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <a href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="ClickSpill Logo"
                className="h-10 w-10 rounded-md object-contain bg-black p-1 shadow-md mr-3"
                width={40}
                height={40}
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

      {/* Top Banner Ad */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <AdContainer
          id="top-banner-ad"
          minHeight="90px"
          maxWidth="728px"
          showLabel={false}
        />
      </div>

      {/* Main Layout */}
      <main className="flex-grow w-full max-w-[1400px] mx-auto">
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Left Sidebar */}
          <aside className="hidden xl:block xl:w-1/5">
            <div className="sticky top-20 space-y-6">
              <AdContainer id="left-sidebar-ad-2" minHeight="250px" />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 xl:w-3/5 lg:w-3/4 px-4 sm:px-6 lg:px-8">
            {children}
          </div>

          {/* Right Sidebar */}
          <aside className="lg:w-1/4 xl:w-1/5 w-full px-4 sm:px-6 lg:px-8">
            <div className="sticky top-20 space-y-6">
              <AdContainer id="right-sidebar-ad-1" minHeight="300px" />
            </div>
          </aside>
        </div>
      </main>

      {/* Analytics */}
      <SpeedInsights />
      <Analytics />

      {/* Bottom Banner Ad */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <AdContainer
          id="bottom-banner-ad"
          minHeight="60px"
          maxWidth="460px"
          showLabel={false}
        />
      </div>
      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
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
