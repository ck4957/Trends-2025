import React from "react";
import { NewsItemProps } from "./trends.model";

const NewsItemDetail: React.FC<NewsItemProps> = ({
  title,
  url,
  source,
  picture,
  summary,
  publishedAt,
  viewMode
}) => {
  // Format published date if available
  const formattedDate = publishedAt 
    ? new Date(publishedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <li className={`
      border-t border-gray-200 dark:border-gray-700 pt-4 first:border-0 first:pt-0
      ${viewMode === 'list' ? 'flex gap-4' : ''}
    `}>
      {picture && (
        <img
          src={picture}
          alt={title}
          className={`
            rounded-lg object-cover 
            ${viewMode === 'grid' 
              ? 'w-full h-36 mb-3' 
              : 'w-24 h-24 flex-shrink-0'
            }
          `}
        />
      )}
      <div className={viewMode === 'list' ? 'flex-1' : ''}>
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
          {formattedDate && (
            <>
              <span className="mx-1">•</span>
              <span>{formattedDate}</span>
            </>
          )}
        </div>
        
        {summary && (
          <div className={`
            text-sm text-gray-700 dark:text-gray-300
            ${viewMode === 'grid' ? 'mt-2' : 'mt-1'}
          `}>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">AI Generated Summary:</div>
            <p>{summary}</p>
          </div>
        )}
        
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
