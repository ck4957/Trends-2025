import React from "react";
import TrendCard from "./TrendCard";
import { TrendsListProps } from "./trends.model";

const TrendsList: React.FC<TrendsListProps> = ({ trends, viewMode }) => {
  if (trends.length === 0) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400">
        No trending topics found.
      </p>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
        Trending Topics
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
          />
        ))}
      </div>
    </div>
  );
};

export default TrendsList;
