# Tech Stack

## Frontend

- **Next.js** (TypeScript): Main web application framework
- **Tailwind CSS**: Utility-first CSS framework (via CDN)

## Backend / API

- **Supabase**: Managed Postgres database, authentication, storage, and Edge Functions
- **Supabase Edge Functions**: For processing XML uploads, trend extraction, and summary queue management
- **OpenAI API**: For generating AI-powered summaries and categories

## Data

- **Google Trends RSS**: Source of trending topics (XML files)
- **Supabase Storage**: Stores uploaded XML files

## Deployment

- **Vercel**: Hosting for the Next.js frontend
- **Supabase Platform**: Hosting for database and Edge Functions

## Other

- **TypeScript**: Type safety across frontend and backend
- **xml2js**: XML parsing in Node.js
