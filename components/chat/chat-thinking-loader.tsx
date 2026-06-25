export function ChatThinkingLoader() {
  return (
    <div className="flex items-center gap-1.5" role="status" aria-label="Thinking…">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="h-1.5 w-1.5 rounded-full bg-current opacity-40 animate-[fadein_0.9s_ease-in-out_infinite]"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  )
}
