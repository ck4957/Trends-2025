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
      bg-gray-50 dark:bg-gray-800 overflow-hidden shadow rounded-lg 
      hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-gray-700
      ${viewMode === "list" ? "w-full" : ""}
      trend-card
    `}
    >
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 leading-tight">
          {title}
        </h3>
        <div className="flex flex-wrap gap-x-2 items-center text-sm mt-2 mb-3">
          {traffic && (
            <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 rounded-full font-medium">
              ~{traffic} searches
            </span>
          )}
          {source && (
            <span className="text-gray-600 dark:text-gray-300 font-medium">
              {source}
            </span>
          )}
          {relativeTime && (
            <span
              className="text-gray-500 dark:text-gray-400"
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
            rounded-lg object-cover shadow-sm border border-gray-200 dark:border-gray-700
            ${
              viewMode === "grid"
                ? "w-full h-40 mb-4"
                : "w-28 h-28 float-right ml-4 mb-2"
            }
          `}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}

        {/* AI Summary Section */}
        {summary && (
          <div className="p-4 my-3 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-md border-l-4 border-blue-500 dark:border-blue-400">
            <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-2">
              AI Summary
            </h3>
            <p className="text-gray-800 dark:text-gray-200">{summary}</p>
          </div>
        )}
        {news && news.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 pb-1 border-b border-gray-200 dark:border-gray-700">
              Related News
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
