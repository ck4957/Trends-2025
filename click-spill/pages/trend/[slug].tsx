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
        {/* Add matching key attributes to override _app.tsx tags */}
        <title key="title">{pageTitle}</title>
        <meta key="description" name="description" content={pageDescription} />
        <link key="canonical" rel="canonical" href={pageUrl} />

        {/* Open Graph tags with unique keys */}
        <meta key="og:url" property="og:url" content={pageUrl} />
        <meta key="og:type" property="og:type" content="article" />
        <meta key="og:title" property="og:title" content={pageTitle} />
        <meta
          key="og:description"
          property="og:description"
          content={pageDescription}
        />
        {pageImage && (
          <meta key="og:image" property="og:image" content={pageImage} />
        )}

        {/* Keywords specific to this trend */}
        <meta
          key="keywords"
          name="keywords"
          content={`${trend.title}, ${
            trend.category?.name || ""
          }, trending news, clickspill`}
        />

        {/* Structured Data */}
        <script key="json-ld" type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
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
