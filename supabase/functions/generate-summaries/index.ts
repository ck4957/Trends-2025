import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { OpenAI } from "https://esm.sh/openai@4";
// Create a singleton OpenAI client to reuse across requests
const openAIClient = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY") || "",
  timeout: 3000,
  maxRetries: 1,
});
// Enhanced logging helper
function logInfo(message, data?) {
  console.log(`${message}`, data ? data : "");
}
function logError(message, error) {
  console.error(
    `ERR: ${message}`,
    error instanceof Error
      ? {
          message: error.message,
          stack: error.stack,
        }
      : error
  );
}
// Modify the function signature to accept categories and categoryMap
async function generateSummaryAndCategory(
  trendTitle,
  newsItems,
  categories,
  categoryMap
) {
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiKey) {
    logError("OpenAI API key not found in environment", {
      trend: trendTitle,
    });
    return {
      summary: "Summary unavailable - API key not configured.",
      category: "Other",
      category_id: categoryMap ? categoryMap["Other"] : null,
    };
  }
  const models = [
    "gpt-4.1",
    //"gpt-4.1-mini",
    "gpt-4.1-nano",
    "gpt-4o",
    "gpt-4o-mini",
    "gpt-3.5-turbo",
    //"o4-mini",
  ];
  // Function to get a random model from the models array
  function getRandomModel() {
    const randomIndex = Math.floor(Math.random() * models.length);
    return models[randomIndex];
  }
  const model = getRandomModel();
  logInfo(`Using model: ${model} for trend: "${trendTitle}"`);
  const maxTokens = 900;
  // Format news items for the prompt
  const newsItemsText = newsItems
    .map((item) => `- "${item.title}" from ${item.source}`)
    .join("\n");
  // Combined prompt requesting both summary and category
  const promptV1 = `Analyze the trending topic "${trendTitle}" based on these news headlines:
${newsItemsText}

1. CATEGORY: Classify this trend into exactly ONE of the following categories: ${categories.join(
    ", "
  )}

2. SUMMARY: Write a concise summary (1-2 sentences) explaining what this trend is about and why it's trending.

Format your response exactly like this:
CATEGORY: [single category name]
SUMMARY: [your 1-2 sentence summary]`;
  const prompt = `Write an in-depth, SEO-optimized article (100-300 words) about the trending topic "${trendTitle}" based on these news headlines:
${newsItemsText}

Include:
1. CATEGORY: Classify this trend into exactly ONE of the following categories: ${categories.join(
    ", "
  )}
2. A compelling introduction (1-2 sentences).
3. A bulleted list of 4-7 key developments, facts, or implications about this trend. Each bullet should be concise and informative.
4. A "People Also Ask" FAQ section with 2-3 relevant questions and concise answers.
5. Write a concise summary (1-2 sentences) explaining what this trend is about and why it's trending.

Format:
CATEGORY: [single category name]
SUMMARY: [your 1-2 sentence summary]
ARTICLE:
[Introduction]

- [Bullet point 1]
- [Bullet point 2]
- [Bullet point 3]
...

FAQ:
Q1: [Question 1]
A1: [Answer 1]
Q2: [Question 2]
A2: [Answer 2]
`;
  const startTime = Date.now();
  try {
    const response = await openAIClient.chat.completions.create({
      model: model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });
    const requestDuration = (Date.now() - startTime) / 1000;
    const content = response.choices?.[0]?.message?.content || "";
    logInfo(
      `OpenAI request completed in ${requestDuration.toFixed(
        2
      )}s for trend: "${trendTitle}"`
    );
    logInfo(
      `Raw OpenAI response: ${content.substring(0, 100)}${
        content.length > 100 ? "..." : ""
      }`
    );
    // Parse the response to extract category, summary, article, and FAQ
    const categoryMatch = content.match(/CATEGORY:\s*([^\n]+)/i);
    const summaryMatch = content.match(
      /SUMMARY:\s*(.+?)(?:\nARTICLE:|\nFAQ:|$)/is
    );
    const articleMatch = content.match(/ARTICLE:\s*([\s\S]*?)(?:\nFAQ:|$)/i);
    const faqMatch = content.match(/FAQ:\s*([\s\S]*)$/i);
    const categoryName = categoryMatch ? categoryMatch[1].trim() : "Other";
    const summary = summaryMatch ? summaryMatch[1].trim() : "";
    const article = articleMatch ? articleMatch[1].trim() : "";
    let faq: { question: string; answer: string }[] = [];
    if (faqMatch && faqMatch[1]) {
      // Parse Q/A pairs
      const faqText = faqMatch[1];
      const qaRegex = /Q\d+:\s*(.+?)\nA\d+:\s*(.+?)(?=\nQ\d+:|\n*$)/gs;
      let match;
      while ((match = qaRegex.exec(faqText)) !== null) {
        faq.push({
          question: match[1].trim(),
          answer: match[2].trim(),
        });
      }
    }
    // Get the category ID from our map
    const category_id = categoryMap[categoryName] || categoryMap["Other"];
    logInfo(`Successfully generated summary for "${trendTitle}"`, {
      category: categoryName,
      categoryId: category_id,
      summaryLength: summary.length,
      articleLength: article.length,
      faqCount: faq.length,
    });
    return {
      summary,
      article,
      faq,
      category: categoryName,
      category_id,
    };
  } catch (error) {
    const requestDuration = (Date.now() - startTime) / 1000;
    logError(
      `Error generating summary for "${trendTitle}" after ${requestDuration.toFixed(
        2
      )}s:`,
      error
    );
    return {
      summary: null,
      category: "Other",
      category_id: categoryMap ? categoryMap["Other"] : null,
      errorFromGenerateSummary: `Failed to generate summary: ${
        error.message || String(error)
      }`,
    };
  }
}
// Update processTrend to accept the categories data
async function processTrend(supabaseAdmin, trendId, categories, categoryMap) {
  logInfo(`Processing trend ID: ${trendId}`);
  const startTime = Date.now();
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
    logError(`Failed to fetch trend ID: ${trendId}`, error);
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
    logInfo(`No news items found for trend: "${trend.title}" (${trendId})`);
    return {
      success: false,
      trend_id: trendId,
      error: "No news items found for this trend",
    };
  }
  // Generate the summary and category together
  logInfo(`Generating summary for trend: "${trend.title}" (${trendId})`);
  const {
    summary,
    article,
    faq,
    category,
    category_id,
    errorFromGenerateSummary,
  } = await generateSummaryAndCategory(
    trend.title,
    newsItems,
    categories,
    categoryMap
  );
  // NEW CODE: Check if we have a valid summary before updating
  if (!summary) {
    logInfo(
      `No valid summary generated for trend: "${trend.title}" (${trendId}), skipping database update`
    );
    return {
      success: false,
      trend_id: trendId,
      error: errorFromGenerateSummary || "No summary generated",
      status: "pending",
    };
  }
  // NEW CODE: Check if we have a valid article before updating
  if (!article) {
    logInfo(
      `No valid article generated for trend: "${trend.title}" (${trendId}), skipping database update`
    );
    return {
      success: false,
      trend_id: trendId,
      error: errorFromGenerateSummary || "No article generated",
      status: "pending",
    };
  }
  // Only update the database if we have an article
  logInfo(`Updating trend in database: "${trend.title}" (${trendId})`);
  const { error: updateError } = await supabaseAdmin
    .from("trends")
    .update({
      ai_summary: summary,
      ai_article: article,
      ai_faq: faq && faq.length > 0 ? faq : null,
      category_id: category_id,
      summary_generated_at: new Date().toISOString(),
    })
    .eq("id", trendId);
  if (updateError) {
    logError(
      `Failed to update trend: "${trend.title}" (${trendId})`,
      updateError
    );
    return {
      success: false,
      trend_id: trendId,
      error: `Failed to update trend: ${updateError.message}`,
      status: "pending",
    };
  }
  const processDuration = Date.now() - startTime;
  logInfo(
    `Successfully processed trend: "${trend.title}" (${trendId}) in ${processDuration}ms`,
    {
      category,
      categoryId: category_id,
      summaryLength: summary ? summary.length : 0,
    }
  );
  return {
    success: true,
    trend_id: trendId,
    summary: summary,
    article: article,
    faq: faq,
    category: category,
    category_id: category_id,
  };
}
// In the main Deno.serve function, fetch categories once and reuse
Deno.serve(async (req) => {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();
  try {
    // Parse request body early to catch JSON parsing errors
    let payload;
    try {
      payload = await req.json();
      logInfo(`[${requestId}] Request payload:`, payload);
    } catch (e) {
      logError(`[${requestId}] Failed to parse request JSON`, e);
      return new Response(
        JSON.stringify({
          error: "Invalid JSON in request body",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
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
      logError(`[${requestId}] Failed to fetch categories`, categoriesError);
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
    logInfo(`[${requestId}] Fetched ${categories.length} categories`);
    // Validate payload
    if (!payload || (!payload.trend_id && !payload.trend_ids)) {
      logInfo(`[${requestId}] Invalid payload - missing trend ID(s)`, payload);
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
      logInfo(
        `[${requestId}] Processing ${payload.trend_ids.length} trends in batch`
      );
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
      const requestDuration = Date.now() - startTime;
      logInfo(
        `[${requestId}] Batch processing completed in ${requestDuration}ms for ${payload.trend_ids.length} trends. ` +
          `Success: ${results.filter((r) => r.success).length}, Failed: ${
            results.filter((r) => !r.success).length
          }`
      );
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
      logInfo(`[${requestId}] Processing single trend ID: ${trendId}`);
      // Pass categories and categoryMap to processTrend
      const result = await processTrend(
        supabaseAdmin,
        trendId,
        categories,
        categoryMap
      );
      if (!result.success) {
        logInfo(`[${requestId}] Failed to process trend ID: ${trendId}`, {
          error: result.error,
        });
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
      const requestDuration = Date.now() - startTime;
      logInfo(
        `[${requestId}] Successfully processed trend ID: ${trendId} in ${requestDuration}ms`
      );
      return new Response(
        JSON.stringify({
          success: true,
          trend_id: result.trend_id,
          summary: result.summary,
          article: result.article,
          faq: result.faq,
          category: result.category,
          category_id: result.category_id,
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  } catch (error) {
    const requestDuration = Date.now() - startTime;
    logError(
      `[${requestId}] Unhandled error after ${requestDuration}ms:`,
      error
    );
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
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
