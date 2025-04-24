/// <reference lib="deno" />
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "supabase";
import { parseStringPromise } from "xml2js";

const TrendsFilesBucket = "trends-files";
// Delay between summary generation requests (in milliseconds)
const SUMMARY_REQUEST_DELAY_MS = 300;
// Maximum concurrent summary requests (0 = unlimited)
const MAX_CONCURRENT_SUMMARY_REQUESTS = 9;

// Track the number of currently executing summary requests
let activeSummaryRequests = 0;

// Storage bucket event payload interface
interface StoragePayload {
  type: string;
  table: string;
  record: {
    id: string;
    name: string;
    owner: string;
    version: string;
    metadata: Record<string, unknown>;
    owner_id: string;
    bucket_id: string;
    created_at: string;
    updated_at: string;
    path_tokens: string[];
    last_accessed_at: string;
  };
  schema: string;
  old_record: null | Record<string, unknown>;
}

// Extract date from filename (e.g., "2025-04-23.xml" -> "2025-04-23")
function extractDateFromFilename(filename: string): string {
  const match = filename.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : new Date().toISOString().split("T")[0];
}

// Helper function to delay summary generation with controlled concurrency
async function requestSummaryWithDelay(
  trendId: string,
  title: string
): Promise<void> {
  // Wait if we've reached max concurrent requests
  while (
    MAX_CONCURRENT_SUMMARY_REQUESTS > 0 &&
    activeSummaryRequests >= MAX_CONCURRENT_SUMMARY_REQUESTS
  ) {
    await new Promise((resolve) => setTimeout(resolve, 100)); // Check every 100ms
  }

  // Increment active request counter
  activeSummaryRequests++;

  try {
    // Add delay between requests
    await new Promise((resolve) =>
      setTimeout(resolve, SUMMARY_REQUEST_DELAY_MS)
    );

    // Make the request to generate summary
    fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/generate-summaries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      },
      body: JSON.stringify({
        trend_id: trendId,
      }),
    }).catch((error) => {
      console.error(`Error calling summary generation for "${title}":`, error);
    });

    console.log(`Requested summary generation for trend "${title}"`);
  } finally {
    // Decrement counter when done (regardless of success/failure)
    activeSummaryRequests--;
  }
}

