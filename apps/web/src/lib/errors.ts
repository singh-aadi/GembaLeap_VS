import { toast } from 'sonner'
import { AppError } from './app-error'
import type { MessageId } from './i18n'

/** Toast for a failed mutation. The inline state stays as it was so the user can retry. */
export function toastError(t: (id: MessageId) => string, error: unknown) {
  toast.error(t(`error.${AppError.codeOf(error)}`))
}
