'use client'

import { useRef, useEffect } from 'react'
import { ChatAssistantMessage } from '@/components/chat/chat-assistant-message'
import { ChatBikeAttachments } from '@/components/chat/chat-bike-attachments'
import { ChatThinkingLoader } from '@/components/chat/chat-thinking-loader'
import { FIRST_CHAT_PLACEHOLDER, MAX_MESSAGE_LENGTH, normalizeChatMessage } from '@/lib/chat-constants'
import type { ChatMessage, ChatStatus } from '@/lib/chat-types'

type ChatMessageThreadProps = {
  messages: ChatMessage[]
  status: ChatStatus
  onSend: (message: string) => void
}

export function ChatMessageThread({ messages, status, onSend }: ChatMessageThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const isBusy = status !== 'idle'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const message = normalizeChatMessage(new FormData(form).get('message'))
    if (!message || isBusy) return
    onSend(message)
    form.reset()
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            Ask me anything about shipping, sizing, returns, or stock.
          </p>
        )}
        {messages.map((msg) => {
          const catalog = msg.attachments?.find((item) => item.type === 'catalog')
          const hasContent = msg.text.length > 0 || Boolean(catalog)
          if (msg.role === 'assistant' && !hasContent) return null

          const isUser = msg.role === 'user'
          return (
            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[92%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                  isUser ? 'max-w-[80%] bg-foreground text-background' : 'bg-muted text-foreground'
                }`}
              >
                {!isUser && catalog && (
                  <div className="mb-3 border-b border-border pb-3">
                    <ChatBikeAttachments models={catalog.models} />
                  </div>
                )}
                {msg.text ? (
                  isUser ? (
                    <span className="whitespace-pre-wrap">{msg.text}</span>
                  ) : (
                    <div className="animate-[fadein_0.15s_ease-in]">
                      <ChatAssistantMessage text={msg.text} />
                    </div>
                  )
                ) : null}
              </div>
            </div>
          )
        })}
        {isBusy && messages.at(-1)?.text === '' && !messages.at(-1)?.attachments?.length && (
          <div className="flex justify-start">
            <div className="rounded-lg bg-muted px-3 py-2">
              <ChatThinkingLoader />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-border px-3 py-2">
        <input
          name="message"
          placeholder={messages.length === 0 ? FIRST_CHAT_PLACEHOLDER : ''}
          disabled={isBusy}
          autoComplete="off"
          maxLength={MAX_MESSAGE_LENGTH}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isBusy}
          className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background transition-opacity hover:opacity-80 disabled:opacity-40"
          aria-label="Send"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
            <path
              d="M5 12h14M13 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </form>
    </>
  )
}
