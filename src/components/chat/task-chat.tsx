'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Mic, MicOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { chatWithTasks, type Message, type AIModel } from '@/actions/chat'

// Web Speech API types — solo disponible en Chrome
interface ISpeechRecognitionResult {
  transcript: string
}
interface ISpeechRecognitionResultList {
  [index: number]: ISpeechRecognitionResult[]
}
interface ISpeechRecognitionEvent {
  results: ISpeechRecognitionResultList
}
interface ISpeechRecognition {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  onresult: ((event: ISpeechRecognitionEvent) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
  start(): void
  stop(): void
}
interface SpeechRecognitionWindow extends Window {
  SpeechRecognition?: new () => ISpeechRecognition
  webkitSpeechRecognition?: new () => ISpeechRecognition
}

export function TaskChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [model, setModel] = useState<AIModel>('anthropic')
  const [recording, setRecording] = useState(false)
  const recognitionRef = useRef<ISpeechRecognition | null>(null)
  const transcriptRef = useRef<string>('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  function toggleRecording() {
    const win = window as SpeechRecognitionWindow
    const SpeechRecognitionAPI = win.SpeechRecognition ?? win.webkitSpeechRecognition

    if (!SpeechRecognitionAPI) return

    if (recording) {
      recognitionRef.current?.stop()
      setRecording(false)
      return
    }

    const recognition = new SpeechRecognitionAPI()
    recognition.lang = 'es-ES'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    transcriptRef.current = ''

    // Guardar en ref — no actualizar state aquí para evitar problemas de orden
    recognition.onresult = (event: ISpeechRecognitionEvent) => {
      transcriptRef.current = event.results[0]?.[0]?.transcript ?? ''
    }

    // onend siempre dispara de último — aquí es seguro aplicar el transcript
    recognition.onend = () => {
      if (transcriptRef.current) {
        setInput((prev) => (prev ? `${prev} ${transcriptRef.current}` : transcriptRef.current))
        transcriptRef.current = ''
      }
      setRecording(false)
    }

    recognition.onerror = () => {
      transcriptRef.current = ''
      setRecording(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setRecording(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    const userMessage: Message = { role: 'user', content: text }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const { answer } = await chatWithTasks(messages, text, model)
      setMessages((prev) => [...prev, { role: 'assistant', content: answer }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Error al procesar tu consulta. Intenta de nuevo.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-white/[0.06] bg-white/[0.02]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Bot className="h-4 w-4 text-violet-400" />
          <span className="text-sm font-medium text-white">Asistente AI</span>
        </div>

        {/* Model selector */}
        <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-0.5">
          <button
            type="button"
            onClick={() => setModel('anthropic')}
            className={cn(
              'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
              model === 'anthropic'
                ? 'bg-violet-600 text-white'
                : 'text-neutral-400 hover:text-white'
            )}
          >
            Anthropic
          </button>
          <button
            type="button"
            onClick={() => setModel('groq')}
            className={cn(
              'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
              model === 'groq'
                ? 'bg-orange-600 text-white'
                : 'text-neutral-400 hover:text-white'
            )}
          >
            Groq
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="m-auto text-center text-xs text-neutral-600">
            Pregúntame sobre tus tareas.<br />
            Ej: &ldquo;¿Qué tareas tengo pendientes?&rdquo; o &ldquo;Muéstrame las tareas de alta prioridad&rdquo;
          </p>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn('flex gap-2.5', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
          >
            <div className={cn(
              'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
              msg.role === 'user' ? 'bg-green-600' : 'bg-violet-600'
            )}>
              {msg.role === 'user'
                ? <User className="h-3.5 w-3.5 text-white" />
                : <Bot className="h-3.5 w-3.5 text-white" />
              }
            </div>
            <div className={cn(
              'max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm',
              msg.role === 'user'
                ? 'bg-green-600/20 text-green-100'
                : 'bg-white/[0.06] text-neutral-200'
            )}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-600">
              <Bot className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="flex items-center gap-1 rounded-xl bg-white/[0.06] px-4 py-3">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-white/[0.06] p-3">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregunta sobre tus tareas…"
            disabled={loading}
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white placeholder-neutral-600 outline-none transition-colors focus:border-violet-500/60 disabled:opacity-50"
          />

          {/* Mic — solo Chrome */}
          <button
            type="button"
            onClick={toggleRecording}
            title="Dictado por voz (solo Chrome)"
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
              recording
                ? 'animate-pulse bg-red-600 text-white hover:bg-red-500'
                : 'bg-white/10 text-neutral-400 hover:bg-white/20 hover:text-white'
            )}
          >
            {recording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white transition-colors hover:bg-violet-500 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  )
}
