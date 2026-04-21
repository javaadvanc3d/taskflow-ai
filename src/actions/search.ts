'use server'

import { createClient } from '@/lib/supabase/server'
import { embedQuery } from '@/lib/embeddings'

export interface SearchResult {
  task_id: string
  content: string
  similarity: number
}

export async function searchTasks(
  query: string,
  //matchThreshold = 0.5, -- Umbral de coincidencia perfecta
  //matchCount = 5 -- Muestra de semejanzas
  matchThreshold = 0.35,
  matchCount = 15
): Promise<SearchResult[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const queryEmbedding = await embedQuery(query)

  console.log(`-> Llamando a match_task_embeddings() con query_user_id: ${user.id} `);
  const { data, error } = await supabase.rpc('match_task_embeddings', {
    query_embedding: queryEmbedding,
    query_user_id: user.id,
    match_threshold: matchThreshold,
    match_count: matchCount,
  })

  if (error) throw new Error(error.message)
  console.log(`-> Data resultado : ${data} `);
  return data ?? []
}
