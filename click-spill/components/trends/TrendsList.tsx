import React from "react";
import TrendCard from "./TrendCard";
import { TrendsListProps } from "./trends.model";
import Script from "next/script";
const TrendsList: React.FC<TrendsListProps> = ({ trends, viewMode }) => {
  if (trends.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-300 font-medium">
          No trending topics found.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
        <span className="inline-block border-b-3 border-blue-500 dark:border-blue-400 pb-2 -mb-[9px]">
          Trending Topics
        </span>
      </h2>

      <div
        className={`
        ${
          viewMode === "grid"
            ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            : "flex flex-col space-y-6"
        }
      `}
      >
        {trends.map((trend, index) => (
          <TrendCard
            key={trend.id || index}
            id={trend.id}
            title={trend.title}
            traffic={trend.traffic}
            picture={trend.picture}
            source={trend.source}
            publishedAt={trend.publishedAt}
            summary={trend.summary}
            news={trend.news}
            viewMode={viewMode}
            category={trend.category} // Pass the category prop
          />
        ))}
      </div>

      {/* Enhanced JSON-LD for trending topics */}
      <Script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "itemListElement": [
              ${trends
                .map(
                  (trend, index) => `{
                "@type": "ListItem",
                "position": ${index + 1},
                "item": {
                  "@type": "Article",
                  "headline": "${trend.title}",
                  "description": "${trend.summary || ""}",
                  "image": "${trend.picture || ""}",
                  "datePublished": "${trend.publishedAt}",
                  "author": {
                    "@type": "Organization",
                    "name": "ClickSpill"
                  }
                }
              }`
                )
                .join(",")}
            ]
          }
          `,
        }}
      />
    </div>
  );
};

export default TrendsList;
