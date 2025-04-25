import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import Loading from "../../components/layout/Loading";
import ErrorComponent from "../../components/layout/Error";
import TrendsList from "../../components/trends/TrendsList";
import {
  Trend,
  ViewMode,
  DateOption,
} from "../../components/trends/trends.model";
import { Tag } from "lucide-react";

export default function CategoryPage() {
  const router = useRouter();
  const { slug } = router.query;

  const pendingRequests = useRef(new Map());
  const [trends, setTrends] = useState<Trend[]>([]);
  const [filteredTrends, setFilteredTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [availableDates, setAvailableDates] = useState<DateOption[]>([]);
  const [currentDate, setCurrentDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Fetch available dates
  useEffect(() => {
    async function fetchAvailableDates() {
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
            relativeDate:
              date === new Date().toISOString().split("T")[0] ? "Today" : "",
          }));

          setAvailableDates(dateOptions);
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

  // Fetch category info and trends when slug changes
  useEffect(() => {
    if (!slug || typeof slug !== "string" || !currentDate) return;

    fetchCategoryTrends(slug, currentDate);
  }, [slug, currentDate]);

  // Helper to format date for display
  const formatDateForDisplay = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Fetch trends filtered by category
  async function fetchCategoryTrends(categorySlug: string, date: string) {
    const requestKey = `trends-${date}-${categorySlug}`;

    if (pendingRequests.current.has(requestKey)) {
      return;
    }

    setLoading(true);
    setError("");
    pendingRequests.current.set(requestKey, true);

    try {
      // Get all trends for the date
      const response = await fetch(`/api/trends-by-date?date=${date}`);
      pendingRequests.current.delete(requestKey);

      if (!response.ok) {
        throw new Error("Failed to fetch trends");
      }

      const data = await response.json();

      // Find the category name from the first trend with this category
      const matchingTrend = data.trends.find(
        (t: Trend) => t.category?.slug === categorySlug
      );
      if (matchingTrend && matchingTrend.category) {
        setCategoryName(matchingTrend.category.name);
      }

      // Filter trends by category
      const filtered = data.trends.filter(
        (trend: Trend) => trend.category?.slug === categorySlug
      );

      setTrends(filtered);
      setFilteredTrends(filtered);
    } catch (err) {
      console.error(`Error fetching trends:`, err);
      setError(`Failed to load trends for this category.`);
    } finally {
      setLoading(false);
    }
  }

  // Toggle view mode
  const toggleViewMode = () => {
    const newMode: ViewMode = viewMode === "grid" ? "list" : "grid";
    setViewMode(newMode);
    localStorage.setItem("viewMode", newMode);
  };

  const renderContent = () => {
    if (loading) return <Loading />;
    if (error) return <ErrorComponent message={error} />;

    if (filteredTrends.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-gray-600 dark:text-gray-400">
            No trends found in this category.
          </p>
          <a
            href="/"
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-block"
          >
            View all trends
          </a>
        </div>
      );
    }

    return <TrendsList trends={filteredTrends} viewMode={viewMode} />;
  };

  return (
    <Layout title={`${categoryName || slug} Trends | ClickSpill`}>
      <div className="mb-6">
        {/* <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
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
                  {dateOption.relativeDate || dateOption.displayDate}
                </button>
              ))}
            </div>
          )}
        </div> */}

        {/* Category Title */}
        <div className="flex items-center mb-6">
          <Tag className="w-5 h-5 mr-2 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {categoryName || slug} Trends
            {currentDate && (
              <span className="text-lg font-normal text-gray-600 dark:text-gray-400 ml-2">
                for {formatDateForDisplay(currentDate)}
              </span>
            )}
          </h1>
        </div>

        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex text-sm text-gray-500 dark:text-gray-400">
            <li>
              <a
                href="/"
                className="hover:text-blue-600 dark:hover:text-blue-400"
              >
                Home
              </a>
            </li>
            <li className="mx-2">/</li>
            <li className="text-gray-900 dark:text-gray-100 font-medium">
              {categoryName || slug}
            </li>
          </ol>
        </nav>
      </div>

      {renderContent()}
    </Layout>
  );
}
