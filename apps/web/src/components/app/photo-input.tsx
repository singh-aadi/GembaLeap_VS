import { Camera } from 'lucide-react'
import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { digestBlob } from '@/lib/digest'

export type CapturedPhoto = { file: File; url: string; sha256: string }

/** Camera-first photo picker. Hashes the file on the device so the record carries its digest. */
export function PhotoInput({
  value,
  onChange,
  label,
  retakeLabel,
  alt,
}: {
  value: CapturedPhoto | undefined
  onChange: (photo: CapturedPhoto) => void
  label: string
  retakeLabel: string
  alt: string
}) {
  const input = useRef<HTMLInputElement>(null)
  return (
    <div>
      {value ? (
        <img
          src={value.url}
          alt={alt}
          className="mb-2 aspect-[4/3] w-full rounded-lg border border-line object-cover"
        />
      ) : null}
      <Button className="w-full" onClick={() => input.current?.click()}>
        <Camera aria-hidden />
        {value ? retakeLabel : label}
      </Button>
      <input
        ref={input}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        tabIndex={-1}
        onChange={async (e) => {
          const file = e.target.files?.[0]
          if (!file) return
          if (value) URL.revokeObjectURL(value.url)
          onChange({ file, url: URL.createObjectURL(file), sha256: await digestBlob(file) })
          e.target.value = ''
        }}
      />
    </div>
  )
}
