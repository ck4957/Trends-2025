# Database Schema

## Tables

### trend_days

- `id` (UUID, PK)
- `date` (DATE, unique)
- `source_filename` (TEXT)
- `processed_at` (TIMESTAMPTZ)

### trends

- `id` (UUID, PK)
- `trend_day_id` (UUID, FK → trend_days.id)
- `title` (TEXT)
- `approx_traffic` (TEXT)
- `rank` (INTEGER)
- `ai_summary` (TEXT)
- `category_id` (UUID, FK → categories.id)
- `summary_generated_at` (TIMESTAMPTZ)

### news_items

- `id` (UUID, PK)
- `trend_id` (UUID, FK → trends.id)
- `title` (TEXT)
- `url` (TEXT)
- `source` (TEXT)
- `picture_url` (TEXT)
- `ai_summary` (TEXT)
- `published_at` (TIMESTAMPTZ)

### summary_queue

- `id` (UUID, PK)
- `trend_id` (UUID, FK → trends.id)
- `trend_title` (TEXT)
- `status` (TEXT: pending, processing, completed, failed)
- `created_at` (TIMESTAMPTZ)
- `processed_at` (TIMESTAMPTZ)
- `attempts` (INTEGER)
- `max_attempts` (INTEGER)
- `error` (TEXT)
- `batch_id` (UUID, FK → summary_batches.id)

### summary_batches

- `id` (UUID, PK)
- `trend_day_id` (UUID, FK → trend_days.id)
- `source_filename` (TEXT)
- `total_items` (INTEGER)
- `items_processed` (INTEGER)
- `status` (TEXT)
- `created_at` (TIMESTAMPTZ)
- `processed_at` (TIMESTAMPTZ)
- `error` (TEXT)

### categories

- `id` (UUID, PK)
- `name` (TEXT, unique)

### maintenance_logs

- `id` (UUID, PK)
- `operation` (TEXT)
- `details` (TEXT)
- `executed_at` (TIMESTAMPTZ)
- `execution_status` (TEXT)

## Relationships

- `trend_days` → `trends` (1:N)
- `trends` → `news_items` (1:N)
- `trends` → `summary_queue` (1:1)
- `trends` → `categories` (N:1)
- `summary_queue` → `summary_batches` (N:1)
