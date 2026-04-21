'use server'

import Anthropic from '@anthropic-ai/sdk'
import Groq from 'groq-sdk'
import { searchTasks, type SearchResult } from '@/actions/search'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })

export type AIModel = 'anthropic' | 'groq'

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatResponse {
  answer: string
  sources: SearchResult[]
}

function buildSystemPrompt(context: string): string {
  return `Eres un asistente de productividad para TaskFlow AI.
Ayudas al usuario a entender y gestionar sus tareas.
Responde siempre en español y de forma concisa.

Tareas relevantes encontradas:
${context}`
}

async function callAnthropic(systemPrompt: string, messages: Message[], userMessage: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      ...messages.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: userMessage },
    ],
  })
  const block = response.content[0]
  if (block.type !== 'text') throw new Error('Unexpected response type')
  return block.text
}

async function callGroq(systemPrompt: string, messages: Message[], userMessage: string): Promise<string> {
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 1024,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: userMessage },
    ],
  })
  return response.choices[0]?.message?.content ?? ''
}

export async function chatWithTasks(
  messages: Message[],
  userMessage: string,
  model: AIModel = 'anthropic'
): Promise<ChatResponse> {
  const sources = await searchTasks(userMessage)

  const context =
    sources.length > 0
      ? sources.map((r, i) => `${i + 1}. ${r.content}`).join('\n')
      : 'No se encontraron tareas relevantes.'

  const systemPrompt = buildSystemPrompt(context)
  console.log("----> systemPrompt: ", { systemPrompt });

  const answer = model === 'groq'
    ? await callGroq(systemPrompt, messages, userMessage)
    : await callAnthropic(systemPrompt, messages, userMessage)

  return { answer, sources }
}
