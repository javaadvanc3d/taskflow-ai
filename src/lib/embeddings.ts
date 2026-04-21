const VOYAGE_API_URL = 'https://api.voyageai.com/v1/embeddings'
const MODEL = 'voyage-3.5'

interface VoyageResponse {
  data: { embedding: number[]; index: number }[]
}

async function embed(texts: string[], inputType: 'document' | 'query'): Promise<number[][]> {
  console.log(`==> embed()::: texts: ${texts} | inputType: ${inputType}`);
  const res = await fetch(VOYAGE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
    },
    body: JSON.stringify({ input: texts, model: MODEL, input_type: inputType }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Voyage API error ${res.status}: ${text}`)
  }

  const json = (await res.json()) as VoyageResponse
  console.log(`-> Resultado en json: ${json}`);
  return json.data.sort((a, b) => a.index - b.index).map((d) => d.embedding)
}

export async function embedDocument(text: string): Promise<number[]> {
  const [embedding] = await embed([text], 'document')
  return embedding
}

export async function embedQuery(text: string): Promise<number[]> {
  const [embedding] = await embed([text], 'query')
  return embedding
}

export async function embedDocuments(texts: string[]): Promise<number[][]> {
  return embed(texts, 'document')
}
