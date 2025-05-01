# Application Flow

## 1. Data Ingestion

- Google Trends RSS XML files are manually uploaded to Supabase Storage (trends-files bucket).
- A Supabase Edge Function (`process-trends`) is triggered on file upload.

## 2. Processing Trends

- The Edge Function parses the XML, extracts daily trends and news items.
- For each trend, a record is created in the `trend_days` and `trends` tables.
- News items are stored in the `news_items` table, linked to their trend.
- Each trend with news is queued for AI summary generation in the `summary_queue` table.

## 3. AI Summarization

- A scheduled process or trigger calls the `process-summary-queue` Edge Function.
- This function batches pending trends and calls the `generate-summaries` Edge Function.
- Summaries and categories are generated using OpenAI and stored in the `trends` table.

## 4. Frontend Display

- The Next.js frontend fetches processed trends and news from Supabase via API routes.
- Users can view trends by date, category, or search.
- Summaries, news, and images are displayed in a responsive UI with light/dark mode.

## 5. Maintenance

- Database maintenance and purging are handled by scheduled SQL scripts and triggers.