Deno.serve(async (req) => {
  try {
    // Parse the webhook payload
    const payload = (await req.json()) as StoragePayload;

    console.log("Received payload:", payload);

    // Only process on insert events
    if (payload.type !== "INSERT") {
      return new Response(
        JSON.stringify({ message: `Ignoring ${payload.type} event` }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if this is from the correct bucket (trends-files)
    if (payload.record.bucket_id !== TrendsFilesBucket) {
      return new Response(
        JSON.stringify({
          message: `Ignoring event from bucket: ${payload.record.bucket_id}`,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const filename = payload.record.path_tokens[0];
    console.log("Received filename:", filename);
    // Validate file is XML
    if (!filename.endsWith(".xml")) {
      return new Response(
        JSON.stringify({ error: "Only XML files are processed" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with env vars provided by Edge Function
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          persistSession: false,
        },
      }
    );

    // Get XML file from storage
    const { data: fileData, error: fileError } = await supabaseAdmin.storage
      .from(TrendsFilesBucket)
      .download(filename);
    if (fileError) {
      return new Response(
        JSON.stringify({
          error: `Failed to download file: ${fileError.message}`,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Convert file data to text
    const xmlData = await fileData.text();

    // Parse XML
    const parsedData = await parseStringPromise(xmlData);

    // Extract the date from the filename for database storage
    const trendDate = extractDateFromFilename(filename);

    // 1. First create a record in trend_days table
    const { data: trendDay, error: trendDayError } = await supabaseAdmin
      .from("trend_days")
      .upsert(
        {
          date: trendDate,
          source_filename: filename,
          processed_at: new Date().toISOString(),
        },
        { onConflict: "date" }
      )
      .select()
      .single();

    if (trendDayError) {
      return new Response(
        JSON.stringify({
          error: `Failed to create trend_days record: ${trendDayError.message}`,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get the trend day ID for relations
    const trendDayId = trendDay.id;

    // Process the XML trends data
    const trendItems = parsedData.rss.channel[0].item;

    // Process trends in parallel with Promise.all for better performance
    const trendPromises = trendItems.map(async (item: any, index: number) => {
      // Skip empty items
      if (!item.title) return null;

      const title = item.title[0];
      const traffic = item["ht:approx_traffic"]
        ? item["ht:approx_traffic"][0]
        : "N/A";

      // Parse the numeric part for ranking (remove "+" and convert to integer)
      const numericTraffic =
        traffic !== "N/A" ? parseInt(traffic.replace(/\+/g, "")) : 0;
      const pubDate = item.pubDate ? item.pubDate[0] : null;
      const pictureUrl = item["ht:picture"][0];
      const pictureSource = item["ht:picture_source"][0];

      // Check if trend already exists for this day and title
      const { data: existingTrend, error: checkError } = await supabaseAdmin
        .from("trends")
        .select("id")
        .eq("trend_day_id", trendDayId)
        .eq("title", title)
        .maybeSingle();

      if (checkError) {
        console.error(
          `Error checking for existing trend "${title}": ${checkError.message}`
        );
        return null;
      }

      // If trend already exists, use its ID instead of creating a new record
      let trendId: string;

      if (existingTrend) {
        console.log(
          `Trend "${title}" already exists for this date, skipping insertion`
        );
        trendId = existingTrend.id;
      } else {
        // 2. Insert trend record only if it doesn't already exist
        const { data: trendRecord, error: trendError } = await supabaseAdmin
          .from("trends")
          .upsert({
            trend_day_id: trendDayId,
            title: title,
            approx_traffic: traffic, // Keep original string format for display
            picture_url: pictureUrl,
            source: pictureSource,
            published_at: pubDate,
            rank: numericTraffic, // Store numeric value for sorting
          })
          .select()
          .single();

        if (trendError) {
          console.error(
            `Error creating trend record for "${title}": ${trendError.message}`
          );
          return null;
        }

        trendId = trendRecord.id;
        console.log(`Created new trend record for "${title}"`);
      }

      const newsItems = item["ht:news_item"] || [];

      // Process news items for this trend
      const newsPromises = newsItems.map(async (newsItem: any) => {
        // Skip items without required fields
        if (!newsItem["ht:news_item_title"] || !newsItem["ht:news_item_url"])
          return null;

        const newsTitle = newsItem["ht:news_item_title"][0];
        const newsUrl = newsItem["ht:news_item_url"][0];
        const newsSource = newsItem["ht:news_item_source"]
          ? newsItem["ht:news_item_source"][0]
          : "Unknown";
        const newsPicture = newsItem["ht:news_item_picture"]
          ? newsItem["ht:news_item_picture"][0]
          : null;

        // Don't generate summary here - just insert with empty summary
        const { data: newsItemData, error: newsError } = await supabaseAdmin
          .from("news_items")
          .insert({
            trend_id: trendId,
            title: newsTitle,
            url: newsUrl,
            source: newsSource,
            picture_url: newsPicture,
            ai_summary: null, // Set to null initially
            published_at: pubDate ? new Date(pubDate).toISOString() : null,
          })
          .select()
          .single();

        if (newsError) {
          console.error(
            `Error creating news item record for "${newsTitle}": ${newsError.message}`
          );
          return null;
        }

        return newsItemData.id;
      });

      // Wait for all news items to be processed
      await Promise.all(newsPromises);

      // Now that all news items are inserted, generate a summary for this trend

      // Only attempt to generate a summary if there are news items
      if (newsItems.length > 0) {
        // Call the trend summary function using our delayed request helper
        requestSummaryWithDelay(trendId, title);
      } else {
        console.log(
          `Skipping summary generation for trend "${title}" (no news items)`
        );
      }

      return title; // Return something to indicate success
    });

    // Wait for all trends to be processed
    await Promise.all(trendPromises);

    console.log(`Successfully processed file ${filename}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully processed file: ${filename}`,
        date: trendDate,
        timestamp: new Date().toISOString(),
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Processing error:", errorMessage);

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
