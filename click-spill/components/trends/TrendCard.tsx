import React, { useState } from "react";
import NewsItemDetail from "./NewsItem";
import { TrendCardProps } from "./trends.model";
import { getRelativeTimeString } from "@/utils/dateUtils";
import { TrendingUp, Tag, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { getCategoryColor } from "./trend-util";

const TrendCard: React.FC<TrendCardProps & { singleColumn?: boolean }> = ({
  title,
  traffic,
  picture,
  source,
  publishedAt,
  summary,
  ai_article,
  ai_faq,
  news,
  category,
  slug,
  singleColumn = false,
}) => {
  const relativeTime = publishedAt ? getRelativeTimeString(publishedAt) : null;
  const [showMoreNews, setShowMoreNews] = useState(false);

  // If no AI summary, article, or FAQ, show image and related news in two columns
  const noAIContent =
    !summary && !ai_article && (!ai_faq || ai_faq.length === 0);

  if (singleColumn) {
    return (
      <div className="trend-card bg-gray-50 dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          <Link
            href={`/trend/${slug}`}
            className="hover:underline focus:underline"
          >
            {title}
          </Link>
        </h3>
        <div className="flex flex-wrap gap-x-2 items-center text-sm mb-4">
          {traffic && (
            <span className="px-2.5 py-1 bg-indigo-100 text-xs text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 flex items-center font-medium rounded-full">
              <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
              <span>{traffic}</span>
            </span>
          )}
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
        <div className="flex flex-col gap-4">
          {picture && (
            <div className="flex items-center justify-center mb-4">
              <Image
                src={picture}
                alt={title}
                width={300}
                height={200}
                className="rounded-lg object-cover w-full h-auto max-h-56 border border-gray-200 dark:border-gray-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
          {summary && (
            <div className="p-3 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-md border-l-4 border-blue-500 dark:border-blue-400 mb-2">
              <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-1">
                AI Summary
              </h3>
              <p className="text-gray-800 dark:text-gray-200">{summary}</p>
            </div>
          )}
          {ai_article && (
            <div className="prose max-w-none my-2">
              <h3 className="text-base font-semibold text-indigo-700 dark:text-indigo-300 mb-2">
                In-Depth Analysis
              </h3>
              <ReactMarkdown>{ai_article}</ReactMarkdown>
            </div>
          )}
          {ai_faq && ai_faq.length > 0 && (
            <div className="my-2">
              <h3 className="text-base font-semibold text-green-700 dark:text-green-300 mb-2">
                People Also Ask
              </h3>
              <ul className="space-y-2">
                {ai_faq.map((faq, idx) => (
                  <li
                    key={idx}
                    className="bg-gray-100 dark:bg-gray-700 rounded p-3"
                  >
                    <strong>Q: {faq.question}</strong>
                    <div className="ml-2 text-gray-800 dark:text-gray-200">
                      {faq.answer}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {news && news.length > 0 && (
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
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  if (noAIContent) {
    return (
      <div className="trend-card bg-gray-50 dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          <Link
            href={`/trend/${slug}`}
            className="hover:underline focus:underline"
          >
            {title}
          </Link>
        </h3>
        <div className="flex flex-wrap gap-x-2 items-center text-sm mb-4">
          {traffic && (
            <span className="px-2.5 py-1 bg-indigo-100 text-xs text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 flex items-center font-medium rounded-full">
              <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
              <span>{traffic}</span>
            </span>
          )}
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
        <div className="flex flex-col gap-4">
          {picture && (
            <div className="flex items-center justify-center mb-4">
              <Image
                src={picture}
                alt={title}
                width={300}
                height={200}
                className="rounded-lg object-cover w-full h-auto max-h-56 border border-gray-200 dark:border-gray-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
          {news && news.length > 0 && (
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
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  // AI content present: use previous layout (not image fixed on left)
  return (
    <div className="trend-card bg-gray-50 dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        <Link
          href={`/trend/${slug}`}
          className="hover:underline focus:underline"
        >
          {title}
        </Link>
      </h3>
      <div className="flex flex-wrap gap-x-2 items-center text-sm mb-4">
        {traffic && (
          <span className="px-2.5 py-1 bg-indigo-100 text-xs text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 flex items-center font-medium rounded-full">
            <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
            <span>{traffic}</span>
          </span>
        )}
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          {summary && (
            <div className="p-3 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-md border-l-4 border-blue-500 dark:border-blue-400 mb-2">
              <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-1">
                AI Summary
              </h3>
              <p className="text-gray-800 dark:text-gray-200">{summary}</p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-center">
          {picture && (
            <Image
              src={picture}
              alt={title}
              width={300}
              height={200}
              className="rounded-lg object-cover w-full h-auto max-h-56 border border-gray-200 dark:border-gray-700"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}
        </div>
        <div>
          {ai_article && (
            <div className="prose max-w-none my-2">
              <h3 className="text-base font-semibold text-indigo-700 dark:text-indigo-300 mb-2">
                In-Depth Analysis
              </h3>
              <ReactMarkdown>{ai_article}</ReactMarkdown>
            </div>
          )}
        </div>
        <div>
          {ai_faq && ai_faq.length > 0 && (
            <div className="my-2">
              <h3 className="text-base font-semibold text-green-700 dark:text-green-300 mb-2">
                People Also Ask
              </h3>
              <ul className="space-y-2">
                {ai_faq.map((faq, idx) => (
                  <li
                    key={idx}
                    className="bg-gray-100 dark:bg-gray-700 rounded p-3"
                  >
                    <strong>Q: {faq.question}</strong>
                    <div className="ml-2 text-gray-800 dark:text-gray-200">
                      {faq.answer}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {news && news.length > 0 && (
          <div className="mt-4">
            <button
              className="flex items-center text-blue-600 dark:text-blue-300 hover:underline text-sm mt-2"
              onClick={() => setShowMoreNews((v) => !v)}
            >
              {showMoreNews ? (
                <>
                  Hide Related News <ChevronUp className="ml-1 h-4 w-4" />
                </>
              ) : (
                <>
                  See more related news <ChevronDown className="ml-1 h-4 w-4" />
                </>
              )}
            </button>
            {showMoreNews && (
              <ul className="space-y-4 mt-2">
                {news.map((newsItem, idx) => (
                  <NewsItemDetail
                    key={idx}
                    title={newsItem.title}
                    url={newsItem.url}
                    source={newsItem.source}
                    picture={newsItem.picture}
                    summary={newsItem.summary}
                    publishedAt={newsItem.publishedAt}
                  />
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendCard;
