import React from "react";
import { NewsItemProps } from "./trends.model";
import { getRelativeTimeString } from "@/utils/dateUtils";

const NewsItemDetail: React.FC<NewsItemProps> = ({
  title,
  url,
  source,
  picture,
  summary,
  publishedAt,
  viewMode,
}) => {
  // Format published date if available
  // Get relative time
  const relativeTime = publishedAt ? getRelativeTimeString(publishedAt) : null;

  return (
    <li
      className={`
      border-t border-gray-200 dark:border-gray-700 pt-4 first:border-0 first:pt-0
      ${viewMode === "list" ? "flex gap-4" : ""}
      hover:bg-gray-50 dark:hover:bg-gray-800/70 p-2 -m-2 rounded-md transition-colors duration-200
    `}
    >
      <div className={viewMode === "list" ? "flex-1" : ""}>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium leading-tight inline-block"
        >
          {title}
        </a>

        <div className="mt-1 flex items-center text-sm">
          <span className="text-emerald-700 dark:text-emerald-400 font-medium">
            {source}
          </span>
          {relativeTime && (
            <>
              <span className="mx-1.5 text-gray-400 dark:text-gray-600">•</span>
              <span
                className="text-gray-500 dark:text-gray-400"
                title={
                  publishedAt ? new Date(publishedAt).toLocaleString() : ""
                }
              >
                {relativeTime}
              </span>
            </>
          )}
        </div>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
        >
          Read more <span aria-hidden="true">→</span>
        </a>
      </div>
    </li>
  );
};

export default NewsItemDetail;
