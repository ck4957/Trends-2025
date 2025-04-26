// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Import types and required libraries
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "supabase";

// Configuration
const BATCH_SIZE = 3; // Number of trends to process in one batch

// Enhanced logging functions
function logInfo(requestId: string, message: string, data?: any) {
  console.log(`[${requestId}] ${message}`, data ? data : "");
}

function logError(requestId: string, message: string, error: any) {
  console.error(
    `[${requestId}] ERR: ${message}`,
    error instanceof Error
      ? { message: error.message, stack: error.stack }
      : error
  );
}

Deno.serve(async (req) => {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

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

    // First log overall queue status
    const { data: queueStats, error: statsError } = await supabaseAdmin
      .from("summary_queue")
      .select("status")
      .then((res) => {
        if (res.error) return { data: null, error: res.error };

        // Count items by status
        const stats = {
          total: 0,
          pending: 0,
          processing: 0,
          completed: 0,
          failed: 0,
        };
        if (res.data) {
          stats.total = res.data.length;
          res.data.forEach((item) => {
            stats[item.status] = (stats[item.status] || 0) + 1;
          });
        }
        return { data: stats, error: null };
      });

    if (queueStats) {
      logInfo(requestId, "Curr Q stats:", queueStats);
    } else if (statsError) {
      logError(requestId, "Error fetching queue statistics", statsError);
    }

    // Get pending items from the queue
    logInfo(requestId, `Fetching up to ${BATCH_SIZE} pending items from queue`);
    const { data: pendingItems, error: fetchError } = await supabaseAdmin
      .from("summary_queue")
      .select("id, trend_id, trend_title, attempts, max_attempts")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(BATCH_SIZE);

    if (fetchError) {
      logError(requestId, "Failed to fetch queue items", fetchError);
      return new Response(
        JSON.stringify({
          error: `Failed to fetch queue items: ${fetchError.message}`,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!pendingItems || pendingItems.length === 0) {
      logInfo(requestId, "No pending items found in queue");
      return new Response(
        JSON.stringify({ message: "No pending items in the queue" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    logInfo(
      requestId,
      `Found ${pendingItems.length} pending items to process`,
      pendingItems.map((item) => ({
        id: item.id,
        trend_id: item.trend_id,
        title: item.trend_title,
        attempts: `${item.attempts}/${item.max_attempts}`,
      }))
    );

    // Generate a batch ID for this processing batch
    const batchId = crypto.randomUUID();
    logInfo(requestId, `Created new batch with ID: ${batchId}`);

    // Track items we're updating
    const itemIds = pendingItems.map((item) => item.id);
    const trendIds = pendingItems.map((item) => item.trend_id);

    logInfo(requestId, "Marking items as processing", {
      batch_id: batchId,
      item_ids: itemIds,
      trend_ids: trendIds,
    });

    // Update items to processing status
    for (const item of pendingItems) {
      const newAttempts = item.attempts + 1;
      logInfo(
        requestId,
        `Updating item ${item.id} to processing status (attempt ${newAttempts}/${item.max_attempts})`
      );

      const { error } = await supabaseAdmin
        .from("summary_queue")
        .update({
          status: "processing",
          batch_id: batchId,
          attempts: newAttempts,
          processed_at: new Date().toISOString(),
        })
        .eq("id", item.id);

      if (error) {
        logError(requestId, `Error updating queue item ${item.id}`, error);
      }
    }

    try {
      // Call the generate-summaries function with the batch of trend IDs
      const apiUrl = `${Deno.env.get(
        "SUPABASE_URL"
      )}/functions/v1/generate-summaries`;
      logInfo(requestId, `Calling generate-summaries API at ${apiUrl}`, {
        trend_ids: trendIds,
        batch_id: batchId,
      });

      const apiStartTime = Date.now();
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          "X-Request-Id": requestId,
          "X-Batch-Id": batchId,
        },
        body: JSON.stringify({
          trend_ids: trendIds,
        }),
      });

      const apiDuration = Date.now() - apiStartTime;
      logInfo(
        requestId,
        `API call completed in ${apiDuration}ms with status ${response.status}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        logError(requestId, `API returned error status ${response.status}`, {
          response_text: errorText,
          duration_ms: apiDuration,
        });
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      logInfo(requestId, "API call returned results", {
        success_count:
          result.results?.filter((r: any) => r.success).length || 0,
        failure_count:
          result.results?.filter((r: any) => !r.success).length || 0,
        response_time_ms: apiDuration,
      });

      // Process each result and update the queue
      if (result.results && Array.isArray(result.results)) {
        for (const itemResult of result.results) {
          const matchingItem = pendingItems.find(
            (item) => item.trend_id === itemResult.trend_id
          );

          if (!matchingItem) {
            logInfo(
              requestId,
              `No matching queue item found for trend_id ${itemResult.trend_id}`
            );
            continue;
          }

          if (itemResult.success) {
            logInfo(
              requestId,
              `Successfully processed trend ${itemResult.trend_id}, updating queue item ${matchingItem.id} to completed`
            );

            const { error } = await supabaseAdmin
              .from("summary_queue")
              .update({
                status: "completed",
                processed_at: new Date().toISOString(),
              })
              .eq("id", matchingItem.id);

            if (error) {
              logError(
                requestId,
                `Error updating queue item ${matchingItem.id} to completed`,
                error
              );
            }
          } else {
            // Check if we've exceeded max attempts
            if (matchingItem.attempts >= matchingItem.max_attempts) {
              logInfo(
                requestId,
                `Max attempts (${matchingItem.max_attempts}) reached for item ${matchingItem.id}, marking as failed`,
                {
                  trend_id: matchingItem.trend_id,
                  error: itemResult.error || "Exceeded maximum retry attempts",
                }
              );

              const { error } = await supabaseAdmin
                .from("summary_queue")
                .update({
                  status: "failed",
                  error: itemResult.error || "Exceeded maximum retry attempts",
                  processed_at: new Date().toISOString(),
                })
                .eq("id", matchingItem.id);

              if (error) {
                logError(
                  requestId,
                  `Error updating queue item ${matchingItem.id} to failed`,
                  error
                );
              }
            } else {
              logInfo(
                requestId,
                `Processing failed for item ${matchingItem.id}, resetting to pending for retry`,
                {
                  trend_id: matchingItem.trend_id,
                  current_attempt: matchingItem.attempts,
                  max_attempts: matchingItem.max_attempts,
                  error: itemResult.error,
                }
              );

              const { error } = await supabaseAdmin
                .from("summary_queue")
                .update({
                  status: "pending",
                  error: itemResult.error,
                  batch_id: null,
                  processed_at: null,
                })
                .eq("id", matchingItem.id);

              if (error) {
                logError(
                  requestId,
                  `Error resetting queue item ${matchingItem.id} to pending`,
                  error
                );
              }
            }
          }
        }
      } else {
        logError(requestId, "API response missing results array", result);
      }

      // Log queue stats after processing
      const { data: finalQueueStats } = await supabaseAdmin
        .from("summary_queue")
        .select("status")
        .then((res) => {
          if (res.error) return { data: null };

          // Count items by status
          const stats = {
            total: 0,
            pending: 0,
            processing: 0,
            completed: 0,
            failed: 0,
          };
          if (res.data) {
            stats.total = res.data.length;
            res.data.forEach((item) => {
              stats[item.status] = (stats[item.status] || 0) + 1;
            });
          }
          return { data: stats };
        });

      if (finalQueueStats) {
        logInfo(
          requestId,
          "Final queue statistics after processing:",
          finalQueueStats
        );
      }

      const totalDuration = Date.now() - startTime;
      logInfo(
        requestId,
        `Processing completed successfully in ${totalDuration}ms`,
        {
          batch_id: batchId,
          items_processed: pendingItems.length,
        }
      );

      // Return success response
      return new Response(
        JSON.stringify({
          success: true,
          message: `Processed ${pendingItems.length} queue items in batch ${batchId}`,
          processed_items: pendingItems.length,
          request_id: requestId,
          duration_ms: totalDuration,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      // If the overall batch processing failed, reset the items to pending
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logError(requestId, "Batch processing error", error);

      // Reset items status to pending to try again later
      logInfo(
        requestId,
        `Resetting ${itemIds.length} items back to pending status due to error`,
        {
          item_ids: itemIds,
        }
      );

      const { error: resetError } = await supabaseAdmin
        .from("summary_queue")
        .update({
          status: "pending",
          batch_id: null,
          error: errorMessage,
          processed_at: null,
        })
        .in("id", itemIds);

      if (resetError) {
        logError(
          requestId,
          "Error resetting items to pending status",
          resetError
        );
      }

      const totalDuration = Date.now() - startTime;
      return new Response(
        JSON.stringify({
          error: `Batch processing failed: ${errorMessage}`,
          request_id: requestId,
          duration_ms: totalDuration,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const totalDuration = Date.now() - startTime;
    logError(requestId, "Unhandled exception in process queue function", error);

    return new Response(
      JSON.stringify({
        error: errorMessage,
        request_id: requestId,
        duration_ms: totalDuration,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
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
