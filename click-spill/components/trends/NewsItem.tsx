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
    `}
    >
      <div className={viewMode === "list" ? "flex-1" : ""}>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          {title}
        </a>

        <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
          <span>{source}</span>
          {relativeTime && (
            <>
              <span className="mx-1">•</span>
              <span
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
          className="mt-2 inline-block text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Read more &rarr;
        </a>
      </div>
    </li>
  );
};

export default NewsItemDetail;
