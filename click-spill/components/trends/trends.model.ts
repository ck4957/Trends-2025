export interface NewsItem {
  id?: string;
  title: string;
  url: string;
  source: string;
  picture: string | null;
  summary: string;
  publishedAt?: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  slug: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Trend {
  id: string;
  title: string;
  traffic: string;
  picture?: string;
  source?: string;
  publishedAt: string;
  summary?: string;
  categoryId?: string;
  category?: CategoryInfo | null;
  news: NewsItem[];
  ai_article?: string;
  ai_faq?: FAQItem[];
}

export interface TrendsListProps {
  trends: Trend[];
}

export interface TrendCardProps extends Trend {}

export interface NewsItemProps extends NewsItem {}

export interface DateOption {
  date: string; // YYYY-MM-DD format
  displayDate: string; // Formatted for display
  relativeDate: string; // Relative time string
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  count: number;
}
