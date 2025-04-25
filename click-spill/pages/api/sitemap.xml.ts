import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const SITE_URL = "https://clickspill.com";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY || "";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Initialize Supabase
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    // Get available dates (last 30 days)
    const { data: dates } = await supabase
      .from("trend_days")
      .select("date")
      .order("date", { ascending: false })
      .limit(30);

    // Get all categories
    const { data: categories } = await supabase
      .from("categories")
      .select("slug");

    // Start building sitemap
    let xml = '<?xml version="1.0" encoding="UTF-8"?>';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

    // Add homepage
    xml += `
      <url>
        <loc>${SITE_URL}/</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>
    `;

    // Add date pages
    if (dates) {
      dates.forEach(({ date }) => {
        xml += `
          <url>
            <loc>${SITE_URL}/date/${date}</loc>
            <lastmod>${date}T00:00:00Z</lastmod>
            <changefreq>daily</changefreq>
            <priority>0.9</priority>
          </url>
        `;
      });
    }

    // Add category pages
    if (categories) {
      categories.forEach(({ slug }) => {
        xml += `
          <url>
            <loc>${SITE_URL}/category/${slug}</loc>
            <lastmod>${new Date().toISOString()}</lastmod>
            <changefreq>weekly</changefreq>
            <priority>0.8</priority>
          </url>
        `;
      });
    }

    // Add individual trend pages
    // Only get the last 500 trends to keep sitemap size reasonable
    const { data: trends } = await supabase
      .from("trends")
      .select("id, title, published_at")
      .order("published_at", { ascending: false })
      .limit(500);

    if (trends) {
      trends.forEach(({ id, published_at }) => {
        // Create URL-friendly slug from title
        const slug = encodeURIComponent(id);
        xml += `
          <url>
            <loc>${SITE_URL}/trend/${slug}</loc>
            <lastmod>${published_at || new Date().toISOString()}</lastmod>
            <changefreq>monthly</changefreq>
            <priority>0.7</priority>
          </url>
        `;
      });
    }

    // Close sitemap
    xml += "</urlset>";

    // Set headers
    res.setHeader("Content-Type", "text/xml");
    res.setHeader("Cache-Control", "public, max-age=86400"); // Cache for 24 hours
    res.write(xml);
    res.end();
  } catch (error) {
    console.error("Error generating sitemap:", error);
    res.status(500).end("Error generating sitemap");
  }
}
