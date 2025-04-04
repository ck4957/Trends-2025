import { useState, useEffect } from 'react';
import Head from 'next/head';

interface TrendItem {
  title: string;
}

interface TrendsData {
  trends: TrendItem[];
  timestamp: string;
}

export default function Home() {
  const [trends, setTrends] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchTrends() {
      try {
        const response = await fetch('/api/trends');
        if (!response.ok) {
          throw new Error('Failed to fetch trends');
        }
        const data = await response.json();
        setTrends(data);
      } catch (err) {
        setError('Could not load trends. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchTrends();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>BuzzifyAI - Daily Trending Topics</title>
        <meta name="description" content="AI-powered insights on daily trending topics" />
      </Head>

      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">BuzzifyAI</h1>
          <p className="mt-1 text-sm text-gray-500">AI-powered trending topics & insights</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-pulse text-blue-500">Loading trending topics...</div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Today's Trending Topics</h2>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {trends?.trends.map((trend, index) => (
                  <div 
                    key={index} 
                    className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg font-medium text-gray-900">{trend.title}</h3>
                      <div className="mt-4 flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Trending
                        </span>
                      </div>
                      <div className="mt-5">
                        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                          Generate Content
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {trends && (
                <div className="mt-6 text-center text-sm text-gray-500">
                  Last updated: {new Date(trends.timestamp).toLocaleString()}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}