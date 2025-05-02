import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import TrendCard from "@/components/trends/TrendCard";
import Layout from "@/components/Layout";

export default function TrendDetailPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [trend, setTrend] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    const today = new Date().toISOString().slice(0, 10);
    setLoading(true);
    fetch(`/api/trend-by-slug?slug=${slug}&date=${today}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.trend) {
          setTrend(data.trend);
          setError(null);
        } else {
          setTrend(null);
          setError("Trend not found.");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Error loading trend.");
        setLoading(false);
      });
  }, [slug]);

  if (loading)
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );
  if (error)
    return (
      <Layout>
        <div>{error}</div>
      </Layout>
    );
  if (!trend)
    return (
      <Layout>
        <div>Trend not found.</div>
      </Layout>
    );

  return (
    <Layout>
      <div className="max-w-5xl py-8">
        <button
          className="mb-4 text-blue-600 hover:underline text-sm"
          onClick={() => router.back()}
        >
          ← Back
        </button>
        <TrendCard {...trend} singleColumn={true} />
      </div>
    </Layout>
  );
}
