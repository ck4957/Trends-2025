import React from "react";
import Head from "next/head";
import Script from "next/script";
import Image from "next/image";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  hasCustomMeta?: boolean; // Add this prop to indicate custom meta tags are provided
}

const brandFont = "monospace";
const brandName = "Click Spill";
const brandTagline = "AI-powered Insights on Trending Topics";

const Layout: React.FC<LayoutProps> = ({
  children,
  title = "Click Spill - Daily Trending Topics summarized by AI",
  description = "Discover Trending Topics with AI-Driven Summaries",
  hasCustomMeta = false, // Default to false
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      {/* Only render these meta tags if no custom meta is provided */}
      {!hasCustomMeta && (
        <Head>
          <title>{title}</title>
          <meta name="description" content={description} />
        </Head>
      )}
      <Head>
        <meta name="google-adsense-account" content="ca-pub-3911596373332918" />
        <link
          href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap"
          rel="stylesheet"
        />
      </Head>
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

      {/* AdSterra: Banner 160x300 99700a6546585755883e57e7a0e34d5d */}
      <Script
        id="hpf-ad-config"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
      atOptions = {
        'key': '99700a6546585755883e57e7a0e34d5d',
        'format': 'iframe',
        'height': 300,
        'width': 160,
        'params': {}
      };
      
      // Function to inject ad into specific container
      function injectHPFAd() {
        // Try to place in right sidebar first, then left sidebar as fallback
        const rightContainer = document.getElementById('hpf-ad-container');
        const leftContainer = document.getElementById('left-sidebar-ad-2');
        
        const targetContainer = rightContainer || leftContainer;
        
        if (targetContainer && window.atOptions) {
          // Clear any existing content
          targetContainer.innerHTML = '';
          
          // Create the ad script element
          const adScript = document.createElement('script');
          adScript.type = 'text/javascript';
          adScript.src = '//www.highperformanceformat.com/99700a6546585755883e57e7a0e34d5d/invoke.js';
          
          // Append to target container
          targetContainer.appendChild(adScript);
          
          console.log('HPF ad injected into:', targetContainer.id);
        } else {
          console.log('HPF ad container not found, retrying...');
          // Retry after 1 second if containers not ready
          setTimeout(injectHPFAd, 1000);
        }
      }
      
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectHPFAd);
      } else {
        injectHPFAd();
      }
    `,
        }}
      />
      {/* AdSterra: Banner 160x300 Src: 99700a6546585755883e57e7a0e34d5d */}
      <Script
        id="hpf-ad-invoke"
        src="//www.highperformanceformat.com/99700a6546585755883e57e7a0e34d5d/invoke.js"
        strategy="afterInteractive"
      />

      {/* Add this script after your existing HPF ad config */}
      {/* AdSterra: Banner 728*90 8e7f6d7e537e6b214665d01c83d9d0d3 */}
      {/* id: top-banner-ad */}
      <Script
        id="hpf-banner-ad-config"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
      // Banner ad configuration
      const bannerAtOptions = {
        'key': '8e7f6d7e537e6b214665d01c83d9d0d3',
        'format': 'iframe',
        'height': 90,
        'width': 728,
        'params': {}
      };
      
      // Function to inject banner ad into specific container
      function injectHPFBannerAd() {
        // Try to place in banner containers
        const topBannerContainer = document.getElementById('top-banner-ad');
        const bottomBannerContainer = document.getElementById('bottom-banner-ad');
        
        const targetContainer = topBannerContainer || bottomBannerContainer;
        
        if (targetContainer && bannerAtOptions) {
          // Set the banner options globally for this ad
          window.atOptions = bannerAtOptions;
          
          // Clear any existing content
          targetContainer.innerHTML = '';
          
          // Create the ad script element
          const adScript = document.createElement('script');
          adScript.type = 'text/javascript';
          adScript.src = '//www.highperformanceformat.com/8e7f6d7e537e6b214665d01c83d9d0d3/invoke.js';
          
          // Append to target container
          targetContainer.appendChild(adScript);
          
          console.log('HPF banner ad injected into:', targetContainer.id);
        } else {
          console.log('HPF banner ad container not found, retrying...');
          // Retry after 1 second if containers not ready
          setTimeout(injectHPFBannerAd, 1500);
        }
      }
      
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectHPFBannerAd);
      } else {
        // Delay to ensure first ad is loaded
        setTimeout(injectHPFBannerAd, 2000);
      }
    `,
        }}
      />
      {/* AdSterra: Banner 728*90 Src: 8e7f6d7e537e6b214665d01c83d9d0d3 */}
      <Script
        id="hpf-banner-ad-invoke"
        src="//www.highperformanceformat.com/8e7f6d7e537e6b214665d01c83d9d0d3/invoke.js"
        strategy="afterInteractive"
      />

      {/* AdSterra: Banner 160x600 f48a5e0f10c5d62d5d92352185210be6 */}
      {/* id: left-sidebar-ad-1 h:600px */}
      <Script
        id="hpf-skyscraper-ad-config"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
      // Skyscraper ad configuration
      const skyscraperAtOptions = {
        'key': 'f48a5e0f10c5d62d5d92352185210be6',
        'format': 'iframe',
        'height': 600,
        'width': 160,
        'params': {}
      };
      
      // Function to inject skyscraper ad into specific container
      function injectHPFSkyscraperAd() {
        // Try to place in left sidebar first, then right sidebar as fallback
        const leftContainer = document.getElementById('left-sidebar-ad-1');
        const rightContainer = document.getElementById('hpf-skyscraper-container');
        
        const targetContainer = leftContainer || rightContainer;
        
        if (targetContainer && skyscraperAtOptions) {
          // Set the skyscraper options globally for this ad
          window.atOptions = skyscraperAtOptions;
          
          // Clear any existing content
          targetContainer.innerHTML = '';
          
          // Create the ad script element
          const adScript = document.createElement('script');
          adScript.type = 'text/javascript';
          adScript.src = '//www.highperformanceformat.com/f48a5e0f10c5d62d5d92352185210be6/invoke.js';
          
          // Append to target container
          targetContainer.appendChild(adScript);
          
          console.log('HPF skyscraper ad injected into:', targetContainer.id);
        } else {
          console.log('HPF skyscraper ad container not found, retrying...');
          // Retry after 1 second if containers not ready
          setTimeout(injectHPFSkyscraperAd, 1000);
        }
      }
      
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectHPFSkyscraperAd);
      } else {
        // Delay to ensure other ads are loaded first
        setTimeout(injectHPFSkyscraperAd, 3000);
      }
    `,
        }}
      />
      {/* AdSterra: Banner 160x600 Src: f48a5e0f10c5d62d5d92352185210be6 */}
      <Script
        id="hpf-skyscraper-ad-invoke"
        src="//www.highperformanceformat.com/f48a5e0f10c5d62d5d92352185210be6/invoke.js"
        strategy="afterInteractive"
      />

      {/* AdSterra: Popunder */}
      <Script
        id="profitable-rate-cpm"
        src="//pl26847292.profitableratecpm.com/ba/c7/38/bac7387c219665b557ef784aba7be7ce.js"
        strategy="afterInteractive"
      />

      {/* AdSterra: Social */}
      <Script
        id="profitable-rate-cpm-6a"
        src="//pl26848452.profitableratecpm.com/6a/ad/c0/6aadc0bc628575f4c95bad5a6ff11486.js"
      />

      {/* AdSterra: Direct Link */}
      <Script
        id="profitable-rate-direct"
        src="https://www.profitableratecpm.com/vx70g97er8?key=86f4eb02d1930da0e9d927837f4e84b7"
        strategy="afterInteractive"
      />
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="">
          <div
            id="top-banner-ad"
            className="text-center min-h-[90px] flex items-center justify-center mx-auto max-w-[728px]"
          >
            {/* HPF banner ad will appear here */}
          </div>
        </div>
      </div>
      {/* Rest of your layout remains the same */}
      <main className="flex-grow w-full mx-auto">
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Left Sidebar for ads - only visible on extra large screens */}
          <aside className="hidden xl:block xl:w-1/5">
            <div className="sticky top-20 space-y-6">
              {/* Left Sidebar Ad 1 */}
              <div className="">
                <div
                  id="left-sidebar-ad-1"
                  className="text-center min-h-[600px] flex items-center justify-center"
                >
                  {/* Left sidebar ad will appear here */}
                </div>
              </div>

              {/* Left Sidebar Ad 2 */}
              <div className="">
                <div
                  id="left-sidebar-ad-2"
                  className="text-center min-h-[250px] flex items-center justify-center"
                >
                  {/* Second left sidebar ad */}
                </div>
              </div>
            </div>
          </aside>

          {/* Main content area */}
          <div className="flex-1 xl:w-3/5 lg:w-3/4">{children}</div>

          {/* Right Sidebar for ads */}
          <aside className="lg:w-1/4 xl:w-1/5 w-full">
            <div className="sticky top-20 space-y-6">
              {/* Profitable Rate Ad Container 1 */}
              <div className="">
                <div
                  id="profitable-rate-container-1"
                  className="text-center min-h-[300px] flex items-center justify-center"
                >
                  {/* First profitable rate ad will appear here */}
                </div>
              </div>

              {/* HPF Ad Container */}
              <div className="">
                <div
                  id="hpf-ad-container"
                  className="text-center min-h-[300px] flex items-center justify-center"
                >
                  {/* HPF ad will appear here */}
                </div>
              </div>

              {/* Google AdSense Sidebar Ad */}
              {/* <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <ins
                  className="adsbygoogle"
                  style={{
                    display: "block",
                    width: "100%",
                    minHeight: "250px",
                  }}
                  data-ad-client="ca-pub-3911596373332918"
                  data-ad-slot="1656982977"
                  data-ad-format="rectangle"
                ></ins>
              </div> */}
            </div>
          </aside>
        </div>
      </main>

      <SpeedInsights />
      <Analytics />
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
