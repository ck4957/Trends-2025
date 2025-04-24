import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { visit_id, page, user_agent, ip } = req.body;
  if (!visit_id || !page) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const { error } = await supabase.from('page_visits').insert([
    { visit_id, page, user_agent, ip }
  ]);

  if (error) {
    return res.status(500).json({ error: "Failed to log visit." });
  }

  return res.status(200).json({ success: true });
}
