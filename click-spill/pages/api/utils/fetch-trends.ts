import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;

export const getSupabaseClient = () => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error("Supabase credentials not found in environment variables");
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
};

export async function fetchTrends({
  date,
  slug,
  limit,
  requireAiSummary = true,
}: {
  date: string;
  slug?: string;
  limit?: number;
  requireAiSummary?: boolean;
}) {
  const supabase = getSupabaseClient();

  // 1. Get all trend_day records for this date
  const { data: dayData, error: dayError } = await supabase
    .from("trend_days")
    .select("id")
    .eq("date", date);

  if (dayError || !dayData || dayData.length === 0) {
    throw new Error("No data found for this date");
  }

  // Extract all trend_day IDs for this date
  const trendDayIds = dayData.map((day) => day.id);

  // 2. Build query for trends
  let query = supabase
    .from("trends")
    .select(
      `
      id,
      title,
      slug,
      approx_traffic,
      ai_summary,
      ai_article,
      ai_faq,
      picture_url,
      source,
      published_at,
      rank,
      category_id,
      categories (
        id,
        name,
        slug
      ),
      news_items (
        id,
        title,
        url,
        source,
        picture_url,
        ai_summary,
        published_at
      )
    `
    )
    .in("trend_day_id", trendDayIds);

  // Only fetch trends with AI summaries if required
  if (requireAiSummary) {
    query = query.not("ai_summary", "is", null);
  }
  if (slug) query = query.eq("slug", slug);
  if (limit) query = query.limit(limit);
  if (!slug) {
    query = query
      .order("published_at", { ascending: false })
      .order("rank", { ascending: false });
  }

  const { data: trends, error: trendsError } = await query;
  if (trendsError) throw trendsError;

  // 3. Format the data for the frontend
  const formattedTrends = trends.map((trend: any) => ({
    id: trend.id,
    title: trend.title,
    slug: trend.slug,
    traffic: trend.approx_traffic,
    picture: trend.picture_url,
    source: trend.source,
    publishedAt: trend.published_at,
    summary: trend.ai_summary,
    ai_article: trend.ai_article,
    ai_faq: trend.ai_faq,
    categoryId: trend.category_id,
    category: trend.categories
      ? {
          id: trend.categories.id,
          name: trend.categories.name,
          slug: trend.categories.slug,
        }
      : null,
    news: trend.news_items.map((news: any) => ({
      id: news.id,
      title: news.title,
      url: news.url,
      source: news.source,
      picture: news.picture_url,
      summary: news.ai_summary,
      publishedAt: news.published_at,
    })),
  }));

  return formattedTrends;
}
