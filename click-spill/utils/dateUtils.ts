/**
 * Formats a date as a relative time string (e.g., "2 hours ago", "yesterday")
 */
export function getRelativeTimeString(date: Date | string | number): string {
  const targetDate = date instanceof Date ? date : new Date(date);
  const now = new Date();

  // Handle invalid dates
  if (isNaN(targetDate.getTime())) {
    return "Invalid date";
  }

  const diffInMs = now.getTime() - targetDate.getTime();
  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  // Format based on the difference
  if (diffInSecs < 60) {
    return "just now";
  } else if (diffInMins < 60) {
    return `${diffInMins}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays === 1) {
    return "yesterday";
  } else if (diffInDays < 30) {
    return `${diffInDays}d ago`;
  } else {
    // Format as month and day for older dates
    return targetDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }
}

/**
 * Returns a friendly string for trend dates like "today", "yesterday", "2 days ago"
 */
export function getTrendDateString(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map((num) => parseInt(num, 10));

  // Create date with specific year, month (0-based), and day
  const date = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDay = new Date(date);
  targetDay.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - targetDay.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
