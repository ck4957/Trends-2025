import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { fetchTrends } from "./utils/fetch-trends";

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

    const trends = await fetchTrends({ date: date as string });
    res.status(200).json({ trends });
  } catch (error) {
    console.error("Error fetching trends for date:", error);
    res.status(500).json({ error: "Failed to fetch trends" });
  }
}
