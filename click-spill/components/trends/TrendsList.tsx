import React from "react";
import TrendCard from "./TrendCard";
import { TrendsListProps } from "./trends.model";
import Script from "next/script";
const TrendsList: React.FC<TrendsListProps> = ({ trends }) => {
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

      <div className="flex flex-col space-y-6">
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
            ai_article={trend.ai_article}
            ai_faq={trend.ai_faq}
            news={trend.news}
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
                  "articleBody": ${JSON.stringify(
                    trend.ai_article || trend.summary || ""
                  )},
                  ${
                    trend.ai_faq && trend.ai_faq.length > 0
                      ? `"mainEntity": [
                    ${trend.ai_faq
                      .map(
                        (faq) => `{
                      "@type": "Question",
                      "name": ${JSON.stringify(faq.question)},
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": ${JSON.stringify(faq.answer)}
                      }
                    }`
                      )
                      .join(",\n")}
                  ]`
                      : ""
                  }
                  ,"author": {
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
