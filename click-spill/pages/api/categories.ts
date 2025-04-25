import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;

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

    // Get categories with trend counts
    const { data: categoriesData, error: categoriesError } = await supabase.rpc(
      "get_categories_with_counts"
    );

    // If the RPC function doesn't exist yet, fall back to a raw query
    if (
      categoriesError &&
      categoriesError.message.includes(
        "function get_categories_with_counts() does not exist"
      )
    ) {
      const { data, error } = await supabase.from("categories").select(`
          id, 
          name, 
          slug, 
          description
        `);

      if (error) throw error;

      // For each category, we need to count the trends
      const categoriesWithCounts = await Promise.all(
        data.map(async (category) => {
          const { count, error: countError } = await supabase
            .from("trends")
            .select("*", { count: "exact", head: true })
            .eq("category_id", category.id);

          return {
            ...category,
            count: count || 0,
          };
        })
      );

      return res.status(200).json({ categories: categoriesWithCounts });
    }

    if (categoriesError) throw categoriesError;

    res.status(200).json({ categories: categoriesData });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
}
