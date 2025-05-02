import { useEffect, useState, useRef } from "react"; // Add useRef
import Layout from "../components/Layout";
import Loading from "../components/layout/Loading";
import ErrorComponent from "../components/layout/Error";
import TrendsList from "../components/trends/TrendsList";
import { Trend, DateOption, Category } from "../components/trends/trends.model";
import { getTrendDateString } from "@/utils/dateUtils";
import NewsletterSignup from "../components/newsletter/NewsletterSignup";
// Add Lucide React icons import
import { Calendar } from "lucide-react";

export default function Home() {
  // Add these refs to track initial loads
  const initialCategoriesLoaded = useRef(false);
  const initialDatesLoaded = useRef(false);
  const pendingRequests = useRef(new Map());

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

  // Fix the dates fetching effect
  useEffect(() => {
    async function fetchAvailableDates() {
      if (initialDatesLoaded.current) return;

      try {
        const response = await fetch("/api/available-dates");
        if (!response.ok) {
          throw new Error("Failed to fetch available dates");
        }

        const data = await response.json();

        if (data.dates && data.dates.length > 0) {
          const dateOptions: DateOption[] = data.dates.map((date: string) => ({
            date,
            displayDate: formatDateForDisplay(date),
            relativeDate: getTrendDateString(date),
          }));

          setAvailableDates(dateOptions);
          setCurrentDate(data.dates[0]);
          initialDatesLoaded.current = true;
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

  // Improved fetchCategories with request deduplication
  async function fetchCategories(date: string | null = null) {
    try {
      // Create a request key
      const requestKey = `categories-${date || "all"}`;

      // Skip if this exact request is already in flight
      if (pendingRequests.current.has(requestKey)) {
        console.log(`Skipping duplicate request: ${requestKey}`);
        return;
      }

      // Mark this request as pending
      pendingRequests.current.set(requestKey, true);

      // Include date in the query if it's available
      const endpoint = date
        ? `/api/categories?date=${date}`
        : "/api/categories";

      const response = await fetch(endpoint);

      // Remove from pending regardless of success or failure
      pendingRequests.current.delete(requestKey);

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

  // Create a deduplicating fetch trends function
  const fetchTrendsForDate = async (date: string) => {
    const requestKey = `trends-${date}`;

    // Skip if this exact request is already in flight
    if (pendingRequests.current.has(requestKey)) {
      console.log(`Skipping duplicate request: ${requestKey}`);
      return;
    }

    setLoading(true);
    setError("");
    pendingRequests.current.set(requestKey, true);

    try {
      const response = await fetch(`/api/trends-by-date?date=${date}`);
      pendingRequests.current.delete(requestKey);

      if (!response.ok) {
        throw new Error("Failed to fetch trends for date");
      }

      const data = await response.json();
      setTrends(data.trends);
      setFilteredTrends(data.trends);
      setTimestamp(new Date().toISOString());
    } catch (err) {
      console.error(`Error fetching trends for date ${date}:`, err);
      setError(`Failed to load trends for ${formatDateForDisplay(date)}.`);
    } finally {
      setLoading(false);
    }
  };

  // Fix the main fetching effect - REMOVE categories.length from dependencies
  useEffect(() => {
    if (currentDate) {
      // We have a date, fetch trends and categories for that specific date
      fetchTrendsForDate(currentDate);
      fetchCategories(currentDate);
    } else if (!initialCategoriesLoaded.current) {
      // No date yet but we need categories, fetch without date filter
      fetchCategories(null);
      initialCategoriesLoaded.current = true;
    }
  }, [currentDate]); // Remove categories.length dependency

  // Add this useEffect to filter trends when activeCategory changes
  useEffect(() => {
    if (!trends.length) return;

    if (activeCategory === "all") {
      setFilteredTrends(trends);
    } else {
      const filtered = trends.filter(
        (trend) => trend.category?.slug === activeCategory
      );
      setFilteredTrends(filtered);
    }
  }, [activeCategory, trends]);

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

    return <TrendsList trends={filteredTrends} />;
  };

  return (
    <Layout>
      <div className="mb-6">
        {/* View Toggle and Date Selector */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          {/* Date Selection */}
          {availableDates.length > 0 && (
            <div className="flex space-x-1 overflow-x-auto pb-2 w-full sm:w-auto">
              {availableDates.map((dateOption) => (
                <button
                  key={dateOption.date}
                  onClick={() => setCurrentDate(dateOption.date)}
                  className={`
                    px-3 py-1 rounded-md whitespace-nowrap text-sm flex items-center
                    ${
                      currentDate === dateOption.date
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                    }
                  `}
                  title={dateOption.displayDate}
                >
                  {/* Add Calendar icon to date buttons */}
                  {currentDate === dateOption.date && (
                    <Calendar className="w-3 h-3 mr-1" />
                  )}
                  {dateOption.relativeDate || dateOption.displayDate}{" "}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Current Date Display with Calendar icon */}
        {currentDate && (
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
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
            className="appearance-none mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
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

      {/* Newsletter Signup with Share2 icon */}
      {/* <div className="mt-10">
        <div className="flex items-center mb-2">
          <Share2 className="w-4 h-4 mr-2" />
          <h3 className="text-lg font-semibold">Stay Updated</h3>
        </div>
        <NewsletterSignup />
      </div> */}
    </Layout>
  );
}
