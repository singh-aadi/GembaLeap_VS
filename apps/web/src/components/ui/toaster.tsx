import { Toaster as Sonner } from 'sonner'

export function Toaster() {
  return (
    <Sonner
      position="top-center"
      toastOptions={{
        classNames: {
          toast: 'rounded-lg border border-line bg-surface text-ink text-sm shadow-md',
          description: 'text-muted',
        },
      }}
    />
  )
}
