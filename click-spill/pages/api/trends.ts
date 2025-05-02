import type { NextApiRequest, NextApiResponse } from "next";
import { parseStringPromise } from "xml2js";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

// Environment variables
const PLATFORM = process.env.NEXT_PUBLIC_PLATFORM || "vercel"; // 'vercel' or 'supabase'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY; // Server-side only, more privileged
const SUPABASE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || "";

// Initialize Supabase client if needed
const getSupabaseClient = () => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error("Supabase credentials not found in environment variables");
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
};

// Function to get XML data - works with both Vercel and Supabase
async function getXmlData(): Promise<string> {
  if (PLATFORM === "supabase") {
    try {
      // Check for filename in request params
      let filename: string | null = null;

      // Get today's date in YYYY-MM-DD format
      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];

      filename = todayStr + ".xml";
      //console.log("Filename:", filename, "Bucket:", SUPABASE_BUCKET);
      // Get XML file from storage
      const supabase = getSupabaseClient();
      const { data: fileData, error: fileError } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .download(filename);

      if (fileError) {
        console.error("Error downloading file from Supabase:", fileError);
        throw new Error(
          `Failed to download from Supabase: ${fileError.message}`
        );
      }

      // Convert file data to text
      return await fileData.text();
    } catch (error) {
      console.error("Error fetching XML from Supabase:", error);
      throw error;
    }
  } else {
    // Default Vercel approach - read from file system
    //const filePath = path.join(process.cwd(), "posts", "1-trends.xml");
    //if (!fs.existsSync(filePath)) {
    throw new Error("Trends XML file not found.");
    //}
    // return fs.readFileSync(filePath, "utf-8");
  }
}

// Function to store processed data in Supabase (if using Supabase)
async function storeProcessedData(processedTrends: any[]): Promise<void> {
  if (PLATFORM === "supabase") {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from("processed_trends").upsert({
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
      const pubDate = item.pubDate ? item.pubDate[0] : null; // Extract publication date
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
        const summary = ""; //await generateSummary(newsTitle, newsSource, newsUrl);

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
        pubDate: pubDate, // Include the publication date
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
