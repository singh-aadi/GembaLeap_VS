import type { CheckRecord, ChecklistItem } from '@gembaleap/schemas'
import { IST, JST } from './clock'
import type { SeedContext } from './context'
import { id } from './ids'
import { S, ST, U } from './tenants'

const item = (
  key: string,
  siteId: string,
  rest: Omit<ChecklistItem, 'id' | 'siteId'>,
): ChecklistItem => ({
  id: id(`check:${key}`),
  siteId,
  ...rest,
})

export const checklistItems: ChecklistItem[] = [
  item('sato:coil-heat', S.sato, {
    stageId: ST.blanking,
    label: {
      en: 'Coil heat number recorded at coil change',
      ja: 'コイル交換時のヒート番号記録',
      vi: 'Ghi số mẻ nấu (heat) khi thay cuộn',
    },
    standardRef: 'WI-BL-01 rev B',
    requirement: { kind: 'scan', field: 'heat_no' },
    slots: ['06:00'],
    critical: true,
  }),
  item('sato:blank-width', S.sato, {
    stageId: ST.blanking,
    label: {
      en: 'Blank width 182.0 ± 0.3 mm',
      ja: 'ブランク幅 182.0 ± 0.3 mm',
      vi: 'Chiều rộng phôi 182,0 ± 0,3 mm',
    },
    standardRef: 'WI-BL-02 rev A',
    requirement: { kind: 'measurement', unit: 'mm', min: 181.7, max: 182.3, decimals: 1 },
    slots: ['06:00', '10:00'],
    critical: false,
  }),
  item('sato:die-clearance', S.sato, {
    stageId: ST.press2,
    label: {
      en: 'Die D-114 clearance (feeler gauge)',
      ja: '金型D-114クリアランス（すきまゲージ）',
      vi: 'Khe hở khuôn D-114 (thước lá)',
    },
    standardRef: 'WI-PR2-04 rev C',
    requirement: { kind: 'measurement', unit: 'mm', min: 0.08, max: 0.12, decimals: 2 },
    slots: ['06:00'],
    critical: true,
  }),
  item('sato:hole-pitch', S.sato, {
    stageId: ST.press2,
    label: {
      en: 'Hole pitch on first-off part 48.00 ± 0.10 mm',
      ja: '初品の穴ピッチ 48.00 ± 0.10 mm',
      vi: 'Bước lỗ trên sản phẩm đầu 48,00 ± 0,10 mm',
    },
    standardRef: 'WI-PR2-07 rev D',
    requirement: { kind: 'measurement', unit: 'mm', min: 47.9, max: 48.1, decimals: 2 },
    slots: ['06:00', '08:00', '10:00', '12:00'],
    critical: true,
  }),
  item('sato:burr', S.sato, {
    stageId: ST.press2,
    label: {
      en: 'Burr height at hole edge ≤ 0.05 mm',
      ja: '穴縁バリ高さ ≤ 0.05 mm',
      vi: 'Chiều cao bavia mép lỗ ≤ 0,05 mm',
    },
    standardRef: 'WI-PR2-07 rev D',
    requirement: { kind: 'measurement', unit: 'mm', min: 0, max: 0.05, decimals: 2 },
    slots: ['08:00', '12:00'],
    critical: false,
  }),
  item('sato:tonnage', S.sato, {
    stageId: ST.press2,
    label: {
      en: 'Tonnage monitor reading 180–200 t',
      ja: 'トン数モニター 180〜200 t',
      vi: 'Đồng hồ lực dập 180–200 t',
    },
    standardRef: 'WI-PR2-02 rev A',
    requirement: { kind: 'measurement', unit: 't', min: 180, max: 200, decimals: 0 },
    slots: ['06:00'],
    critical: false,
  }),
  item('sato:lube', S.sato, {
    stageId: ST.press2,
    label: {
      en: 'Lubrication nozzles clear and spraying',
      ja: '潤滑ノズルの詰まりなし・噴霧確認',
      vi: 'Vòi bôi trơn thông, phun đều',
    },
    standardRef: 'WI-PR2-03 rev A',
    requirement: { kind: 'confirm' },
    slots: ['06:00'],
    critical: false,
  }),
  item('sato:red-bin', S.sato, {
    stageId: ST.press2,
    label: {
      en: 'Red-bin area labelled and segregated',
      ja: '不良品置場の表示・区分',
      vi: 'Khu thùng đỏ có nhãn và tách riêng',
    },
    standardRef: '5S-PR2 rev B',
    requirement: { kind: 'photo' },
    slots: ['13:30'],
    critical: false,
  }),
  item('sato:peel', S.sato, {
    stageId: ST.weld,
    label: {
      en: 'Peel test nugget diameter ≥ 4.5 mm',
      ja: 'ピール試験ナゲット径 ≥ 4.5 mm',
      vi: 'Thử bóc: đường kính mối hàn ≥ 4,5 mm',
    },
    standardRef: 'WI-SW-01 rev C',
    requirement: { kind: 'measurement', unit: 'mm', min: 4.5, max: 8, decimals: 1 },
    slots: ['06:30', '10:30'],
    critical: true,
  }),
  item('sato:tip-dress', S.sato, {
    stageId: ST.weld,
    label: {
      en: 'Electrode tips dressed',
      ja: '電極チップのドレス実施',
      vi: 'Đã sửa đầu điện cực',
    },
    standardRef: 'WI-SW-02 rev A',
    requirement: { kind: 'confirm' },
    slots: ['06:30', '10:30'],
    critical: false,
  }),
  item('sato:packing', S.sato, {
    stageId: ST.finalSato,
    label: {
      en: 'Packing photo with lot label visible',
      ja: 'ロットラベルが見える梱包写真',
      vi: 'Ảnh đóng gói thấy rõ nhãn lô',
    },
    standardRef: 'WI-FI-03 rev B',
    requirement: { kind: 'photo' },
    slots: ['11:00', '13:00'],
    critical: false,
  }),
  item('sato:cmm', S.sato, {
    stageId: ST.finalSato,
    label: {
      en: 'CMM report scanned for the lot',
      ja: 'ロットの三次元測定レポートをスキャン',
      vi: 'Quét báo cáo CMM của lô',
    },
    standardRef: 'WI-FI-01 rev C',
    requirement: { kind: 'scan', field: 'gauge_id' },
    slots: ['11:00'],
    critical: true,
  }),
  item('shakti:spectro', S.shakti, {
    stageId: ST.melt,
    label: {
      en: 'Spectro analysis of melt (C, Mn, Si) before pouring',
      ta: 'ஊற்றும் முன் உருகிய உலோக ஸ்பெக்ட்ரோ பகுப்பாய்வு (C, Mn, Si)',
      hi: 'ढलाई से पहले पिघली धातु का स्पेक्ट्रो विश्लेषण (C, Mn, Si)',
    },
    standardRef: 'QP-MLT-02 rev 4',
    requirement: { kind: 'photo' },
    slots: ['07:00', '11:00'],
    critical: true,
  }),
  item('shakti:pour-temp', S.shakti, {
    stageId: ST.melt,
    label: {
      en: 'Pouring temperature 1,560–1,600 °C',
      ta: 'ஊற்றும் வெப்பநிலை 1,560–1,600 °C',
      hi: 'ढलाई तापमान 1,560–1,600 °C',
    },
    standardRef: 'QP-MLT-03 rev 2',
    requirement: { kind: 'measurement', unit: '°C', min: 1560, max: 1600, decimals: 0 },
    slots: ['07:00', '11:00'],
    critical: false,
  }),
  item('shakti:bore', S.shakti, {
    stageId: ST.cnc,
    label: {
      en: 'Bore diameter 50.00 +0.05/−0 mm on first-off',
      ta: 'முதல் பாகத்தில் துளை விட்டம் 50.00 +0.05/−0 mm',
      hi: 'पहले पीस पर बोर व्यास 50.00 +0.05/−0 mm',
    },
    standardRef: 'QP-CNC-05 rev 3',
    requirement: { kind: 'measurement', unit: 'mm', min: 50, max: 50.05, decimals: 2 },
    slots: ['06:30', '10:30'],
    critical: true,
  }),
  item('shakti:hydro', S.shakti, {
    stageId: ST.hydro,
    label: {
      en: 'Shell test 24 bar held 120 s, no leak',
      ta: 'ஷெல் சோதனை 24 பார், 120 வினாடி, கசிவு இல்லை',
      hi: 'शेल टेस्ट 24 बार, 120 सेकंड, कोई रिसाव नहीं',
    },
    standardRef: 'ITP-KV-50 step 7',
    requirement: { kind: 'measurement', unit: 'bar', min: 24, max: 26, decimals: 0 },
    slots: ['08:00', '12:00'],
    critical: true,
  }),
  item('shakti:heat-stamp', S.shakti, {
    stageId: ST.finalShakti,
    label: {
      en: 'Heat number stamped on body matches traveller',
      ta: 'பாடியில் உள்ள ஹீட் எண் டிராவலருடன் பொருந்துகிறது',
      hi: 'बॉडी पर ठप्पा लगा हीट नंबर ट्रैवलर से मेल खाता है',
    },
    standardRef: 'ITP-KV-50 step 2',
    requirement: { kind: 'scan', field: 'heat_no' },
    slots: ['09:00'],
    critical: true,
  }),
]

