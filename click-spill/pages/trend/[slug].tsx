import { useRouter } from "next/router";
import TrendCard from "@/components/trends/TrendCard";
import Layout from "@/components/Layout";
import Head from "next/head";
import { Trend } from "@/components/trends/trends.model";
import { GetServerSideProps } from "next";

// Create a simple meta component to ensure consistency
const TrendMeta = ({ trend }: { trend: Trend }) => {
  const pageTitle = `${trend.title} | ClickSpill`;
  const pageDescription =
    trend.summary || `Latest news and analysis for ${trend.title}.`;
  const pageUrl = `https://clickspill.com/trend/${trend.slug}`;
  const pageImage = trend.picture;

  return (
    <Head>
      {/* Override meta tags with matching keys */}
      <title key="title">{pageTitle}</title>
      <meta key="description" name="description" content={pageDescription} />
      <link key="canonical" rel="canonical" href={pageUrl} />

      {/* Facebook and Open Graph */}
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

      {/* Twitter Card */}
      <meta
        key="twitter:card"
        name="twitter:card"
        content="summary_large_image"
      />
      <meta key="twitter:url" name="twitter:url" content={pageUrl} />
      <meta key="twitter:title" name="twitter:title" content={pageTitle} />
      <meta
        key="twitter:description"
        name="twitter:description"
        content={pageDescription}
      />
      {pageImage && (
        <meta key="twitter:image" name="twitter:image" content={pageImage} />
      )}

      {/* Keywords */}
      <meta
        key="keywords"
        name="keywords"
        content={`${trend.title}, ${
          trend.category?.name || ""
        }, trending news, clickspill`}
      />

      {/* JSON-LD */}
      <script
        key="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
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
          }),
        }}
      />
    </Head>
  );
};

interface TrendDetailPageProps {
  trendData: Trend | null;
  error: string | null;
}

export default function TrendDetailPage({
  trendData,
  error,
}: TrendDetailPageProps) {
  const router = useRouter();

  if (error) {
    return (
      <Layout>
        <div>{error}</div>
      </Layout>
    );
  }

  if (!trendData) {
    return (
      <Layout>
        <div>Trend not found.</div>
      </Layout>
    );
  }

  return (
    <Layout hasCustomMeta={true}>
      {/* Render meta tags component */}
      <TrendMeta trend={trendData} />

      <div className="max-w-5xl mx-auto py-8 px-4">
        <button
          className="mb-4 text-blue-600 hover:underline text-sm"
          onClick={() => router.back()}
        >
          ← Back
        </button>
        <TrendCard {...trendData} singleColumn={true} />
      </div>
    </Layout>
  );
}

// Server-side rendering to ensure meta tags are in the initial HTML
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug } = context.params || {};

  if (!slug) {
    return {
      props: {
        trendData: null,
        error: "Trend slug not provided",
      },
    };
  }

  try {
    // Fetch trend data from your API
    const res = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || "https://clickspill.com"
      }/api/trend-by-slug?slug=${slug}`
    );
    const data = await res.json();

    if (!data.trend) {
      return {
        props: {
          trendData: null,
          error: "Trend not found",
        },
      };
    }

    return {
      props: {
        trendData: data.trend,
        error: null,
      },
    };
  } catch (error) {
    console.error("Error fetching trend:", error);
    return {
      props: {
        trendData: null,
        error: "Error loading trend data",
      },
    };
  }
};
