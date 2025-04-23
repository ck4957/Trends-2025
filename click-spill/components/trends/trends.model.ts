export interface NewsItem {
  title: string;
  url: string;
  source: string;
  picture: string | null;
  summary: string;
}

export interface Trend {
  title: string;
  traffic: string;
  pubDate: string | null; // Add publication date
  news: NewsItem[];
}

export interface TrendsListProps {
  trends: Trend[];
}
