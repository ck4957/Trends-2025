import React from "react";
import NewsItemDetail from "./NewsItem";
import { TrendCardProps } from "./trends.model";
import { getRelativeTimeString } from "@/utils/dateUtils";
import { TrendingUp, Tag } from "lucide-react"; // Import Tag icon
import Image from "next/image";
const TrendCard: React.FC<TrendCardProps> = ({
  title,
  traffic,
  picture,
  source,
  publishedAt,
  summary,
  news,
  viewMode,
  category, // Include the category prop
}) => {
  // Use relative time formatting
  const relativeTime = publishedAt ? getRelativeTimeString(publishedAt) : null;

  // Comprehensive category color mapping
  const getCategoryColor = (slug: string) => {
    const colors: { [key: string]: string } = {
      // Original categories
      technology:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      entertainment:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      sports:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      politics: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      science:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
      health: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",

      // Updated business category
      "business-finance":
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",

      // New categories
      "food-drink":
        "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
      "travel-transportation":
        "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
      "law-government":
        "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200",
      "autos-vehicles":
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      "beauty-fashion":
        "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-200",
      climate:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
      games:
        "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200",
      "hobbies-leisure":
        "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200",
      "jobs-education":
        "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
      "pets-animals":
        "bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200",
      shopping: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200",
      other: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
    };

    return colors[slug] || colors["other"];
  };

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
            <span
              className="top-0 right-0 mt-1 px-2.5 py-1 bg-indigo-100 text-xs text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 flex items-center 
            font-medium rounded-full"
            >
              <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
              <span>{traffic}</span>
            </span>
          )}

          {/* Category Badge */}
          {category && (
            <span
              className={`px-2.5 py-1 text-xs flex items-center font-medium rounded-full ${getCategoryColor(
                category.slug
              )}`}
            >
              <Tag className="h-3 w-3 mr-1" />
              {category.name}
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

        {/* Rest of your component remains the same */}
        {picture && (
          <Image
            src={picture}
            alt={title}
            width={500}
            height={500}
            layout="responsive"
            className={`
            rounded-lg object-cover shadow-sm border border-gray-200 dark:border-gray-700
            ${
              viewMode === "grid"
                ? "w-full h-40 mb-4"
                : "w-50 h-50 float-right ml-4 mb-2"
            }
          `}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          // <img
          //   src={picture}
          //   alt={title}
          //   className={`
          //   rounded-lg object-cover shadow-sm border border-gray-200 dark:border-gray-700
          //   ${
          //     viewMode === "grid"
          //       ? "w-full h-40 mb-4"
          //       : "w-50 h-50 float-right ml-4 mb-2"
          //   }
          // `}
          //   onError={(e) => {
          //     (e.target as HTMLImageElement).style.display = "none";
          //   }}
          // />
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
