import React from "react";
import { NewsItem } from "./trends.model";

const NewsItemDetail: React.FC<NewsItem> = ({
  title,
  url,
  source,
  picture,
  summary,
}) => {
  return (
    <li className="border-t pt-4 first:border-0 first:pt-0">
      {picture && (
        <img
          src={picture}
          alt={title}
          className="w-full h-48 object-cover rounded-lg mb-3"
        />
      )}
      <div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline font-medium"
        >
          {title}
        </a>
        <p className="text-sm text-gray-500 mt-1">Source: {source}</p>
        {summary && <p className="mt-2 text-sm text-gray-700">{summary}</p>}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-sm text-blue-600 hover:underline"
        >
          Read more &rarr;
        </a>
      </div>
    </li>
  );
};

export default NewsItemDetail;
