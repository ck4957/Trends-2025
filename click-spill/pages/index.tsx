import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Loading from "../components/layout/Loading";
import ErrorComponent from "../components/layout/Error";
import TrendsList from "../components/trends/TrendsList";

// Define shared interfaces in a separate file later if they're used across multiple components
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
  pubDate: string | null; // Add publication date
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
        const response = await fetch("/api/trends");
        if (!response.ok) {
          setError("Failed to fetch trends. Please try again later.");
          //throw new Error("Failed to fetch trends");
        }
        const data: ApiResponse = await response.json();
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

  // Format timestamp for display
  const formattedTime = timestamp ? new Date(timestamp).toLocaleString() : "";

  const renderContent = () => {
    if (loading) return <Loading />;
    if (error) return <ErrorComponent message={error} />;
    return <TrendsList trends={trends} />;
  };

  return (
    <Layout>
      {timestamp && (
        <div className="mb-6">
          <p className="text-xs text-gray-400">Last updated: {formattedTime}</p>
        </div>
      )}
      {renderContent()}
    </Layout>
  );
}
