export function SiteFooter() {
  return (
    <footer>
      <div className="mx-auto flex max-w-4xl flex-col items-start justify-between gap-4 px-4 py-10 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-foreground text-background">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                d="M5 17a3 3 0 100-6 3 3 0 000 6zm14 0a3 3 0 100-6 3 3 0 000 6zM8 14l3-7h4l2 4m-9 3l4-7"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="font-mono text-sm">vur selle</span>
        </div>
        <p className="font-mono text-xs text-muted-foreground">
          © {new Date().getFullYear()} Vur Selle Bikes. Built for the demo.
        </p>
      </div>
    </footer>
  )
}
