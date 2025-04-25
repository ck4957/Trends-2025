-- Create the categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Insert the initial categories
INSERT INTO categories (name, slug) VALUES
('Sports', 'sports'),
('Entertainment', 'entertainment'),
('Technology', 'technology'),
('Politics', 'politics'),
('Business and Finance', 'business-finance'),
('Health', 'health'),
('Science', 'science'),
('Food and Drink', 'food-drink'),
('Travel and Transportation', 'travel-transportation'),
('Law and Government', 'law-government'),
('Autos and Vehicles', 'autos-vehicles'),
('Beauty and Fashion', 'beauty-fashion'),
('Climate', 'climate'),
('Games', 'games'),
('Hobbies and Leisure', 'hobbies-leisure'),
('Jobs and Education', 'jobs-education'),
('Pets and Animals', 'pets-animals'),
('Shopping', 'shopping'),
('Other', 'other')
ON CONFLICT (name) DO NOTHING;

-- Update the trends table to use a foreign key to categories
ALTER TABLE trends ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id);

-- Create an index on the category_id column for better query performance
CREATE INDEX IF NOT EXISTS idx_trends_category_id ON trends(category_id);