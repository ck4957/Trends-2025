# 24th April

Edge Function:fetch Google Trends RSS feed

- Add a cron job to run the Edge Function every 24 hours.

Process-Trends: (May be ?)

- Before processing new trends file from Supabase Storage, check if the file already exists in the database. If it does, let's delete the file from the trends table and then process the new file. (Deleting from the trends will run the cascade delete on the other tables)

UI
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
