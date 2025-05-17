import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import TrendCard from "@/components/trends/TrendCard";
import Layout from "@/components/Layout";
import Head from "next/head";
import { Trend } from "@/components/trends/trends.model";

export default function TrendDetailPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [trend, setTrend] = useState<Trend | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/trend-by-slug?slug=${slug}`)
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

  // SEO meta tags
  const pageTitle = `${trend.title}`;
  const pageDescription =
    trend.summary || `Latest news and analysis for ${trend.title}.`;
  const pageUrl = `https://clickspill.com/trend/${trend.slug}`;
  const pageImage = trend.picture;

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: trend.title,
    description: trend.summary,
    image: pageImage,
    datePublished: trend.publishedAt,
    author: {
      "@type": "Organization",
      name: "Click Spill",
    },
    mainEntityOfPage: pageUrl,
  };

  return (
    <Layout>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={pageUrl} />
        {/* Open Graph */}
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={pageImage} />
        {/* Structured Data */}
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Head>
      <div className="max-w-5xl mx-auto py-8 px-4">
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
