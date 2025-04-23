import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY; // Server-side only, more privileged

// Initialize Supabase client if needed
const getSupabaseClient = () => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error("Supabase credentials not found in environment variables");
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
};

// /api/trends-by-date - Returns trends for a specific date
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: "Date parameter is required" });
    }

    const supabase = getSupabaseClient();

    // 1. First get the trend_day record for this date
    const { data: dayData, error: dayError } = await supabase
      .from("trend_days")
      .select("id")
      .eq("date", date)
      .single();

    if (dayError || !dayData) {
      return res.status(404).json({ error: "No data found for this date" });
    }

    // 2. Get all trends for this day
    const { data: trends, error: trendsError } = await supabase
      .from("trends")
      .select(
        `
        id, 
        title,
        approx_traffic,
        rank,
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
      .eq("trend_day_id", dayData.id)
      .order("rank", { ascending: true });

    if (trendsError) throw trendsError;

    // 3. Format the data for the frontend
    const formattedTrends = trends.map((trend) => ({
      id: trend.id,
      title: trend.title,
      traffic: trend.approx_traffic,
      news: trend.news_items.map((news) => ({
        id: news.id,
        title: news.title,
        url: news.url,
        source: news.source,
        picture: news.picture_url,
        summary: news.ai_summary,
        publishedAt: news.published_at,
      })),
    }));

    res.status(200).json({ trends: formattedTrends });
  } catch (error) {
    console.error("Error fetching trends for date:", error);
    res.status(500).json({ error: "Failed to fetch trends" });
  }
}
