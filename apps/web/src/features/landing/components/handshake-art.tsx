import { useT } from '@/lib/i18n'

/**
 * Buyer (left, suit sleeve, OEM plant behind) and supplier (right, work sleeve,
 * workshop behind) shake hands over a sealed record. Drawn inline so it themes,
 * scales and needs no image request.
 */
export function HandshakeArt({ className }: { className?: string }) {
  const t = useT()
  return (
    <figure className={className}>
      <svg
        viewBox="0 0 480 360"
        role="img"
        aria-labelledby="handshake-title"
        className="h-auto w-full"
      >
        <title id="handshake-title">{t('landing.hero.artAlt')}</title>
        <defs>
          <linearGradient id="hs-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#16345c" />
            <stop offset="1" stopColor="#0b1f3a" />
          </linearGradient>
          <linearGradient id="hs-skin-a" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#e9b48a" />
            <stop offset="1" stopColor="#c98b62" />
          </linearGradient>
          <linearGradient id="hs-skin-b" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#b97a4f" />
            <stop offset="1" stopColor="#8f5a36" />
          </linearGradient>
          <clipPath id="hs-frame">
            <rect width="480" height="360" rx="20" />
          </clipPath>
        </defs>

        <g clipPath="url(#hs-frame)">
          <rect width="480" height="360" fill="url(#hs-sky)" />
          {/* Ground */}
          <rect y="286" width="480" height="74" fill="#0a1a31" />

          {/* OEM plant, left */}
          <g fill="#1f4370">
            <rect x="18" y="168" width="150" height="118" rx="4" />
            <rect x="40" y="128" width="16" height="44" />
            <rect x="66" y="142" width="12" height="30" />
          </g>
          <g fill="#2c5a92">
            <rect x="34" y="196" width="26" height="18" rx="2" />
            <rect x="70" y="196" width="26" height="18" rx="2" />
            <rect x="106" y="196" width="26" height="18" rx="2" />
            <rect x="34" y="226" width="26" height="18" rx="2" />
            <rect x="70" y="226" width="26" height="18" rx="2" />
            <rect x="106" y="226" width="26" height="18" rx="2" />
          </g>
          <rect x="140" y="246" width="20" height="40" fill="#163257" />
          <text
            x="93"
            y="186"
            textAnchor="middle"
            fontSize="11"
            fontWeight="600"
            fill="#a8c7fa"
            letterSpacing="2"
          >
            OEM
          </text>

          {/* Supplier workshop, right: saw-tooth roof */}
          <g fill="#14505a">
            <path d="M310 286 V196 l28 -22 v22 l28 -22 v22 l28 -22 v22 l28 -22 v22 l28 -22 V286 Z" />
          </g>
          <rect x="420" y="130" width="14" height="60" fill="#14505a" />
          <g fill="#1f7c87">
            <rect x="326" y="214" width="30" height="20" rx="2" />
            <rect x="368" y="214" width="30" height="20" rx="2" />
            <rect x="410" y="214" width="30" height="20" rx="2" />
          </g>
          <rect x="344" y="246" width="40" height="40" fill="#0f3f47" />
          <path d="M344 256 h40 M344 266 h40 M344 276 h40" stroke="#14505a" strokeWidth="2" />
          {/* Smoke */}
          <g fill="#4fd1bf" opacity="0.25" className="lp-float">
            <circle cx="427" cy="118" r="8" />
            <circle cx="438" cy="104" r="10" />
            <circle cx="452" cy="88" r="12" />
          </g>

          {/* Sealed record floating above the handshake */}
          <g className="lp-float" style={{ animationDelay: '0.6s' }}>
            <g className="lp-pop" style={{ animationDelay: '1.5s' }}>
              <rect x="196" y="38" width="88" height="104" rx="8" fill="#ffffff" />
              <rect x="208" y="54" width="52" height="6" rx="3" fill="#c6d4e8" />
              <rect x="208" y="68" width="64" height="5" rx="2.5" fill="#e3e9f2" />
              <rect x="208" y="80" width="58" height="5" rx="2.5" fill="#e3e9f2" />
              <rect x="208" y="92" width="44" height="5" rx="2.5" fill="#e3e9f2" />
              <circle cx="262" cy="120" r="16" fill="#0e9f8e" />
              <path
                d="M254 120 l6 6 l11 -12"
                fill="none"
                stroke="#fff"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </g>

          {/* Arms and hands */}
          <g className="lp-shake">
            <g className="lp-arm-left">
              {/* Buyer: navy suit sleeve with shirt cuff */}
              <path d="M-30 300 L150 214 L176 268 L-4 354 Z" fill="#0d2a4f" />
              <path d="M-30 300 L150 214 L156 226 L-24 312 Z" fill="#163a68" />
              <path d="M150 214 L176 268 L192 260 L166 206 Z" fill="#f4f6fa" />
              <path
                d="M166 206 C196 194 236 190 264 202 C280 209 282 228 266 232 L236 236 C250 242 252 260 236 264 L192 260 Z"
                fill="url(#hs-skin-a)"
              />
            </g>
            <g className="lp-arm-right">
              {/* Supplier: rolled work sleeve */}
              <path d="M510 300 L330 214 L304 268 L484 354 Z" fill="#0e7a6e" />
              <path d="M510 300 L330 214 L324 226 L504 312 Z" fill="#14958a" />
              <path d="M330 214 L304 268 L290 262 L316 206 Z" fill="#0b5f56" />
              <path
                d="M316 206 C284 190 244 188 214 200 C200 206 202 222 218 224 L254 222 C242 230 244 246 258 248 L290 262 Z"
                fill="url(#hs-skin-b)"
              />
              {/* Finger creases over the clasp */}
              <path
                d="M226 224 C224 232 228 240 236 242 M238 226 C236 234 240 242 248 244 M250 226 C249 234 252 242 260 246"
                fill="none"
                stroke="#6e4428"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.55"
              />
              {/* Thumb */}
              <path
                d="M262 206 C252 196 236 194 226 200"
                fill="none"
                stroke="#6e4428"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.5"
              />
            </g>
          </g>

          {/* Labels */}
          <g fontSize="12" fontWeight="600">
            <rect x="24" y="310" width="122" height="28" rx="14" fill="#ffffff" opacity="0.12" />
            <text x="85" y="329" textAnchor="middle" fill="#ffffff">
              {t('landing.hero.buyer')}
            </text>
            <rect x="334" y="310" width="122" height="28" rx="14" fill="#ffffff" opacity="0.12" />
            <text x="395" y="329" textAnchor="middle" fill="#ffffff">
              {t('landing.hero.supplier')}
            </text>
          </g>
        </g>
      </svg>
    </figure>
  )
}
