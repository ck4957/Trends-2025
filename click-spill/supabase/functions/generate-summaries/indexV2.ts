import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { OpenAI } from "https://esm.sh/openai@4";

// Generate summary for an entire trend based on multiple news items
async function generateTrendSummary(
  trendTitle: string,
  newsItems: { title: string; source: string; url: string }[]
): Promise<string> {
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiKey) {
    console.error("OpenAI API key not found in environment");
    return "Summary unavailable - API key not configured.";
  }

  const model = Deno.env.get("OPENAI_MODEL") || "gpt-3.5-turbo";
  const maxTokens = Number(Deno.env.get("OPENAI_MAX_TOKENS")) || 150;

  // Initialize OpenAI client with timeout protection
  const openai = new OpenAI({
    apiKey: openaiKey,
    timeout: 30000, // 30 seconds timeout
    maxRetries: 2,
  });

  // Format news items for the prompt
  const newsItemsText = newsItems
    .map((item) => `- "${item.title}" from ${item.source}`)
    .join("\n");

  // Construct a prompt for the AI
  const prompt = `Summarize the trending topic "${trendTitle}" based on these news headlines:
${newsItemsText}

Provide a concise summary (2-3 sentences) explaining what this trend is about and why it's currently trending.`;

  try {
    // Use AbortController for better timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const response = await openai.chat.completions.create(
      {
        model: model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: maxTokens,
        temperature: 0.5,
      },
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    return (
      response.choices[0]?.message?.content?.trim() || "Summary unavailable."
    );
  } catch (error) {
    console.error(
      `Error generating summary for trend "${trendTitle}":`,
      error.message || error
    );
    return "Summary generation failed due to timeout or API error.";
  }
}

serve(async (req) => {
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
    if (
      !payload ||
      !payload.trend_id ||
      !Array.isArray(payload.news_items) ||
      payload.news_items.length === 0
    ) {
      return new Response(
        JSON.stringify({
          error: "Invalid payload. Expected trend_id and news_items array.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const trendId = payload.trend_id;
    const newsItems = payload.news_items;
    const trendTitle = payload.trend_title || "Unknown trend";

    console.log(
      `Generating summary for trend "${trendTitle}" with ${newsItems.length} news items`
    );

    // Generate summary based on all news items
    const summary = await generateTrendSummary(trendTitle, newsItems);

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
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully generated summary for trend "${trendTitle}"`,
        summary: summary,
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
