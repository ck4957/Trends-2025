import { useEffect, useState } from "react";
import Head from "next/head";
import { createClient } from "@supabase/supabase-js";

// Environment variables
const PLATFORM = process.env.NEXT_PUBLIC_PLATFORM || "vercel"; // 'vercel' or 'supabase'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface NewsItem {
  title: string;
  url: string;
  source: string;
  picture: string | null;
  summary: string;
}

interface Trend {
  title: string;
  traffic: string;
  news: NewsItem[];
}

interface ApiResponse {
  trends: Trend[];
  timestamp: string;
}

export default function Home() {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timestamp, setTimestamp] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrends() {
      try {
        let data: ApiResponse;

        if (PLATFORM === "supabase") {
          // Fetch from Supabase
          if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
            throw new Error("Supabase configuration missing");
          }

          const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
          const { data: supabaseData, error: supabaseError } = await supabase
            .from("processed_trends")
            .select("*")
            .eq("id", "latest")
            .single();

          if (supabaseError) {
            throw new Error(`Supabase fetch error: ${supabaseError.message}`);
          }

          data = {
            trends: supabaseData.trends,
            timestamp: supabaseData.timestamp,
          };
        } else {
          // Fetch from Vercel API route
          const response = await fetch("/api/trends");
          if (!response.ok) throw new Error("Failed to fetch trends");
          data = await response.json();
        }

        setTrends(data.trends);
        setTimestamp(data.timestamp);
      } catch (err) {
        console.error("Error fetching trends:", err);
        setError("Failed to load trends. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchTrends();
  }, []);

  // Format the timestamp for display
  const formattedTime = timestamp ? new Date(timestamp).toLocaleString() : "";

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Click Spill - Daily Trending Topics</title>
        <meta
          name="description"
          content="AI-powered insights on daily trending topics"
        />
        {/* Add Tailwind CSS via CDN */}
        <link href="https://cdn.tailwindcss.com" rel="stylesheet" />
      </Head>

      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">ClickSpill</h1>
          <p className="mt-1 text-sm text-gray-500">
            AI-powered trending topics & insights
          </p>
          {timestamp && (
            <p className="text-xs text-gray-400 mt-1">
              Last updated: {formattedTime}
            </p>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-pulse text-blue-500">
                Loading trending topics...
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                Today's Trending Topics
              </h2>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {trends.map((trend, index) => (
                  <div
                    key={index}
                    className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg font-medium text-gray-900">
                        {trend.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Traffic: {trend.traffic}
                      </p>

                      {trend.news && trend.news.length > 0 && (
                        <div>
                          <h3 className="text-lg font-medium text-gray-700 mb-2">
                            Related News:
                          </h3>
                          <ul className="space-y-4">
                            {trend.news.map((news, idx) => (
                              <li
                                key={idx}
                                className="border-t pt-4 first:border-0 first:pt-0"
                              >
                                {news.picture && (
                                  <img
                                    src={news.picture}
                                    alt={news.title}
                                    className="w-full h-48 object-cover rounded-lg mb-3"
                                  />
                                )}
                                <div>
                                  <a
                                    href={news.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline font-medium"
                                  >
                                    {news.title}
                                  </a>
                                  <p className="text-sm text-gray-500 mt-1">
                                    Source: {news.source}
                                  </p>
                                  {news.summary && (
                                    <p className="mt-2 text-sm text-gray-700">
                                      {news.summary}
                                    </p>
                                  )}
                                  <a
                                    href={news.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 inline-block text-sm text-blue-600 hover:underline"
                                  >
                                    Read more &rarr;
                                  </a>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {trends.length === 0 && (
                <p className="text-center text-gray-500">
                  No trending topics found.
                </p>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 overflow-hidden sm:px-6 lg:px-8">
          <p className="text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Click Spill. All rights reserved.
          </p>
          <p className="text-center text-gray-400 text-xs mt-1">
            Platform: {PLATFORM.charAt(0).toUpperCase() + PLATFORM.slice(1)}
          </p>
        </div>
      </footer>
    </div>
  );
}
