/** Word mark: a stepped ladder glyph, no gradients. */
export function Brand({ className }: { className?: string }) {
  return (
    <span className={className}>
      <svg viewBox="0 0 24 24" aria-hidden className="mr-2 inline-block size-6 align-[-6px]">
        <rect x="2" y="15" width="5" height="7" rx="1" fill="currentColor" opacity="0.45" />
        <rect x="9.5" y="9" width="5" height="13" rx="1" fill="currentColor" opacity="0.7" />
        <rect x="17" y="2" width="5" height="20" rx="1" fill="var(--gl-teal)" />
      </svg>
      <span className="font-semibold tracking-tight">GembaLeap</span>
    </span>
  )
}
