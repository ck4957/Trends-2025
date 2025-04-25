// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "supabase";

// Configuration
const BATCH_SIZE = 5; // Number of trends to process in one batch
const PROCESSING_TIMEOUT_MINUTES = 10; // Consider items hung after this time

interface QueueItem {
  id: string;
  trend_id: string;
  trend_title: string;
  attempts: number;
  max_attempts: number;
}

Deno.serve(async (req) => {
  try {
    const isScheduledInvocation =
      req.headers.get("Authorization") ===
      `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`;

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

    // Reset any stuck processing items first
    const { error: resetError } = await supabaseAdmin.rpc(
      "reset_stuck_queue_items",
      { timeout_minutes: PROCESSING_TIMEOUT_MINUTES }
    );

    if (resetError) {
      console.error("Error resetting stuck queue items:", resetError.message);
    }

    // Get pending items from the queue
    const { data: pendingItems, error: fetchError } = await supabaseAdmin
      .from("summary_queue")
      .select("id, trend_id, trend_title, attempts, max_attempts")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(BATCH_SIZE);

    if (fetchError) {
      return new Response(
        JSON.stringify({
          error: `Failed to fetch queue items: ${fetchError.message}`,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!pendingItems || pendingItems.length === 0) {
      return new Response(
        JSON.stringify({ message: "No pending items in the queue" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing ${pendingItems.length} items from the queue`);

    // Generate a batch ID for this processing batch
    const batchId = crypto.randomUUID();

    // Mark items as processing
    const itemIds = pendingItems.map((item) => item.id);
    const { error: updateError } = await supabaseAdmin
      .from("summary_queue")
      .update({
        status: "processing",
        batch_id: batchId,
        attempts: supabaseAdmin.rpc("increment_attempts", {}), // Uses a database function to increment
        processed_at: new Date().toISOString(),
      })
      .in("id", itemIds);

    if (updateError) {
      return new Response(
        JSON.stringify({
          error: `Failed to update queue items: ${updateError.message}`,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Extract trend IDs for the batch
    const trendIds = pendingItems.map((item) => item.trend_id);

    try {
      // Call the generate-summaries function with the batch of trend IDs
      const response = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/generate-summaries`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get(
              "SUPABASE_SERVICE_ROLE_KEY"
            )}`,
          },
          body: JSON.stringify({
            trend_ids: trendIds,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      // Process each result and update the queue
      if (result.results && Array.isArray(result.results)) {
        await Promise.all(
          result.results.map(async (itemResult: any) => {
            const matchingItem = pendingItems.find(
              (item) => item.trend_id === itemResult.trend_id
            );
            if (!matchingItem) return;

            if (itemResult.success) {
              await supabaseAdmin
                .from("summary_queue")
                .update({
                  status: "completed",
                  processed_at: new Date().toISOString(),
                })
                .eq("id", matchingItem.id);
            } else {
              // Check if we've exceeded max attempts
              if (matchingItem.attempts >= matchingItem.max_attempts) {
                await supabaseAdmin
                  .from("summary_queue")
                  .update({
                    status: "failed",
                    error:
                      itemResult.error || "Exceeded maximum retry attempts",
                    processed_at: new Date().toISOString(),
                  })
                  .eq("id", matchingItem.id);
              } else {
                // Reset to pending for retry
                await supabaseAdmin
                  .from("summary_queue")
                  .update({
                    status: "pending",
                    error: itemResult.error,
                    batch_id: null,
                    processed_at: null,
                  })
                  .eq("id", matchingItem.id);
              }
            }
          })
        );
      }

      // Return success response
      return new Response(
        JSON.stringify({
          success: true,
          message: `Processed ${pendingItems.length} queue items in batch ${batchId}`,
          processed_items: pendingItems.length,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      // If the overall batch processing failed, reset the items to pending
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("Batch processing error:", errorMessage);

      // Reset items status to pending to try again later
      await supabaseAdmin
        .from("summary_queue")
        .update({
          status: "pending",
          batch_id: null,
          error: errorMessage,
          processed_at: null,
        })
        .in("id", itemIds);

      return new Response(
        JSON.stringify({ error: `Batch processing failed: ${errorMessage}` }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Process queue error:", errorMessage);

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/process-summary-queue' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
