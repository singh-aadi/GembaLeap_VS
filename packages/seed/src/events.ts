import type { Event } from '@gembaleap/schemas'
import { IST, JST } from './clock'
import type { SeedContext } from './context'
import { id } from './ids'
import { S, ST, T, U } from './tenants'

type EventSpec = Omit<
  Event,
  'id' | 'tenantId' | 'siteId' | 'evidenceIds' | 'createdAt' | 'confirmedAt' | 'createdBy'
> & {
  key: string
  site: 'sato' | 'shakti'
  day: number
  time: string
  by: string
  lotKey?: string
  media: Array<{ kind: 'photo' | 'audio' | 'scan'; caption: string }>
}

const SITE = {
  sato: { siteId: S.sato, tenantId: T.sato, offset: JST },
  shakti: { siteId: S.shakti, tenantId: T.shakti, offset: IST },
} as const

const specs: EventSpec[] = [
  {
    key: 'pitch-today',
    site: 'sato',
    day: 0,
    time: '10:03',
    by: U.lan,
    stageId: ST.press2,
    type: 'defect',
    codes: ['D-PITCH-OOT'],
    lotKey: 'SPW-2410-031',
    severity: 3,
    lossMinutes: 17,
    locale: 'vi',
    summaryLocal:
      'Bước lỗ đo được 48,13 mm, vượt dung sai. Đã dừng máy, vệ sinh khuôn D-114, đo lại 48,02 mm.',
    summaryEn:
      'Hole pitch measured 48.13 mm, out of tolerance. Line stopped, die D-114 cleaned, re-measured 48.02 mm.',
    summaryJa: '穴ピッチ48.13 mm、公差外。ライン停止、金型D-114清掃後、48.02 mmで再測定。',
    status: 'confirmed',
    media: [
      { kind: 'photo', caption: 'Pitch gauge reading 48.13 mm' },
      { kind: 'audio', caption: 'Voice note, Vietnamese, 18 s' },
    ],
  },
  {
    key: 'coil-jam-today',
    site: 'sato',
    day: 0,
    time: '08:40',
    by: U.lan,
    stageId: ST.press2,
    type: 'downtime',
    codes: ['DT-COIL-FEED'],
    severity: 2,
    lossMinutes: 12,
    locale: 'vi',
    summaryLocal: 'Kẹt cấp phôi cuộn ở máy nắn thẳng, dừng 12 phút.',
    summaryEn: 'Coil feed jammed at the straightener; line down 12 minutes.',
    summaryJa: 'レベラーでコイル送り詰まり、12分停止。',
    status: 'confirmed',
    media: [{ kind: 'photo', caption: 'Straightener rollers with jammed strip' }],
  },
  {
    key: 'weld-today',
    site: 'sato',
    day: 0,
    time: '10:41',
    by: U.lan,
    stageId: ST.weld,
    type: 'defect',
    codes: ['D-WELD-NUGGET'],
    lotKey: 'SPW-2410-031',
    severity: 3,
    lossMinutes: 9,
    locale: 'vi',
    summaryLocal: 'Thử bóc mối hàn: đường kính 4,3 mm, dưới mức 4,5 mm. Đã sửa đầu điện cực.',
    summaryEn: 'Peel test nugget 4.3 mm, below the 4.5 mm minimum. Electrode tips redressed.',
    summaryJa: 'ピール試験でナゲット径4.3 mm（基準4.5 mm以上）。電極チップを再ドレス。',
    status: 'draft',
    media: [
      { kind: 'photo', caption: 'Peel coupon on bench' },
      { kind: 'audio', caption: 'Voice note, Vietnamese, 22 s' },
    ],
  },
  {
    key: 'die-change-d1',
    site: 'sato',
    day: -1,
    time: '13:10',
    by: U.lan,
    stageId: ST.press2,
    type: 'downtime',
    codes: ['DT-DIE-CHANGE'],
    severity: 2,
    lossMinutes: 42,
    locale: 'vi',
    summaryLocal: 'Thay khuôn D-114 mất 42 phút, tiêu chuẩn 25 phút. Thiếu bu lông kẹp.',
    summaryEn:
      'Die change to D-114 took 42 minutes against a 25-minute standard. Clamp bolts were missing from the cart.',
    summaryJa: '金型D-114の段取り替えに42分（標準25分）。クランプボルトが台車になかった。',
    status: 'confirmed',
    media: [{ kind: 'photo', caption: 'Die cart without clamp bolts' }],
  },
  {
    key: 'coil-cert-d1',
    site: 'sato',
    day: -1,
    time: '09:20',
    by: U.kenji,
    stageId: ST.blanking,
    type: 'material',
    codes: ['M-CERT-MISSING'],
    severity: 3,
    lossMinutes: 25,
    locale: 'ja',
    summaryLocal: 'コイルがミルシートなしで入荷。仕入先に依頼し25分待ち。',
    summaryEn:
      'Coil arrived without its mill certificate; 25 minutes waiting for the steel service centre to send it.',
    status: 'confirmed',
    media: [{ kind: 'photo', caption: 'Coil tag without certificate envelope' }],
  },
  {
    key: 'guard-d2',
    site: 'sato',
    day: -2,
    time: '07:45',
    by: U.kenji,
    stageId: ST.press2,
    type: 'safety',
    codes: ['S-GUARD-BYPASS'],
    severity: 4,
    lossMinutes: 30,
    locale: 'ja',
    summaryLocal: '金型調整中にライトカーテンが無効化されていた。復旧し、全員に再教育。',
    summaryEn:
      'Light curtain found bypassed during die adjustment. Restored, and the whole shift re-briefed.',
    status: 'confirmed',
    media: [{ kind: 'photo', caption: 'Light curtain controller' }],
  },
  {
    key: 'qr-idea-d3',
    site: 'sato',
    day: -3,
    time: '12:15',
    by: U.lan,
    stageId: ST.finalSato,
    type: 'idea',
    codes: ['I-LABEL-QR'],
    severity: 1,
    locale: 'vi',
    summaryLocal: 'In mã QR của lô lên nhãn đóng gói để khách hàng quét hộ chiếu lô.',
    summaryEn:
      'Print the lot QR on the packing label so the customer can scan the lot passport at goods-in.',
    summaryJa:
      '梱包ラベルにロットQRを印刷し、受入時に顧客がロットパスポートをスキャンできるようにする。',
    status: 'confirmed',
    media: [{ kind: 'photo', caption: 'Current packing label' }],
  },
  {
    key: 'pitch-d4',
    site: 'sato',
    day: -4,
    time: '11:05',
    by: U.lan,
    stageId: ST.press2,
    type: 'defect',
    codes: ['D-PITCH-OOT'],
    severity: 3,
    lossMinutes: 21,
    locale: 'vi',
    summaryLocal: 'Bước lỗ 48,12 mm, vượt dung sai. Dừng máy 21 phút.',
    summaryEn: 'Hole pitch 48.12 mm, out of tolerance. Line stopped 21 minutes.',
    summaryJa: '穴ピッチ48.12 mm、公差外。21分停止。',
    status: 'confirmed',
    media: [{ kind: 'photo', caption: 'Pitch gauge reading 48.12 mm' }],
  },
  {
    key: 'die-change-d5',
    site: 'sato',
    day: -5,
    time: '13:20',
    by: U.lan,
    stageId: ST.press2,
    type: 'downtime',
    codes: ['DT-DIE-CHANGE'],
    severity: 2,
    lossMinutes: 38,
    locale: 'vi',
    summaryLocal: 'Thay khuôn mất 38 phút.',
    summaryEn: 'Die change took 38 minutes.',
    summaryJa: '段取り替えに38分。',
    status: 'confirmed',
    media: [{ kind: 'audio', caption: 'Voice note, Vietnamese, 9 s' }],
  },
  {
    key: 'burr-d6',
    site: 'sato',
    day: -6,
    time: '08:30',
    by: U.lan,
    stageId: ST.press2,
    type: 'defect',
    codes: ['D-BURR'],
    severity: 2,
    lossMinutes: 14,
    locale: 'vi',
    summaryLocal: 'Bavia 0,07 mm ở mép lỗ. Mài lại chày.',
    summaryEn: 'Burr 0.07 mm at hole edge. Punch reground.',
    summaryJa: '穴縁バリ0.07 mm。パンチ再研磨。',
    status: 'confirmed',
    media: [{ kind: 'photo', caption: 'Burr under magnifier' }],
  },
  {
    key: 'hydro-leak-d1',
    site: 'shakti',
    day: -1,
    time: '15:40',
    by: U.meena,
    stageId: ST.hydro,
    type: 'defect',
    codes: ['D-HYDRO-LEAK'],
    lotKey: 'SCV-2410-116',
    severity: 4,
    lossMinutes: 35,
    locale: 'ta',
    summaryLocal:
      'ஹைட்ரோ சோதனையில் பாடி-போனட் இணைப்பில் கசிவு. 40 இல் 3 துண்டுகள். கேஸ்கெட் மாற்றி மறுசோதனை.',
    summaryEn:
      'Leak at the body–bonnet joint during hydro test, 3 of 40 pieces. Gasket replaced and retested.',
    status: 'confirmed',
    media: [
      { kind: 'photo', caption: 'Wet joint on test bench' },
      { kind: 'scan', caption: 'Hydro test chart, 24 bar' },
    ],
  },
  {
    key: 'heat-mismatch-d0',
    site: 'shakti',
    day: 0,
    time: '07:35',
    by: U.meena,
    stageId: ST.finalShakti,
    type: 'material',
    codes: ['M-HEAT-MISMATCH'],
    lotKey: 'SCV-2410-118',
    severity: 4,
    lossMinutes: 0,
    locale: 'ta',
    summaryLocal:
      'மில் சான்றிதழில் உள்ள ஹீட் எண் (H24-0917) பாடியில் உள்ள எண்ணுடன் (H24-0971) பொருந்தவில்லை. லாட் நிறுத்தி வைக்கப்பட்டது.',
    summaryEn:
      'Heat number on the mill certificate (H24-0917) does not match the body stamp (H24-0971). Lot on hold.',
    status: 'confirmed',
    media: [
      { kind: 'scan', caption: 'Mill certificate, heat H24-0917' },
      { kind: 'photo', caption: 'Body stamp, heat H24-0971' },
    ],
  },
  {
    key: 'sand-hole-d2',
    site: 'shakti',
    day: -2,
    time: '10:10',
    by: U.sunil,
    stageId: ST.fettle,
    type: 'defect',
    codes: ['D-SAND-HOLE'],
    severity: 3,
    lossMinutes: 15,
    locale: 'hi',
    summaryLocal: 'फेटलिंग में बॉडी पर रेत का छेद मिला, 2 पीस अलग रखे।',
    summaryEn: 'Sand hole found on two bodies during fettling; both segregated.',
    status: 'confirmed',
    media: [{ kind: 'photo', caption: 'Sand hole near flange' }],
  },
]

