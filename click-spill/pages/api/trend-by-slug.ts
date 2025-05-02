import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { fetchTrends } from "./utils/fetch-trends";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;

const getSupabaseClient = () => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error("Supabase credentials not found in environment variables");
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
};

// /api/trend-by-slug - Returns a single trend for a given slug and date
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { slug, date } = req.query;

    if (!slug || !date) {
      return res
        .status(400)
        .json({ error: "slug and date parameters are required" });
    }

    const trends = await fetchTrends({
      date: date as string,
      slug: slug as string,
      limit: 1,
    });
    if (!trends || trends.length === 0) {
      return res.status(404).json({ error: "Trend not found" });
    }
    res.status(200).json({ trend: trends[0] });
  } catch (error) {
    console.error("Error fetching trend by slug:", error);
    res.status(500).json({ error: "Failed to fetch trend" });
  }
}
