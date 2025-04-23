import React from "react";
import TrendCard from "./TrendCard";
import { TrendsListProps } from "./trends.model";

const TrendsList: React.FC<TrendsListProps> = ({ trends }) => {
  if (trends.length === 0) {
    return (
      <p className="text-center text-gray-500">No trending topics found.</p>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Today's Trending Topics
      </h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {trends.map((trend, index) => (
          <TrendCard
            key={index}
            title={trend.title}
            traffic={trend.traffic}
            pubDate={trend.pubDate}
            news={trend.news}
          />
        ))}
      </div>
    </div>
  );
};

export default TrendsList;
