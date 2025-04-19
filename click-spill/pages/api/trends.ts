import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { parseStringPromise } from "xml2js";
// Placeholder: Import your AI SDK (e.g., OpenAI)
// import OpenAI from 'openai';
import { createClient } from "@supabase/supabase-js";

// Environment variables
const PLATFORM = process.env.PLATFORM || "vercel"; // 'vercel' or 'supabase'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // Server-side only, more privileged

// Initialize Supabase client if needed
const getSupabaseClient = () => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error("Supabase credentials not found in environment variables");
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
};

// Placeholder: Initialize AI client (ensure API key is securely managed, e.g., via environment variables)
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// Placeholder: Function to generate summary using AI
async function generateSummary(
  title: string,
  source: string,
  url: string
): Promise<string> {
  // Construct a prompt for the AI
  const prompt = `Summarize the news item titled "${title}" from ${source} (${url}) in approximately 100 words for a general audience. Focus on the key information and its significance.`;

  try {
    // Replace with actual AI API call
    // const response = await openai.chat.completions.create({
    //   model: "gpt-3.5-turbo", // Or another suitable model
    //   messages: [{ role: "user", content: prompt }],
    //   max_tokens: 150, // Adjust as needed
    // });
    // const summary = response.choices[0]?.message?.content?.trim() || 'Summary could not be generated.';

    // --- Placeholder Response ---
    console.log(`AI Prompt for "${title}": ${prompt}`); // Log the prompt for debugging
    const summary = `This is a placeholder summary for the news item titled "${title}" from ${source}. An AI model would generate a concise, ~100-word summary here based on the provided information and potentially the content at the URL: ${url}.`;
    // --- End Placeholder ---

    return summary;
  } catch (error) {
    console.error(`Error generating summary for "${title}":`, error);
    return "Summary generation failed.";
  }
}

// Function to get XML data - works with both Vercel and Supabase
async function getXmlData(): Promise<string> {
  if (PLATFORM === "supabase") {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.storage
        .from("trends-files")
        .download("1-trends.xml");

      if (error) {
        throw new Error(`Failed to download from Supabase: ${error.message}`);
      }

      return await data.text();
    } catch (error) {
      console.error("Error fetching XML from Supabase:", error);
      throw error;
    }
  } else {
    // Default Vercel approach - read from file system
    const filePath = path.join(process.cwd(), "posts", "1-trends.xml");
    if (!fs.existsSync(filePath)) {
      throw new Error("Trends XML file not found.");
    }
    return fs.readFileSync(filePath, "utf-8");
  }
}

// Function to store processed data in Supabase (if using Supabase)
async function storeProcessedData(processedTrends: any[]): Promise<void> {
  if (PLATFORM === "supabase") {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from("processed_trends").upsert({
        id: "latest",
        trends: processedTrends,
        timestamp: new Date().toISOString(),
      });

      if (error) {
        throw new Error(`Failed to store data in Supabase: ${error.message}`);
      }
    } catch (error) {
      console.error("Error storing data in Supabase:", error);
      // Continue without failing the request
    }
  }
  // In Vercel mode, we don't need to store the data persistently
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Get XML data from either file system or Supabase
    const xmlData = await getXmlData();

    // Parse the XML data
    const parsedData = await parseStringPromise(xmlData);

    // Extract and process trend items
    const trendItems = parsedData.rss.channel[0].item;
    const processedTrends = [];

    for (const item of trendItems) {
      const title = item.title[0];
      const traffic = item["ht:approx_traffic"]
        ? item["ht:approx_traffic"][0]
        : "N/A";
      const newsItems = item["ht:news_item"] || [];
      const processedNews = [];

      for (const newsItem of newsItems) {
        const newsTitle = newsItem["ht:news_item_title"][0];
        const newsUrl = newsItem["ht:news_item_url"][0];
        const newsSource = newsItem["ht:news_item_source"][0];
        const newsPicture = newsItem["ht:news_item_picture"]
          ? newsItem["ht:news_item_picture"][0]
          : null; // Handle missing picture

        // Generate summary for each news item
        const summary = await generateSummary(newsTitle, newsSource, newsUrl);

        processedNews.push({
          title: newsTitle,
          url: newsUrl,
          source: newsSource,
          picture: newsPicture,
          summary: summary, // Add the generated summary
        });
      }

      processedTrends.push({
        title: title,
        traffic: traffic,
        news: processedNews,
      });
    }

    // Store processed data if using Supabase
    await storeProcessedData(processedTrends);

    // Return the processed data
    res
      .status(200)
      .json({ trends: processedTrends, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("Error processing trends.xml:", error);
    res.status(500).json({ error: "Failed to process trends.xml" });
  }
}
