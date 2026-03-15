'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  FileText,
  Send,
  Brain,
  Sparkles,
  List,
  HelpCircle,
  Bot,
  User,
  Loader2,
  RefreshCcw,
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Separator } from '@/components/ui/separator'
import { formatFileSize } from '@/lib/mock-data'
import api from '@/lib/api'
import type { Document as DocType } from '@/lib/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
}

const SUGGESTED_QUESTIONS = [
  'What are the main topics covered?',
  'Give me a brief summary',
  'What are the key takeaways?',
  'Are there any action items?',
]

export default function DocumentChatPage() {
  const { id, docId } = useParams<{ id: string; docId: string }>()
  const { user } = useAuthStore()
  const router = useRouter()

  const [doc, setDoc] = useState<DocType | null>(null)
  const [loading, setLoading] = useState(true)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [clearConfirm, setClearConfirm] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalContent, setModalContent] = useState<React.ReactNode>(null)
  const [modalLoading, setModalLoading] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const sessionId = useRef(`session-${docId}-${user?.id ?? 'anon'}`)

  // Fetch document info
  useEffect(() => {
    async function fetchDoc() {
      if (!docId) return
      try {
        const docData = await api.getDocument(docId)
        setDoc(docData)
      } catch (err: any) {
        toast.error(err?.message || 'Failed to load document')
      } finally {
        setLoading(false)
      }
    }
    fetchDoc()
  }, [docId])

  // Load existing chat history on mount
  useEffect(() => {
    async function loadHistory() {
      if (!docId) return
      try {
        const res = await api.getChatHistory(sessionId.current)
        if (res.history && res.history.length > 0) {
          const restored: ChatMessage[] = []
          for (const msg of res.history) {
            restored.push({
              id: `restored-${Date.now()}-${Math.random()}`,
              role: msg.role === 'human' ? 'user' : 'assistant',
              content: msg.content,
              timestamp: new Date(),
              isStreaming: false,
            })
          }
          setMessages(restored)
        }
      } catch {
        // Non-critical: if history can't be loaded, start fresh
      }
    }
    loadHistory()
  }, [docId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading || !docId) return

      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: text.trim(),
        timestamp: new Date(),
      }

      const aiMsgId = (Date.now() + 1).toString()
      const aiMsg: ChatMessage = {
        id: aiMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      }

      setMessages((prev) => [...prev, userMsg, aiMsg])
      setInput('')
      setIsLoading(true)

      try {
        let accumulated = ''
        await api.chatStream(docId, sessionId.current, text.trim(), (chunk) => {
          accumulated += chunk
          setMessages((prev) =>
            prev.map((m) => (m.id === aiMsgId ? { ...m, content: accumulated } : m))
          )
        })
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId ? { ...m, content: accumulated, isStreaming: false } : m
          )
        )
      } catch (err: any) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId
              ? { ...m, content: 'Sorry, I encountered an error processing your request.', isStreaming: false }
              : m
          )
        )
        toast.error(err?.message || 'Chat failed')
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading, docId]
  )

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  async function handleClearHistory() {
    try {
      await api.clearHistory(sessionId.current)
    } catch {
      // Non-critical
    }
    setMessages([])
    setIsLoading(false)
    sessionId.current = `session-${docId}-${user?.id ?? 'anon'}`
    toast.success('Chat history cleared')
    setClearConfirm(false)
  }

  async function openSummary() {
    if (!docId) return
    setModalTitle('Document Summary')
    setModalContent(null)
    setModalLoading(true)
    setModalOpen(true)
    try {
      const res = await api.getSummary(docId)
      setModalContent(
        <div className="prose prose-invert max-w-none text-sm leading-relaxed text-foreground whitespace-pre-wrap">
          {res.summary}
        </div>
      )
    } catch (err: any) {
      setModalContent(
        <p className="text-sm text-destructive">{err?.message || 'Failed to generate summary'}</p>
      )
    }
    setModalLoading(false)
  }

  async function openKeyPoints() {
    if (!docId) return
    setModalTitle('Key Points')
    setModalContent(null)
    setModalLoading(true)
    setModalOpen(true)
    try {
      const res = await api.getKeyPoints(docId)
      setModalContent(
        <ul className="flex flex-col gap-3">
          {res.key_points.map((p: string, i: number) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span className="text-sm text-foreground">{p}</span>
            </li>
          ))}
        </ul>
      )
    } catch (err: any) {
      setModalContent(
        <p className="text-sm text-destructive">{err?.message || 'Failed to extract key points'}</p>
      )
    }
    setModalLoading(false)
  }

  async function openQA() {
    if (!docId) return
    setModalTitle('Generated Q&A')
    setModalContent(null)
    setModalLoading(true)
    setModalOpen(true)
    try {
      const res = await api.generateQA(docId)
      setModalContent(
        <div className="flex flex-col gap-4">
          {res.questions.map((item: { question: string; answer: string }, i: number) => (
            <div key={i} className="rounded-lg border border-border bg-secondary p-4">
              <p className="text-sm font-semibold text-primary mb-2 flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">Q</span>
                {item.question}
              </p>
              <p className="text-sm text-muted-foreground pl-7">{item.answer}</p>
            </div>
          ))}
        </div>
      )
    } catch (err: any) {
      setModalContent(
        <p className="text-sm text-destructive">{err?.message || 'Failed to generate Q&A'}</p>
      )
    }
    setModalLoading(false)
  }

  const docStatusColors: Record<string, string> = {
    INDEXED: 'text-green-400',
    READY: 'text-blue-400',
    UPLOADING: 'text-yellow-400',
    FAILED: 'text-red-400',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex gap-5 max-w-7xl mx-auto h-[calc(100vh-8rem)]">
      {/* Left Panel */}
      <aside className="w-72 flex flex-col gap-4 flex-shrink-0">
        <button
          onClick={() => router.push(`/dashboard/workspaces/${id}`)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to workspace
        </button>

        <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
          {/* Doc icon + name */}
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex-shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground leading-tight break-words">
                {doc?.name ?? 'Document'}
              </p>
              <p className={`text-xs mt-1 font-medium ${docStatusColors[doc?.status ?? ''] ?? 'text-muted-foreground'}`}>
                {doc?.status ?? '—'}
              </p>
            </div>
          </div>

          <Separator className="bg-border" />

          {/* Metadata */}
          <div className="flex flex-col gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Size</span>
              <span className="text-foreground font-medium">{doc ? formatFileSize(doc.size) : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">By</span>
              <span className="text-foreground font-medium">{doc?.uploadedBy ?? '—'}</span>
            </div>
          </div>

          <Separator className="bg-border" />

          {/* Action buttons */}
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              className="justify-start gap-2 border-border hover:bg-accent hover:border-primary/40 text-sm"
              onClick={openSummary}
            >
              <Sparkles className="w-4 h-4 text-primary" />
              Generate Summary
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="justify-start gap-2 border-border hover:bg-accent hover:border-primary/40 text-sm"
              onClick={openKeyPoints}
            >
              <List className="w-4 h-4 text-primary" />
              Key Points
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="justify-start gap-2 border-border hover:bg-accent hover:border-primary/40 text-sm"
              onClick={openQA}
            >
              <HelpCircle className="w-4 h-4 text-primary" />
              Generate Q&A
            </Button>
          </div>
        </div>
      </aside>

      {/* Right Panel — Chat */}
      <div className="flex-1 flex flex-col rounded-xl border border-border bg-card overflow-hidden">
        {/* Chat header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-card/80">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20">
              <Brain className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Chat with Document</p>
              <p className="text-xs text-muted-foreground">{doc?.name ?? 'Document'}</p>
            </div>
          </div>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground text-xs"
              onClick={() => setClearConfirm(true)}
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              Clear History
            </Button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-5 min-h-[300px]">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 border border-primary/20">
                <Brain className="w-7 h-7 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-foreground font-semibold">Ask anything about this document</p>
                <p className="text-muted-foreground text-sm mt-1">
                  I&apos;ll answer based on the document content
                </p>
              </div>
              {/* Suggested questions */}
              <div className="flex flex-wrap gap-2 justify-center max-w-md">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-xs px-3 py-1.5 rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex gap-3 max-w-[85%]',
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                )}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    'flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0 mt-0.5',
                    msg.role === 'user'
                      ? 'bg-primary/20 border border-primary/30'
                      : 'bg-muted border border-border'
                  )}
                >
                  {msg.role === 'user' ? (
                    <User className="w-3.5 h-3.5 text-primary" />
                  ) : (
                    <Bot className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={cn(
                    'rounded-2xl px-4 py-3 text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-sm'
                      : 'bg-secondary text-foreground rounded-tl-sm border border-border'
                  )}
                >
                  {msg.content ? (
                    <span className={msg.isStreaming ? 'typewriter-cursor' : ''}>
                      {msg.content}
                    </span>
                  ) : (
                    <div className="flex items-center gap-1.5 py-1">
                      <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggested questions (while chatting) */}
        {messages.length > 0 && !isLoading && (
          <div className="px-5 pb-2 flex gap-2 flex-wrap border-t border-border pt-3">
            {SUGGESTED_QUESTIONS.slice(0, 3).map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="text-xs px-2.5 py-1 rounded-full border border-border text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input area */}
        <div className="px-4 pb-4 pt-2 border-t border-border bg-card/80">
          <div className="flex items-end gap-3">
            <Textarea
              ref={textareaRef}
              placeholder="Ask anything about this document..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-input border-border focus-visible:ring-primary resize-none min-h-[44px] max-h-32 leading-relaxed"
              rows={1}
              disabled={isLoading}
            />
            <Button
              size="icon"
              className="h-11 w-11 bg-primary hover:bg-primary/90 text-primary-foreground flex-shrink-0"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* Info Modal (Summary / Key Points / Q&A) */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg bg-card border-border max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              {modalTitle}
            </DialogTitle>
          </DialogHeader>
          {modalLoading ? (
            <div className="flex items-center justify-center py-12 gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Generating with AI...</span>
            </div>
          ) : (
            <div className="mt-2">{modalContent}</div>
          )}
        </DialogContent>
      </Dialog>

      {/* Clear History Confirm */}
      <AlertDialog open={clearConfirm} onOpenChange={setClearConfirm}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Chat History</AlertDialogTitle>
            <AlertDialogDescription>
              All messages in this session will be deleted permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearHistory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
