import { useEffect, useRef, useState } from 'react'

export type Recording = { blob: Blob; seconds: number; url: string }

/** MediaRecorder wrapper. Stops at 60 s: a capture is a note, not a call. */
export function useVoiceRecorder(onError: () => void) {
  const recorder = useRef<MediaRecorder | null>(null)
  const startedAt = useRef(0)
  const [recording, setRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [result, setResult] = useState<Recording | null>(null)

  useEffect(() => {
    if (!recording) return
    const id = setInterval(() => {
      const seconds = Math.round((Date.now() - startedAt.current) / 1000)
      setElapsed(seconds)
      if (seconds >= 60) recorder.current?.stop()
    }, 250)
    return () => clearInterval(id)
  }, [recording])

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const chunks: Blob[] = []
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop())
        const blob = new Blob(chunks, { type: mediaRecorder.mimeType })
        setResult({
          blob,
          seconds: Math.round((Date.now() - startedAt.current) / 1000),
          url: URL.createObjectURL(blob),
        })
        setRecording(false)
      }
      recorder.current = mediaRecorder
      startedAt.current = Date.now()
      setElapsed(0)
      mediaRecorder.start()
      setRecording(true)
    } catch {
      onError()
    }
  }

  function stop() {
    recorder.current?.stop()
  }

  function clear() {
    if (result) URL.revokeObjectURL(result.url)
    setResult(null)
  }

  return { recording, elapsed, result, start, stop, clear }
}
