import { useEffect, useState } from 'react'
import { outbox } from '@/lib/outbox'

export function useOutboxCount() {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const refresh = () => {
      outbox.count().then(setCount, () => setCount(0))
    }
    refresh()
    return outbox.subscribe(refresh)
  }, [])
  return count
}
