// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "supabase";

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

    // Find a batch that needs processing
    const { data: pendingBatch, error: fetchError } = await supabaseAdmin
      .from("summary_batches")
      .select("id, trend_day_id")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    if (fetchError || !pendingBatch) {
      return new Response(
        JSON.stringify({
          message: "No pending batches found",
          error: fetchError?.message,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Mark batch as processing
    await supabaseAdmin
      .from("summary_batches")
      .update({ status: "processing" })
      .eq("id", pendingBatch.id);

    // Get news items for this batch
    const { data: newsItems, error: itemsError } = await supabaseAdmin
      .from("news_items")
      .select("id")
      .eq("trend_id", pendingBatch.trend_day_id)
      .is("ai_summary", null)
      .limit(20);

    if (itemsError || !newsItems || newsItems.length === 0) {
      await supabaseAdmin
        .from("summary_batches")
        .update({
          status: itemsError ? "failed" : "completed",
          error: itemsError?.message,
          processed_at: new Date().toISOString(),
        })
        .eq("id", pendingBatch.id);

      return new Response(
        JSON.stringify({
          message: "No items to process",
          error: itemsError?.message,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Extract just the IDs
    const itemIds = newsItems.map((item) => item.id);

    // Invoke the summary generation edge function
    const response = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/generate-summaries`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({
          batch_id: pendingBatch.id,
          item_ids: itemIds,
        }),
      }
    );

    const result = await response.json();

    return new Response(
      JSON.stringify({
        success: true,
        message: `Triggered processing of batch ${pendingBatch.id} with ${itemIds.length} items`,
        result,
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
