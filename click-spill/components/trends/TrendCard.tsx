import React from "react";
import NewsItemDetail from "./NewsItem";
import { Trend } from "./trends.model";

const TrendCard: React.FC<Trend> = ({ title, traffic, pubDate, news }) => {
  // Format the pubDate to a more readable format if it exists
  const formattedDate = pubDate
    ? new Date(pubDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mb-1">Traffic: {traffic}</p>
        {formattedDate && (
          <p className="text-xs text-gray-400 mb-4">
            Published: {formattedDate}
          </p>
        )}

        {news && news.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Related News:
            </h3>
            <ul className="space-y-4">
              {news.map((newsItem, idx) => (
                <NewsItemDetail
                  key={idx}
                  title={newsItem.title}
                  url={newsItem.url}
                  source={newsItem.source}
                  picture={newsItem.picture}
                  summary={newsItem.summary}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendCard;
