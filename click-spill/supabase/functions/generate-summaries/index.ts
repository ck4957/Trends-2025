import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { OpenAI } from "https://esm.sh/openai@4";
// Create a singleton OpenAI client to reuse across requests
const openAIClient = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY") || "",
  timeout: 3000,
  maxRetries: 3,
});
// Generate summary for an entire trend based on multiple news items
async function generateSummary(trendTitle, newsItems) {
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiKey) {
    console.error("OpenAI API key not found in environment");
    return "Summary unavailable - API key not configured.";
  }
  const model = "gpt-4.1-nano";
  const maxTokens = Number(Deno.env.get("OPENAI_MAX_TOKENS")) || 150;
  // Format news items for the prompt
  const newsItemsText = newsItems
    .map((item) => `- "${item.title}" from ${item.source}`)
    .join("\n");
  // Construct a prompt for the AI
  const prompt = `Summarize the trending topic "${trendTitle}" based on these news headlines:
${newsItemsText}

Provide a concise summary (2-3 sentences) explaining what this trend is about and why it's currently trending.`;
  try {
    const response = await openAIClient.chat.completions.create({
      model: model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: maxTokens,
      temperature: 0.5,
    });
    return response.choices[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error(
      `Error generating summary for trend "${trendTitle}":`,
      error.message || error
    );
    return null;
  }
}
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
    const payload = await req.json();
    // Validate payload
    if (!payload || !payload.trend_id) {
      return new Response(
        JSON.stringify({
          error: "Invalid payload. Required: trend_id",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
    const trendId = payload.trend_id;
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
      return new Response(
        JSON.stringify({
          error: `Trend not found: ${error?.message}`,
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
    // Extract the news items from the joined result
    const trend = {
      id: data.id,
      title: data.title,
    };
    const newsItems = data.news_items || [];
    // Check if we have any news items
    if (newsItems.length === 0) {
      return new Response(
        JSON.stringify({
          error: "No news items found for this trend",
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
    // // Fetch the trend
    // const { data: trend, error: trendError } = await supabaseAdmin
    //   .from("trends")
    //   .select("id, title")
    //   .eq("id", trendId)
    //   .single();
    // if (trendError || !trend) {
    //   return new Response(
    //     JSON.stringify({ error: `Trend not found: ${trendError?.message}` }),
    //     { status: 404, headers: { "Content-Type": "application/json" } }
    //   );
    // }
    // // Fetch associated news items
    // const { data: newsItems, error: newsError } = await supabaseAdmin
    //   .from("news_items")
    //   .select("title, url, source")
    //   .eq("trend_id", trendId);
    // if (newsError) {
    //   return new Response(
    //     JSON.stringify({
    //       error: `Failed to fetch news items: ${newsError.message}`,
    //     }),
    //     { status: 500, headers: { "Content-Type": "application/json" } }
    //   );
    // }
    // if (!newsItems || newsItems.length === 0) {
    //   return new Response(
    //     JSON.stringify({ error: "No news items found for this trend" }),
    //     { status: 404, headers: { "Content-Type": "application/json" } }
    //   );
    // }
    // Generate the summary
    const summary = await generateSummary(trend.title, newsItems);
    // Update the trend with the summary
    const { error: updateError } = await supabaseAdmin
      .from("trends")
      .update({
        ai_summary: summary,
        summary_generated_at: new Date().toISOString(),
      })
      .eq("id", trendId);
    if (updateError) {
      return new Response(
        JSON.stringify({
          error: `Failed to update trend: ${updateError.message}`,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
    return new Response(
      JSON.stringify({
        success: true,
        trend_id: trendId,
        summary: summary,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
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
