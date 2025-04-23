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

    // Get all unique dates from trend_days table
    const { data, error } = await supabase
      .from("trend_days")
      .select("date")
      .order("date", { ascending: false })
      .limit(14); // Get last 14 days or adjust as needed

    if (error) throw error;

    // Extract just the date values
    const dates = data ? data.map((item) => item.date) : [];

    res.status(200).json({ dates });
  } catch (error) {
    console.error("Error fetching available dates:", error);
    res.status(500).json({ error: "Failed to fetch available dates" });
  }
}
