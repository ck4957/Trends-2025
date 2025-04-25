import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Loading from "../components/layout/Loading";
import ErrorComponent from "../components/layout/Error";
import TrendsList from "../components/trends/TrendsList";
import {
  Trend,
  ViewMode,
  DateOption,
  Category,
} from "../components/trends/trends.model";
import { getTrendDateString } from "@/utils/dateUtils";
import NewsletterSignup from "../components/newsletter/NewsletterSignup";

export default function Home() {
  // State management
  const [trends, setTrends] = useState<Trend[]>([]);
  const [filteredTrends, setFilteredTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timestamp, setTimestamp] = useState<string | null>(null);

  // Category state
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);

  // Pagination and view mode
  const [availableDates, setAvailableDates] = useState<DateOption[]>([]);
  const [currentDate, setCurrentDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Load view mode from localStorage
  useEffect(() => {
    const savedViewMode = localStorage.getItem("viewMode") as ViewMode;
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }
  }, []);

  // Unique Page Visit Logging
  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;
    const PAGE_KEY = `visited_${window.location.pathname}`;
    let visitId = localStorage.getItem("visit_id");
    if (!visitId) {
      visitId = crypto.randomUUID();
      localStorage.setItem("visit_id", visitId);
    }
    // Only log once per page per visitor
    if (!localStorage.getItem(PAGE_KEY)) {
      fetch("/api/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visit_id: visitId,
          page: window.location.pathname,
          user_agent: navigator.userAgent,
          // IP will be filled by API if needed
        }),
      });
      localStorage.setItem(PAGE_KEY, "1");
    }
  }, []);

  // Fetch available dates when component mounts
  useEffect(() => {
    async function fetchAvailableDates() {
      try {
        const response = await fetch("/api/available-dates");
        if (!response.ok) {
          throw new Error("Failed to fetch available dates");
        }

        const data = await response.json();

        if (data.dates && data.dates.length > 0) {
          // Convert raw dates to DateOption objects with formatted display date
          const dateOptions: DateOption[] = data.dates.map((date: string) => ({
            date,
            displayDate: formatDateForDisplay(date),
            relativeDate: getTrendDateString(date),
          }));

          setAvailableDates(dateOptions);

          // Set the most recent date as current
          setCurrentDate(data.dates[0]);
        } else {
          setError("No trend data available.");
        }
      } catch (err) {
        console.error("Error fetching available dates:", err);
        setError("Failed to load trend dates.");
      }
    }

    fetchAvailableDates();
  }, []);

  // Fetch categories when component mounts
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("/api/categories");
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }

        const data = await response.json();

        // Add "All categories" as the first option
        const allCategoriesOption = {
          id: "all",
          name: "All categories",
          slug: "all",
          count: data.categories.reduce(
            (sum: number, cat: Category) => sum + cat.count,
            0
          ),
        };

        setCategories([allCategoriesOption, ...data.categories]);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    }

    fetchCategories();
  }, []);

  // Fetch trends for the current date whenever it changes
  useEffect(() => {
    if (currentDate) {
      fetchTrendsForDate(currentDate);
    }
  }, [currentDate]);

  // Fetch trends for a specific date
  const fetchTrendsForDate = async (date: string) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/trends-by-date?date=${date}`);
      if (!response.ok) {
        throw new Error("Failed to fetch trends for date");
      }

      const data = await response.json();
      setTrends(data.trends);
      setFilteredTrends(data.trends); // Initialize filtered trends with all trends
      setTimestamp(new Date().toISOString());
    } catch (err) {
      console.error(`Error fetching trends for date ${date}:`, err);
      setError(`Failed to load trends for ${formatDateForDisplay(date)}.`);
    } finally {
      setLoading(false);
    }
  };

  // Toggle between grid and list view
  const toggleViewMode = () => {
    const newMode: ViewMode = viewMode === "grid" ? "list" : "grid";
    setViewMode(newMode);

    // Save preference to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("viewMode", newMode);
    }
  };

  // Format date for display (e.g., "April 23, 2025")
  const formatDateForDisplay = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderContent = () => {
    if (loading) return <Loading />;
    if (error) return <ErrorComponent message={error} />;

    if (filteredTrends.length === 0 && activeCategory !== "all") {
      return (
        <div className="text-center py-10">
          <p className="text-gray-600 dark:text-gray-400">
            No trends found for the category "
            {categories.find((c) => c.slug === activeCategory)?.name}".
          </p>
          <button
            onClick={() => setActiveCategory("all")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            View all trends
          </button>
        </div>
      );
    }

    return <TrendsList trends={filteredTrends} viewMode={viewMode} />;
  };

  return (
    <Layout>
      <div className="mb-6">
        {/* View Toggle and Date Selector */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          {/* Toggle View Button */}
          <button
            onClick={toggleViewMode}
            className="flex items-center mb-4 sm:mb-0 px-3 py-2 bg-white dark:bg-gray-800 rounded-md shadow text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            {viewMode === "grid" ? (
              <>
                <i className="fas fa-list mr-2"></i>
                <span>Switch to List View</span>
              </>
            ) : (
              <>
                <i className="fas fa-th-large mr-2"></i>
                <span>Switch to Grid View</span>
              </>
            )}
          </button>

          {/* Date Selection */}
          {availableDates.length > 0 && (
            <div className="flex space-x-1 overflow-x-auto pb-2 w-full sm:w-auto">
              {availableDates.map((dateOption) => (
                <button
                  key={dateOption.date}
                  onClick={() => setCurrentDate(dateOption.date)}
                  className={`
                    px-3 py-1 rounded-md whitespace-nowrap text-sm
                    ${
                      currentDate === dateOption.date
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                    }
                  `}
                  title={dateOption.displayDate}
                >
                  {dateOption.relativeDate || dateOption.displayDate}{" "}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Current Date Display */}
        {currentDate && (
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Trends for {formatDateForDisplay(currentDate)}
          </h1>
        )}
      </div>

      {/* Category tabs - desktop */}
      <div className="hidden md:block mb-8 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.slug)}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeCategory === category.slug
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              {category.name}{" "}
              <span className="ml-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full px-2 py-0.5 text-xs">
                {category.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Category dropdown - mobile */}
      <div className="md:hidden mb-6">
        <label
          htmlFor="category-select"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Filter by Category
        </label>
        <div className="relative">
          <select
            id="category-select"
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name} ({category.count})
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      {renderContent()}

      {/* Newsletter Signup */}
      {/* <div className="mt-10">
        <NewsletterSignup />
      </div> */}
    </Layout>
  );
}
