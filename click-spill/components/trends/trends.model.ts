export interface NewsItem {
  id?: string;
  title: string;
  url: string;
  source: string;
  picture: string | null;
  summary: string;
  publishedAt?: string;
}

export interface Trend {
  id?: string;
  title: string;
  traffic: string;
  picture: string | null;
  source: string;
  publishedAt?: string;
  summary: string | null;
  news: NewsItem[];
}

export interface TrendsListProps {
  trends: Trend[];
  viewMode: "grid" | "list";
}

export interface TrendCardProps extends Trend {
  viewMode: "grid" | "list";
}

export interface NewsItemProps extends NewsItem {
  viewMode: "grid" | "list";
}

export interface DateOption {
  date: string; // YYYY-MM-DD format
  displayDate: string; // Formatted for display
}

export type ViewMode = "grid" | "list";
