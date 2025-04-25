import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import Loading from "../../components/layout/Loading";
import ErrorComponent from "../../components/layout/Error";
import TrendsList from "../../components/trends/TrendsList";
import {
  Trend,
  ViewMode,
  Category,
} from "../../components/trends/trends.model";
import { Calendar } from "lucide-react";

export default function DatePage() {
  const router = useRouter();
  const { date } = router.query;

  // Reuse the same state management as index.tsx
  const pendingRequests = useRef(new Map());
  const [trends, setTrends] = useState<Trend[]>([]);
  const [filteredTrends, setFilteredTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Fetch trends when date is available
  useEffect(() => {
    if (!date || typeof date !== "string") return;

    const fetchTrendsForDate = async (dateStr: string) => {
      const requestKey = `trends-${dateStr}`;

      if (pendingRequests.current.has(requestKey)) {
        return;
      }

      setLoading(true);
      setError("");
      pendingRequests.current.set(requestKey, true);

      try {
        console.log(`Fetching trends for date: ${dateStr}`);
        const endpoint = `/api/trends-by-date?date=${encodeURIComponent(
          dateStr
        )}`;
        console.log(`API endpoint: ${endpoint}`);

        const response = await fetch(endpoint);
        pendingRequests.current.delete(requestKey);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API error (${response.status}): ${errorText}`);
          throw new Error(
            `Failed to fetch trends for date (Status: ${response.status})`
          );
        }

        const data = await response.json();
        console.log(`Received ${data.trends?.length || 0} trends`);
        setTrends(data.trends || []);
        setFilteredTrends(data.trends || []);
      } catch (err) {
        console.error(`Error fetching trends for date ${dateStr}:`, err);
        setError(`Failed to load trends for ${formatDateForDisplay(dateStr)}.`);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendsForDate(date);
    fetchCategories(date);
  }, [date]);

  // Fetch categories for the date
  async function fetchCategories(date: string | null = null) {
    try {
      const requestKey = `categories-${date || "all"}`;

      if (pendingRequests.current.has(requestKey)) {
        return;
      }

      pendingRequests.current.set(requestKey, true);

      const endpoint = date
        ? `/api/categories?date=${date}`
        : "/api/categories";

      const response = await fetch(endpoint);
      pendingRequests.current.delete(requestKey);

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await response.json();

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

  // Filter trends when activeCategory changes
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

  const formatDateForDisplay = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Toggle view mode
  const toggleViewMode = () => {
    const newMode: ViewMode = viewMode === "grid" ? "list" : "grid";
    setViewMode(newMode);
    localStorage.setItem("viewMode", newMode);
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
    <Layout
      title={`Trends for ${
        date ? formatDateForDisplay(date as string) : "Loading..."
      } | ClickSpill`}
    >
      <div className="mb-6">
        {/* View Toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
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

          <a
            href="/"
            className="px-3 py-1 rounded-md text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Back to Latest Trends
          </a>
        </div>

        {/* Current Date Display */}
        {date && (
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Trends for {formatDateForDisplay(date as string)}
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
    </Layout>
  );
}
