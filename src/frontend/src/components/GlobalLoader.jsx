import React, { useEffect, useState, useSyncExternalStore } from 'react'
import { loadingStore } from '../utils/loadingStore.js'

const SHOW_DELAY_MS = 200

const GlobalLoader = () => {
  const pendingCount = useSyncExternalStore(
    loadingStore.subscribe,
    loadingStore.getSnapshot,
    loadingStore.getSnapshot
  )

  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let timer

    if (pendingCount > 0) {
      timer = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS)
    } else {
      setVisible(false)
    }

    return () => {
      if (timer) window.clearTimeout(timer)
    }
  }, [pendingCount])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="vv-surface mx-4 w-full max-w-sm rounded-2xl bg-white/95 p-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div
            className="h-10 w-10 rounded-full border-[3px] border-[rgba(2,57,74,0.18)] border-t-[var(--vv-primary)] animate-spin"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">Processing…</p>
            <p className="mt-1 text-xs text-slate-600">
              Please wait while we verify your request.
            </p>
          </div>
        </div>

        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-[rgba(2,57,74,0.12)]">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-[var(--vv-primary)]" />
        </div>
      </div>
    </div>
  )
}

export default GlobalLoader
