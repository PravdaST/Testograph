-- Add target_url field to target_keywords for Page-to-Keyword Mapping
ALTER TABLE target_keywords
ADD COLUMN IF NOT EXISTS target_url TEXT;

-- Add index for faster queries by URL
CREATE INDEX IF NOT EXISTS idx_target_keywords_target_url ON target_keywords(target_url);

-- Add comment to explain the field
COMMENT ON COLUMN target_keywords.target_url IS 'The specific page/URL this keyword should target (e.g., /learn/testosterone-boost, https://testograph.eu/app/nutrition)';
