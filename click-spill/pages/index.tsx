import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Loading from "../components/layout/Loading";
import ErrorComponent from "../components/layout/Error";
import TrendsList from "../components/trends/TrendsList";
import { Trend, ViewMode, DateOption } from "../components/trends/trends.model";
import { relative } from "path";
import { getTrendDateString } from "@/utils/dateUtils";

export default function Home() {
  // State management
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timestamp, setTimestamp] = useState<string | null>(null);

  // New states for pagination and view mode
  const [availableDates, setAvailableDates] = useState<DateOption[]>([]);
  const [currentDate, setCurrentDate] = useState<string | null>(null);
  // Start with a default value that doesn't depend on localStorage
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Add a separate useEffect for localStorage
  useEffect(() => {
    // This will only run on the client
    const savedViewMode = localStorage.getItem("viewMode") as ViewMode;
    if (savedViewMode) {
      setViewMode(savedViewMode);
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
    return <TrendsList trends={trends} viewMode={viewMode} />;
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

      {renderContent()}
    </Layout>
  );
}
