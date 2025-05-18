// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// supabase/functions/fetch-google-trends/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (_req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const bucket = "trends-files";

  const supabase = createClient(supabaseUrl, supabaseKey);

  const rssUrl = "https://trends.google.com/trending/rss?geo=US";
  const rssResponse = await fetch(rssUrl);
  const xml = await rssResponse.text();

  // Modified filename code with Eastern Time
  const date = new Date();
  const easternDate = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
  // Format: YYYY-MM-DD_HH-MM_ET.xml
  const formattedDate = easternDate.replace(
    /(\d+)\/(\d+)\/(\d+), (\d+):(\d+)/,
    "$3-$1-$2_$4-$5_ET"
  );
  // Example: 2023-10-01_14-30_ET.xml
  const filename = `${formattedDate}.xml`;

  const { error } = await supabase.storage.from(bucket).upload(filename, xml, {
    contentType: "application/xml",
    upsert: true,
  });

  if (error) {
    console.error("Upload error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  // You can trigger your processing edge function here if needed
  return new Response(JSON.stringify({ success: true, filename }), {
    status: 200,
  });
});
