import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL || "https://ukfomddafrsuefnrggww.supabase.co",
  process.env.SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrZm9tZGRhZnJzdWVmbnJnZ3d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNTg4MzUsImV4cCI6MjA2MDYzNDgzNX0.GxCkwwFNyDGEvMaBcyA8a_sNYIer_ZUqcM1h2x7sVKM"
);

const { data, error } = await supabase.functions.invoke("process-trends", {
  body: {
    type: "INSERT",
    table: "objects",
    schema: "storage",
    record: {
      bucket_id: "trends-files",
      name: "2025-04-23.xml",
      owner: "",
      created_at: "2025-04-23T00:00:00Z",
      updated_at: "2025-04-23T00:00:00Z",
      last_accessed_at: "2025-04-23T00:00:00Z",
      metadata: {},
      buckets: {
        id: "trends-files",
        name: "trends-files",
      },
    },
    old_record: null,
  },
});

console.log("Data:", data);
console.log("Error:", error);

{
  type: "INSERT",
  table: "objects",
  record: {
    id: "b301e35f-8034-4a91-aab5-cfe46641b5e1",
    name: "2025-04-23.xml",
    owner: null,
    version: "cba86e3f-702b-4c1b-a001-9e95fc8cefca",
    metadata: {
      eTag: '"bb685e12efe8d49b65421e4fd16b906e-1"',
      size: 21122,
      mimetype: "text/xml",
      cacheControl: "max-age=3600",
      lastModified: "2025-04-23T10:02:11.000Z",
      contentLength: 21122,
      httpStatusCode: 200
    },
    owner_id: null,
    bucket_id: "trends-files",
    created_at: "2025-04-23T10:02:10.974703+00:00",
    updated_at: "2025-04-23T10:02:10.974703+00:00",
    path_tokens: [ "2025-04-23.xml" ],
    user_metadata: null,
    last_accessed_at: "2025-04-23T10:02:10.974703+00:00"
  },
  schema: "storage",
  old_record: null
}

Timeout of 10000 ms reached. Total time: 10001.787000 ms (DNS time: 11.658000 ms, TCP/SSL handshake time: 12.811000 ms, HTTP Request/Response time: 9977.196000 ms)
