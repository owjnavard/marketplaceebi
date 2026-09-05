import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * یک هوک کوچک برای فراخوانی‌های ناهمگام.
 * از به‌روزرسانی وضعیت پس از unmount و از race condition جلوگیری می‌کند.
 */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const runId = useRef(0)

  const run = useCallback(() => {
    const id = ++runId.current
    setLoading(true)
    setError(null)
    fn()
      .then((res) => {
        if (id === runId.current) setData(res)
      })
      .catch((e: unknown) => {
        if (id === runId.current) setError(e instanceof Error ? e.message : 'خطای ناشناخته')
      })
      .finally(() => {
        if (id === runId.current) setLoading(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    run()
    return () => {
      runId.current++
    }
  }, [run])

  return { data, loading, error, reload: run, setData }
}