type RecordSpec = {
  key: string
  slot: string
  at: string
  by: string
  result: CheckRecord['result']
  value?: number
  text?: string
  containment?: string
  caption: string
}

export function buildCheckRecords(ctx: SeedContext): CheckRecord[] {
  const { clock } = ctx
  const sato = (hhmm: string) => clock.local(0, hhmm, JST)
  const shakti = (hhmm: string) => clock.local(0, hhmm, IST)

  const specs: Array<RecordSpec & { siteId: string }> = [
    {
      siteId: S.sato,
      key: 'sato:coil-heat',
      slot: '06:00',
      at: sato('06:04'),
      by: U.lan,
      result: 'pass',
      text: 'H24-5521',
      caption: 'Coil tag, heat H24-5521',
    },
    {
      siteId: S.sato,
      key: 'sato:blank-width',
      slot: '06:00',
      at: sato('06:09'),
      by: U.lan,
      result: 'pass',
      value: 182.1,
      caption: 'Caliper on blank, 182.1 mm',
    },
    {
      siteId: S.sato,
      key: 'sato:blank-width',
      slot: '10:00',
      at: sato('10:06'),
      by: U.lan,
      result: 'pass',
      value: 181.9,
      caption: 'Caliper on blank, 181.9 mm',
    },
    {
      siteId: S.sato,
      key: 'sato:die-clearance',
      slot: '06:00',
      at: sato('06:12'),
      by: U.lan,
      result: 'pass',
      value: 0.1,
      caption: 'Feeler gauge 0.10 mm in die D-114',
    },
    {
      siteId: S.sato,
      key: 'sato:hole-pitch',
      slot: '06:00',
      at: sato('06:15'),
      by: U.lan,
      result: 'pass',
      value: 48.03,
      caption: 'Pitch gauge on first-off, 48.03 mm',
    },
    {
      siteId: S.sato,
      key: 'sato:hole-pitch',
      slot: '08:00',
      at: sato('08:02'),
      by: U.lan,
      result: 'pass',
      value: 47.98,
      caption: 'Pitch gauge, 47.98 mm',
    },
    {
      siteId: S.sato,

      key: 'sato:hole-pitch',
      slot: '10:00',
      at: sato('10:03'),
      by: U.lan,
      result: 'out_of_limit',
      value: 48.13,
      containment:
        'Line stopped 10:04. Die D-114 cleaned and pilot pins checked; re-measured 48.02 mm at 10:21. 46 parts made since 09:40 moved to red bin Q-07 for 100% check.',
      caption: 'Pitch gauge reading 48.13 mm',
    },
    {
      siteId: S.sato,
      key: 'sato:burr',
      slot: '08:00',
      at: sato('08:05'),
      by: U.lan,
      result: 'pass',
      value: 0.03,
      caption: 'Burr comparator, 0.03 mm',
    },
    {
      siteId: S.sato,
      key: 'sato:tonnage',
      slot: '06:00',
      at: sato('06:10'),
      by: U.lan,
      result: 'pass',
      value: 192,
      caption: 'Tonnage monitor display, 192 t',
    },
    {
      siteId: S.sato,
      key: 'sato:lube',
      slot: '06:00',
      at: sato('06:11'),
      by: U.lan,
      result: 'pass',
      caption: 'Nozzle spray pattern',
    },
    {
      siteId: S.sato,
      key: 'sato:peel',
      slot: '06:30',
      at: sato('06:41'),
      by: U.kenji,
      result: 'pass',
      value: 5.4,
      caption: 'Peel coupon, nugget 5.4 mm',
    },
    {
      siteId: S.sato,

      key: 'sato:peel',
      slot: '10:30',
      at: sato('10:38'),
      by: U.kenji,
      result: 'out_of_limit',
      value: 4.3,
      containment:
        'Electrode tips redressed; second peel 5.1 mm at 10:52. 120 parts welded since 10:00 held for peel sampling 1 in 20 before release.',
      caption: 'Peel coupon, nugget 4.3 mm',
    },
    {
      siteId: S.sato,
      key: 'sato:tip-dress',
      slot: '06:30',
      at: sato('06:35'),
      by: U.kenji,
      result: 'pass',
      caption: 'Dressed tips',
    },
    {
      siteId: S.sato,
      key: 'sato:tip-dress',
      slot: '10:30',
      at: sato('10:44'),
      by: U.kenji,
      result: 'pass',
      caption: 'Dressed tips after peel failure',
    },
    {
      siteId: S.shakti,
      key: 'shakti:bore',
      slot: '06:30',
      at: shakti('06:41'),
      by: U.sunil,
      result: 'pass',
      value: 50.02,
      caption: 'Bore gauge, 50.02 mm',
    },
    {
      siteId: S.shakti,
      key: 'shakti:spectro',
      slot: '07:00',
      at: shakti('07:12'),
      by: U.meena,
      result: 'pass',
      caption: 'Spectrometer printout, heat H24-0973',
    },
    {
      siteId: S.shakti,
      key: 'shakti:pour-temp',
      slot: '07:00',
      at: shakti('07:18'),
      by: U.sunil,
      result: 'pass',
      value: 1584,
      caption: 'Immersion pyrometer, 1,584 °C',
    },
  ]

  return specs.map((spec, index) => {
    const checklistItem = checklistItems.find((i) => i.id === id(`check:${spec.key}`))
    if (!checklistItem) throw new Error(`Unknown checklist item ${spec.key}`)
    const evidenceId = ctx.ev(`check:${spec.key}:${spec.slot}`, {
      kind: checklistItem.requirement.kind === 'scan' ? 'scan' : 'photo',
      siteId: spec.siteId,
      by: spec.by,
      at: spec.at,
      caption: spec.caption,
      extracted: spec.value === undefined ? undefined : { reading: spec.value },
    })
    return {
      id: id(`record:${index}:${spec.key}:${spec.slot}`),
      itemId: checklistItem.id,
      siteId: spec.siteId,
      stageId: checklistItem.stageId,
      shiftDate: ctx.clock.date,
      shift: 'A',
      slot: spec.slot,
      result: spec.result,
      value: spec.value,
      text: spec.text,
      containment: spec.containment,
      evidenceIds: [evidenceId],
      recordedBy: spec.by,
      recordedAt: spec.at,
    }
  })
}
