// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Helper for logging
function logInfo(message: string, data?: any) {
  console.log(`${message}`, data ? data : "");
}

function logError(message: string, error: any) {
  console.error(
    `ERR: ${message}`,
    error instanceof Error
      ? { message: error.message, stack: error.stack }
      : error
  );
}

// Format the social media post content
function formatSocialPost(trend: any): { text: string; hashtags: string[] } {
  // Create hashtags from category and title
  const hashtags = [
    trend.categories?.name.replace("-", "").replace(/\s+/g, ""),
    trend.title.replace("-", "").replace(/\s+/g, ""),
  ].filter(Boolean);

  // Format the URL
  const baseUrl = "https://clickspill.com";
  const url = `${baseUrl}/trend/${trend.slug}`;

  // Format the post text (140-280 chars ideal for Twitter)
  const text = `${trend.ai_summary}\n\n${url}`;

  return { text, hashtags };
}

// Post to Twitter/X using API v2
async function postToTwitter(text: string, hashtags: string[]): Promise<any> {
  try {
    const hashtagText = hashtags.map((tag) => `#${tag}`).join(" ");
    const fullText = `${text}\n\n${hashtagText}`;

    // Ensure we don't exceed Twitter's character limit (280)
    const finalText =
      fullText.length > 280 ? fullText.substring(0, 277) + "..." : fullText;

    const response = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("TWITTER_BEARER_TOKEN")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: finalText,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Twitter API error: ${JSON.stringify(data)}`);
    }

    return data;
  } catch (error) {
    logError("Error posting to Twitter", error);
    throw error;
  }
}

// Get a fresh Facebook access token using client credentials flow
async function getFacebookAccessToken(): Promise<string> {
  try {
    const APP_ID = Deno.env.get("FACEBOOK_APP_ID");
    const APP_SECRET = Deno.env.get("FACEBOOK_APP_SECRET");

    if (!APP_ID || !APP_SECRET) {
      throw new Error("Facebook App credentials not configured");
    }

    const tokenUrl = `https://graph.facebook.com/oauth/access_token?client_id=${APP_ID}&client_secret=${APP_SECRET}&grant_type=client_credentials`;

    const response = await fetch(tokenUrl);
    const data = await response.json();

    if (!response.ok || !data.access_token) {
      throw new Error(
        `Failed to get Facebook access token: ${JSON.stringify(data)}`
      );
    }

    logInfo("Successfully obtained Facebook access token");
    return data.access_token;
  } catch (error) {
    logError("Error getting Facebook access token", error);
    throw error;
  }
}

// Post to Facebook Page using Graph API
async function postToFacebook(
  text: string,
  url: string,
  hashtags: string[]
): Promise<any> {
  try {
    const PAGE_ID = Deno.env.get("FACEBOOK_PAGE_ID");

    if (!PAGE_ID) {
      throw new Error("Facebook Page ID not configured");
    }

    // Get a fresh access token for this request
    const accessToken = await getFacebookAccessToken();

    const hashtagText = hashtags.map((tag) => `#${tag}`).join(" ");
    const message = `${text}\n${hashtagText}`;

    const params = new URLSearchParams({
      message,
      link: url,
      access_token: accessToken,
    });

    // Log the posting attempt but don't log the access token
    logInfo("Posting to Facebook", {
      pageId: PAGE_ID,
      messageLength: message.length,
      url,
    });

    const response = await fetch(
      `https://graph.facebook.com/v17.0/${PAGE_ID}/feed`,
      {
        method: "POST",
        body: params,
      }
    );

    const data = await response.json();

    if (data.error) {
      throw new Error(`Facebook API error: ${JSON.stringify(data.error)}`);
    }

    return data;
  } catch (error) {
    logError("Error posting to Facebook", error);
    throw error;
  }
}

// Main handler
Deno.serve(async (req) => {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    // Parse request body
    let payload;
    try {
      payload = await req.json();
      logInfo(`[${requestId}] Request payload:`, payload);
    } catch (error) {
      logError(`[${requestId}] Failed to parse request JSON`, error);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate the payload
    const trendId = payload?.id;
    if (!trendId) {
      return new Response(
        JSON.stringify({ error: "Missing trend ID in payload" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get full trend data including category
    const { data: trend, error: trendError } = await supabase
      .from("trends")
      .select(
        `
        id, 
        title, 
        slug, 
        ai_summary,
        categories (
          name
        ),
        posted_to_facebook
      `
      )
      .eq("id", trendId)
      .single();

    if (trendError || !trend) {
      logError(`[${requestId}] Failed to fetch trend data`, trendError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch trend data" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Skip if no AI summary
    if (!trend.ai_summary) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "No AI summary available for this trend",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if already posted to avoid duplicates
    const results = { facebook: null, twitter: null };

    // Format post content
    const { text, hashtags } = formatSocialPost(trend);
    const baseUrl = "https://www.clickspill.com";
    const url = `${baseUrl}/trend/${trend.slug}`;

    // Post to Facebook if not already posted
    if (!trend.posted_to_facebook) {
      try {
        const facebookPostResult = await postToFacebook(text, url, hashtags);
        results.facebook = facebookPostResult;
        // Update database to mark as posted to Facebook
        await supabase
          .from("trends")
          .update({
            posted_to_facebook: new Date().toISOString(),
            facebook_post_id: facebookPostResult.id,
          })
          .eq("id", trendId);

        logInfo(`[${requestId}] Successfully posted to Facebook`, {
          postId: facebookPostResult?.id,
        });
      } catch (error) {
        logError(`[${requestId}] Error posting to Facebook`, error);
      }
    }

    // Post to Twitter/X if not already posted
    if (false) {
      // !trend.posted_to_twitter
      try {
        results.twitter = await postToTwitter(text, hashtags);

        // Update database to mark as posted to Twitter
        // await supabase
        //   .from("trends")
        //   .update({
        //     posted_to_twitter: new Date().toISOString(),
        //     twitter_post_id: results.twitter.data?.id,
        //   })
        //   .eq("id", trendId);

        logInfo(`[${requestId}] Successfully posted to Twitter`, {
          postId: results.twitter?.data?.id,
        });
      } catch (error) {
        logError(`[${requestId}] Error posting to Twitter`, error);
      }
    }

    const requestDuration = Date.now() - startTime;
    logInfo(`[${requestId}] Request completed in ${requestDuration}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        results: results,
        trend_id: trendId,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    const requestDuration = Date.now() - startTime;
    logError(
      `[${requestId}] Unhandled error after ${requestDuration}ms`,
      error
    );

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/post-to-social' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
