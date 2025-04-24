# 24th April

New Edge Function: - Add Edge Function to fetch Google Trends RSS feed and store it in Supabase Storage. Run this function every 24 hours. - Add a cron job to run the Edge Function every 24 hours.

Process-Trends:

- Before processing new trends file from Supabase Storage, check if the file already exists in the database. If it does, let's delete the file from the trends table and then process the new file. (Deleting from the trends will run the cascade delete on the other tables)

Generate Summary:

- For Each news item, there are 3 different sources. We need to call single OpenAI API to generate a common summary of 2-3 sentences from all the 3 sources. (3 sources = 1 summary)
- This will require updating the schema (news_items)

UI

- Optimize SEO for the page.
- Instead of dates, show how many days ago or hourgs ago.
- Remove the Last Updated text from the UI.

Nice to have:

- Need improve UI overall.

---

# 22nd April

I want to show atleast 7 days of trending news.
I will manually upload the rss xml file to the supabase storage.
Once processed, the data will be stored in the supabase database probably including the file name.
during processing, it will call open ai to generate summary of 100 words as well.
All or some of this is coded.

If the page reloads, the data will be fetched from the supabase database and displayed on the page.

Suggest a good schema for the supabase database.
currently I have one table called processed_trends with the following columns:
id (uuid), news: jsonb, timestamp (timestampz)

In the ui, I want to show a either in a grid or list format. (User can choose)
Add a light/dark mode
