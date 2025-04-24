// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "supabase";
import { OpenAI } from "openai";

// Function to generate summaries using OpenAI
async function generateSummary(
  title: string,
  source: string,
  url: string
): Promise<string> {
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiKey) {
    console.error("OpenAI API key not found in environment");
    return "Summary unavailable - API key not configured.";
  }

  const model = "gpt-4.1-nano";
  const maxTokens = Number(Deno.env.get("OPENAI_MAX_TOKENS")) || 150;

  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: openaiKey,
  });

  // Construct a prompt for the AI
  const prompt = `Summarize the news item titled "${title}" from ${source} (${url}) in approximately 2-3 sentences for a general audience. Focus on the key information and its significance.`;

  try {
    // Add a timeout to the API call
    const timeoutPromise = new Promise<string>((_, reject) => {
      setTimeout(() => reject(new Error("OpenAI API timeout")), 10000); // 10 sec timeout
    });

    const apiPromise = openai.chat.completions.create({
      model: model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.5,
    });

    // Race between the API call and the timeout
    const response = await apiPromise;
    return (
      response.choices[0]?.message?.content?.trim() || "Summary unavailable."
    );
  } catch (error) {
    console.error(
      `Error generating summary for "${title}":`,
      error.message || error
    );
    return "Summary generation failed due to timeout or API error.";
  }
}

Deno.serve(async (req) => {
  try {
    // Create Supabase client
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
      !payload.batch_id ||
      !payload.item_ids ||
      !Array.isArray(payload.item_ids)
    ) {
      return new Response(
        JSON.stringify({
          error: "Invalid payload. Expected batch_id and item_ids array.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Process at most 20 items per invocation for rate limiting
    const itemIds = payload.item_ids.slice(0, 20);
    const batchId = payload.batch_id;

    console.log(
      `Processing summary batch ${batchId} with ${itemIds.length} items`
    );

    // Fetch news items that need summarization
    const { data: newsItems, error: fetchError } = await supabaseAdmin
      .from("news_items")
      .select("id, title, url, source")
      .in("id", itemIds)
      .is("ai_summary", null);

    if (fetchError) {
      return new Response(
        JSON.stringify({
          error: `Failed to fetch news items: ${fetchError.message}`,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Process items sequentially to avoid rate limiting issues
    const results = [];

    for (const item of newsItems) {
      try {
        // Generate summary
        const summary = await generateSummary(
          item.title,
          item.source,
          item.url
        );

        // Update the news item with the summary
        const { error: updateError } = await supabaseAdmin
          .from("news_items")
          .update({
            ai_summary: summary,
            summary_generated_at: new Date().toISOString(),
          })
          .eq("id", item.id);

        if (updateError) {
          console.error(
            `Failed to update item ${item.id}: ${updateError.message}`
          );
          results.push({
            id: item.id,
            success: false,
            error: updateError.message,
          });
        } else {
          results.push({ id: item.id, success: true });
        }

        // Small delay to prevent rate limiting
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        results.push({ id: item.id, success: false, error: errorMessage });
      }
    }

    // Update the batch record to mark it as processed
    if (batchId) {
      await supabaseAdmin
        .from("summary_batches")
        .update({
          processed_at: new Date().toISOString(),
          items_processed: results.length,
          status: "completed",
        })
        .eq("id", batchId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${results.length} summaries`,
        results: results,
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
