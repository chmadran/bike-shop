'use client'

import { useState } from 'react'

export function FaqBotLauncher() {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-[32rem] max-h-[calc(100dvh-7rem)] w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl sm:w-96">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: 'var(--geist-blue)' }}
              />
              <span className="text-sm font-medium">FAQ Assistant</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Close assistant"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              This is where your FAQ bot will live. Drop your chat component in
              here to answer questions about shipping, sizing, and returns.
            </p>
            <div className="flex flex-1 items-center justify-center rounded-md border border-dashed border-border p-3 text-center font-mono text-xs text-muted-foreground">
              bot mount point
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-opacity hover:opacity-90"
        aria-label="Open FAQ assistant"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path
            d="M21 11.5a8.38 8.38 0 01-8.5 8.5 8.5 8.5 0 01-3.9-.9L3 21l1.9-5.6a8.5 8.5 0 01-.9-3.9A8.38 8.38 0 0112.5 3 8.38 8.38 0 0121 11.5z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  )
}
