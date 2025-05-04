import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY; // Server-side only

// Initialize Supabase client
const getSupabaseClient = () => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error("Supabase credentials not found in environment variables");
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const supabase = getSupabaseClient();

    // Use DISTINCT ON to get unique dates, properly ordered
    const { data, error } = await supabase.rpc("get_distinct_dates", {
      limit_count: 5,
    });

    if (error) throw error;

    // Extract the dates from the result
    const dates = data ? data.map((item: { date: string }) => item.date) : [];

    res.status(200).json({ dates });
  } catch (error) {
    console.error("Error fetching available dates:", error);
    res.status(500).json({ error: "Failed to fetch available dates" });
  }
}
