import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { OpenAI } from "https://esm.sh/openai@4";
// Create a singleton OpenAI client to reuse across requests
const openAIClient = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY") || "",
  timeout: 3000,
  maxRetries: 3,
});
// Modify the function signature to accept categories and categoryMap
async function generateSummaryAndCategory(
  trendTitle: string,
  newsItems: any[],
  categories: string[],
  categoryMap: Record<string, string>
) {
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiKey) {
    console.error("OpenAI API key not found in environment");
    return {
      summary: "Summary unavailable - API key not configured.",
      category: "Other",
      category_id: categoryMap ? categoryMap["Other"] : null,
    };
  }

  const model = "gpt-4o-mini";
  const maxTokens = Number(Deno.env.get("OPENAI_MAX_TOKENS")) || 200;

  // Format news items for the prompt
  const newsItemsText = newsItems
    .map((item) => `- "${item.title}" from ${item.source}`)
    .join("\n");

  // Combined prompt requesting both summary and category
  const prompt = `Analyze the trending topic "${trendTitle}" based on these news headlines:
${newsItemsText}

1. CATEGORY: Classify this trend into exactly ONE of the following categories: ${categories.join(
    ", "
  )}

2. SUMMARY: Write a concise summary (2-3 sentences) explaining what this trend is about and why it's trending.

Format your response exactly like this:
CATEGORY: [single category name]
SUMMARY: [your 2-3 sentence summary]`;

  try {
    const response = await openAIClient.chat.completions.create({
      model: model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.5,
    });

    const content = response.choices[0]?.message?.content?.trim() || "";

    // Parse the response to extract category and summary
    const categoryMatch = content.match(/CATEGORY:\s*([^\n]+)/i);
    const summaryMatch = content.match(/SUMMARY:\s*(.+)$/is);

    const categoryName = categoryMatch ? categoryMatch[1].trim() : "Other";
    const summary = summaryMatch ? summaryMatch[1].trim() : content;

    // Get the category ID from our map
    const category_id = categoryMap[categoryName] || categoryMap["Other"];

    return {
      summary,
      category: categoryName,
      category_id,
    };
  } catch (error) {
    console.error(
      `Error generating summary for trend "${trendTitle}":`,
      error.message || error
    );
    return {
      summary: null,
      category: "Other",
      category_id: categoryMap ? categoryMap["Other"] : null,
    };
  }
}

// Update processTrend to accept the categories data
async function processTrend(
  supabaseAdmin,
  trendId,
  categories: string[],
  categoryMap: Record<string, string>
) {
  // Use a join to fetch the trend with its news items in a single query
  const { data, error } = await supabaseAdmin
    .from("trends")
    .select(
      `
      id, 
      title,
      news_items (
        title,
        url,
        source
      )
    `
    )
    .eq("id", trendId)
    .single();

  if (error || !data) {
    return {
      success: false,
      trend_id: trendId,
      error: `Trend not found: ${error?.message}`,
    };
  }

  // Extract the news items from the joined result
  const trend = {
    id: data.id,
    title: data.title,
  };
  const newsItems = data.news_items || [];

  // Check if we have any news items
  if (newsItems.length === 0) {
    return {
      success: false,
      trend_id: trendId,
      error: "No news items found for this trend",
    };
  }

  // Generate the summary and category together
  const { summary, category, category_id } = await generateSummaryAndCategory(
    trend.title,
    newsItems,
    categories,
    categoryMap
  );

  // Update the trend with the summary and category
  const { error: updateError } = await supabaseAdmin
    .from("trends")
    .update({
      ai_summary: summary,
      category: category,
      category_id: category_id,
      summary_generated_at: new Date().toISOString(),
    })
    .eq("id", trendId);

  if (updateError) {
    return {
      success: false,
      trend_id: trendId,
      error: `Failed to update trend: ${updateError.message}`,
    };
  }

  return {
    success: true,
    trend_id: trendId,
    summary: summary,
    category: category,
  };
}

// In the main Deno.serve function, fetch categories once and reuse
Deno.serve(async (req) => {
  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          persistSession: false,
        },
      }
    );

    // Fetch categories once at the beginning
    const { data: categoriesData, error: categoriesError } = await supabaseAdmin
      .from("categories")
      .select("id, name")
      .order("name");

    if (categoriesError) {
      return new Response(
        JSON.stringify({
          error: `Failed to fetch categories: ${categoriesError.message}`,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Prepare categories data once
    const categories = categoriesData.map((c) => c.name);
    const categoryMap = Object.fromEntries(
      categoriesData.map((c) => [c.name, c.id])
    );

    const payload = await req.json();

    // Validate payload
    if (!payload || (!payload.trend_id && !payload.trend_ids)) {
      return new Response(
        JSON.stringify({
          error: "Invalid payload. Required: trend_id or trend_ids array",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Handle both single trend_id and array of trend_ids
    if (payload.trend_ids && Array.isArray(payload.trend_ids)) {
      // Process multiple trends
      const results = [];
      for (const trendId of payload.trend_ids) {
        // Pass categories and categoryMap to processTrend
        const result = await processTrend(
          supabaseAdmin,
          trendId,
          categories,
          categoryMap
        );
        results.push(result);
      }

      return new Response(
        JSON.stringify({
          success: true,
          results: results,
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } else {
      // Process single trend
      const trendId = payload.trend_id;
      // Pass categories and categoryMap to processTrend
      const result = await processTrend(
        supabaseAdmin,
        trendId,
        categories,
        categoryMap
      );

      if (!result.success) {
        return new Response(
          JSON.stringify({
            error: result.error,
          }),
          {
            status: 404,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          trend_id: result.trend_id,
          summary: result.summary,
          category: result.category,
          category_id: result.category_id, // Make sure to include category_id in the response
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Processing error:", errorMessage);
    return new Response(
      JSON.stringify({
        error: errorMessage,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
});
