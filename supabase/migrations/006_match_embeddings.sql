CREATE OR REPLACE FUNCTION match_task_embeddings(
  query_embedding  halfvec(1024),
  query_user_id    UUID,
  match_threshold  FLOAT DEFAULT 0.5,
  match_count      INT   DEFAULT 5
)
RETURNS TABLE (
  task_id    UUID,
  content    TEXT,
  similarity FLOAT
)
LANGUAGE SQL
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    task_id,
    content,
    1 - (embedding <=> query_embedding) AS similarity
  FROM task_embeddings
  WHERE user_id = query_user_id
    AND 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding ASC
  LIMIT match_count;
$$;