export function buildEvents(ctx: SeedContext, lotIdByNo: Record<string, string>): Event[] {
  return specs.map((spec) => {
    const site = SITE[spec.site]
    const createdAt = ctx.clock.local(spec.day, spec.time, site.offset)
    const evidenceIds = spec.media.map((m, i) =>
      ctx.ev(`event:${spec.key}:${i}`, {
        kind: m.kind,
        siteId: site.siteId,
        by: spec.by,
        at: createdAt,
        caption: m.caption,
      }),
    )
    const { key, site: _site, day: _day, time: _time, by, lotKey, media: _media, ...rest } = spec
    return {
      ...rest,
      id: id(`event:${key}`),
      tenantId: site.tenantId,
      siteId: site.siteId,
      lotId: lotKey ? lotIdByNo[lotKey] : undefined,
      evidenceIds,
      createdBy: by,
      createdAt,
      confirmedAt:
        spec.status === 'confirmed'
          ? new Date(Date.parse(createdAt) + 4 * 60_000).toISOString()
          : undefined,
    }
  })
}

export const EVENT_IDS = {
  pitchToday: id('event:pitch-today'),
  weldToday: id('event:weld-today'),
  dieChange: id('event:die-change-d1'),
  coilCert: id('event:coil-cert-d1'),
  hydroLeak: id('event:hydro-leak-d1'),
  heatMismatch: id('event:heat-mismatch-d0'),
  pitchD4: id('event:pitch-d4'),
} as const
