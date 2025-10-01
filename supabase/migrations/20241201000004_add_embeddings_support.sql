-- Add vector embedding support to chat_sessions table
-- Enable the pgvector extension for storing embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column for PDF content
ALTER TABLE public.chat_sessions
ADD COLUMN IF NOT EXISTS pdf_embedding vector(1536);

-- Create index for similarity search on embeddings
CREATE INDEX IF NOT EXISTS chat_sessions_pdf_embedding_idx
ON public.chat_sessions
USING ivfflat (pdf_embedding vector_cosine_ops);

-- Function to find similar PDF content across users (optional)
CREATE OR REPLACE FUNCTION find_similar_pdfs(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.8,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  session_id uuid,
  email text,
  pdf_filename text,
  similarity float
)
LANGUAGE sql
AS $$
  SELECT
    id as session_id,
    email,
    pdf_filename,
    1 - (pdf_embedding <=> query_embedding) as similarity
  FROM chat_sessions
  WHERE pdf_embedding IS NOT NULL
    AND 1 - (pdf_embedding <=> query_embedding) > match_threshold
  ORDER BY pdf_embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Grant usage on the function
GRANT EXECUTE ON FUNCTION find_similar_pdfs TO authenticated, anon;