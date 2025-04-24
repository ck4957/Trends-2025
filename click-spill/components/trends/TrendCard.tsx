import React from "react";
import NewsItemDetail from "./NewsItem";
import { TrendCardProps } from "./trends.model";
import { getRelativeTimeString } from "@/utils/dateUtils";

const TrendCard: React.FC<TrendCardProps> = ({
  title,
  traffic,
  picture,
  source,
  publishedAt,
  summary,
  news,
  viewMode,
}) => {
  // Use relative time formatting
  const relativeTime = publishedAt ? getRelativeTimeString(publishedAt) : null;

  return (
    <div
      className={`
      bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg 
      hover:shadow-md transition-shadow duration-300
      ${viewMode === "list" ? "w-full" : ""}
    `}
    >
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        <div className="flex flex-wrap gap-x-2 items-center text-sm mt-1.5 mb-3">
          {traffic && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
              ~{traffic} searches
            </span>
          )}
          {source && (
            <span className="text-gray-500 dark:text-gray-400">{source}</span>
          )}
          {relativeTime && (
            <span
              className="text-gray-400 dark:text-gray-500"
              title={publishedAt ? new Date(publishedAt).toLocaleString() : ""}
            >
              {relativeTime}
            </span>
          )}
        </div>
        {picture && (
          <img
            src={picture}
            alt={title}
            className={`
            rounded-lg object-cover 
            ${
              viewMode === "grid"
                ? "w-full h-36 mb-3"
                : "w-24 h-24 float-right ml-4 mb-2"
            }
          `}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}

        {/* AI Summary Section */}
        {summary && (
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              AI Summary
            </h3>
            <p className="text-gray-700 dark:text-gray-300">{summary}</p>
          </div>
        )}
        {news && news.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                  publishedAt={newsItem.publishedAt}
                  viewMode={viewMode}
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
