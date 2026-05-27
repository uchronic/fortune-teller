const WUXING_GAN: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
}
const YIN_YANG_GAN: Record<string, string> = {
  '甲': '阳木', '乙': '阴木', '丙': '阳火', '丁': '阴火', '戊': '阳土',
  '己': '阴土', '庚': '阳金', '辛': '阴金', '壬': '阳水', '癸': '阴水',
}
const ZHI_DETAIL: Record<string, { wx: string; cang: string; month: string }> = {
  '子': { wx: '水', cang: '癸', month: '十一月' },
  '丑': { wx: '土', cang: '己癸辛', month: '十二月' },
  '寅': { wx: '木', cang: '甲丙戊', month: '正月' },
  '卯': { wx: '木', cang: '乙', month: '二月' },
  '辰': { wx: '土', cang: '戊乙癸', month: '三月' },
  '巳': { wx: '火', cang: '丙戊庚', month: '四月' },
  '午': { wx: '火', cang: '丁己', month: '五月' },
  '未': { wx: '土', cang: '己丁乙', month: '六月' },
  '申': { wx: '金', cang: '庚壬戊', month: '七月' },
  '酉': { wx: '金', cang: '辛', month: '八月' },
  '戌': { wx: '土', cang: '戊辛丁', month: '九月' },
  '亥': { wx: '水', cang: '壬甲', month: '十月' },
}

const SHISHEN_TABLE: Record<string, Record<string, string>> = {
  '同我同': '比肩', '同我异': '劫财',
  '我生同': '食神', '我生异': '伤官',
  '我克同': '偏财', '我克异': '正财',
  '克我同': '偏官', '克我异': '正官',
  '生我同': '偏印', '生我异': '正印',
}

const WUXING_RELATION: Record<string, Record<string, string>> = {
  '木': { '木': '同我', '火': '我生', '土': '我克', '金': '克我', '水': '生我' },
  '火': { '火': '同我', '土': '我生', '金': '我克', '水': '克我', '木': '生我' },
  '土': { '土': '同我', '金': '我生', '水': '我克', '木': '克我', '火': '生我' },
  '金': { '金': '同我', '水': '我生', '木': '我克', '火': '克我', '土': '生我' },
  '水': { '水': '同我', '木': '我生', '火': '我克', '土': '克我', '金': '生我' },
}

const SHISHEN_MEANING: Record<string, string> = {
  '比肩': '独立自主、竞争、兄弟朋友',
  '劫财': '争夺、冲动、社交活跃',
  '食神': '才华、口福、温和、子女缘',
  '伤官': '聪明叛逆、创意、不服管束',
  '偏财': '意外之财、父亲、慷慨大方',
  '正财': '稳定收入、勤俭、妻缘（男命）',
  '偏官': '魄力、压力、意外、权威',
  '正官': '正统、名誉、事业、丈夫（女命）',
  '偏印': '偏门学问、孤独、灵感',
  '正印': '学业、母亲、贵人、慈爱',
}

const DAYUN_MEANING: Record<string, string> = {
  '比肩': '竞争加剧，宜合作不宜独行',
  '劫财': '破财之象，谨慎投资与合伙',
  '食神': '才华发挥期，利创作、饮食、子女',
  '伤官': '变动期，利创新但防口舌是非',
  '偏财': '财运活跃，利投资、偏门收入',
  '正财': '收入稳定期，利置业、储蓄',
  '偏官': '压力与机遇并存，利考试、升迁',
  '正官': '事业上升期，利仕途、名誉',
  '偏印': '学习转型期，利研究、技术',
  '正印': '贵人运旺，利学业、考证、置业',
}

function getShishen(dayGan: string, targetGan: string): string {
  const dayWx = WUXING_GAN[dayGan]
  const targetWx = WUXING_GAN[targetGan]
  if (!dayWx || !targetWx) return ''
  const relation = WUXING_RELATION[dayWx][targetWx]
  const dayYY = '甲丙戊庚壬'.includes(dayGan) ? '阳' : '阴'
  const targetYY = '甲丙戊庚壬'.includes(targetGan) ? '阳' : '阴'
  const same = dayYY === targetYY ? '同' : '异'
  const key = relation + same
  return (SHISHEN_TABLE as any)[key] || ''
}

function countWuxing(bazi: any): Record<string, number> {
  const counts: Record<string, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 }
  const gans = [bazi.year.gan, bazi.month.gan, bazi.day.gan, bazi.hour.gan]
  const zhis = [bazi.year.zhi, bazi.month.zhi, bazi.day.zhi, bazi.hour.zhi]
  gans.forEach(g => { if (WUXING_GAN[g]) counts[WUXING_GAN[g]]++ })
  zhis.forEach(z => { if (ZHI_DETAIL[z]) counts[ZHI_DETAIL[z].wx]++ })
  return counts
}

export function analyzeBazi(bazi: any, gender?: 'male' | 'female'): string[] {
  const dayGan = bazi.day.gan
  const dayWx = WUXING_GAN[dayGan]
  const analysis: string[] = []

  // 日主
  analysis.push(`【日主】${dayGan}（${YIN_YANG_GAN[dayGan]}），为命主本元，一切以日干为中心论命。`)

  // 四柱详解
  analysis.push(`【四柱天干】年${bazi.year.gan}（${YIN_YANG_GAN[bazi.year.gan]}）月${bazi.month.gan}（${YIN_YANG_GAN[bazi.month.gan]}）日${bazi.day.gan} 时${bazi.hour.gan}（${YIN_YANG_GAN[bazi.hour.gan]}）`)

  // 地支藏干
  const zhis = [
    { pos: '年支', zhi: bazi.year.zhi },
    { pos: '月支', zhi: bazi.month.zhi },
    { pos: '日支', zhi: bazi.day.zhi },
    { pos: '时支', zhi: bazi.hour.zhi },
  ]
  const cangGanStr = zhis.map(z => `${z.pos}${z.zhi}藏${ZHI_DETAIL[z.zhi]?.cang || '?'}`).join('；')
  analysis.push(`【地支藏干】${cangGanStr}。`)

  // 十神
  const positions = [
    { pos: '年干', gan: bazi.year.gan },
    { pos: '月干', gan: bazi.month.gan },
    { pos: '时干', gan: bazi.hour.gan },
  ]
  analysis.push('【十神配置】')
  positions.forEach(p => {
    const ss = getShishen(dayGan, p.gan)
    analysis.push(`　${p.pos}${p.gan}为「${ss}」— ${SHISHEN_MEANING[ss] || ''}`)
  })

  // 地支关系
  const dizhiAnalysis = analyzeDizhi(bazi)
  if (dizhiAnalysis.length > 0) {
    analysis.push('【地支关系】')
    dizhiAnalysis.forEach(d => analysis.push(`　${d}`))
  }

  // 空亡
  const kongwang = getKongWang(bazi)
  analysis.push(`【空亡】${kongwang}`)

  // 五行统计
  const counts = countWuxing(bazi)
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  analysis.push(`【五行力量】${sorted.map(([k, v]) => `${k}:${'●'.repeat(v)}${'○'.repeat(3 - Math.min(v, 3))}(${v})`).join(' ')}`)

  const strongest = sorted[0]
  const weakest = sorted.filter(([, v]) => v === sorted[sorted.length - 1][1]).map(([k]) => k)
  analysis.push(`旺相：${strongest[0]}（${strongest[1]}）；不足：${weakest.join('、')}。`)

  // 身强身弱
  const helpMe = counts[dayWx] + (counts[Object.keys(WUXING_RELATION[dayWx]).find(k => WUXING_RELATION[dayWx][k] === '生我')!] || 0)
  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  let strength = ''
  let yongShen = ''
  if (helpMe >= total * 0.5) {
    strength = '日主偏强'
    const keWo = Object.keys(WUXING_RELATION[dayWx]).find(k => WUXING_RELATION[dayWx][k] === '我克')!
    const woSheng = Object.keys(WUXING_RELATION[dayWx]).find(k => WUXING_RELATION[dayWx][k] === '我生')!
    yongShen = `喜用${keWo}、${woSheng}泄耗，忌${dayWx}及生扶之五行`
  } else if (helpMe <= total * 0.3) {
    strength = '日主偏弱'
    const shengWo = Object.keys(WUXING_RELATION[dayWx]).find(k => WUXING_RELATION[dayWx][k] === '生我')!
    yongShen = `喜用${dayWx}、${shengWo}生扶，忌克泄耗之五行`
  } else {
    strength = '日主中和'
    yongShen = '五行较为均衡，顺势取用即可'
  }
  analysis.push(`【身强身弱】${strength}。${yongShen}。`)

  // 格局简判
  const monthSS = getShishen(dayGan, bazi.month.gan)
  analysis.push(`【格局】月干透「${monthSS}」，初步可论${monthSS}格。${DAYUN_MEANING[monthSS] || ''}`)

  // 纳音
  analysis.push(`【纳音】年命「${bazi.nayin.year}」，日柱「${bazi.nayin.day}」。纳音主一生大象，年命为人之根基。`)

  // 性格简析
  const personality: Record<string, string> = {
    '甲': '如参天大树，正直刚毅，有领导力但略显固执',
    '乙': '如花草藤蔓，柔韧灵活，善于变通但有时优柔',
    '丙': '如太阳光芒，热情开朗，慷慨大方但易冲动',
    '丁': '如烛火星光，温文尔雅，细腻敏感但多思虑',
    '戊': '如高山大地，稳重厚实，诚信可靠但略显迟缓',
    '己': '如田园沃土，包容务实，善于经营但有时多疑',
    '庚': '如刀剑金石，果断刚强，重义气但有时过于强硬',
    '辛': '如珠宝首饰，精致敏锐，有品味但有时过于计较',
    '壬': '如江河大海，智慧奔放，足智多谋但有时不安定',
    '癸': '如雨露溪流，聪慧内敛，善于观察但有时过于被动',
  }
  analysis.push(`【性格特质】日主${dayGan}，${personality[dayGan] || ''}。`)

  // 婚姻感情
  const spousePalace = bazi.day.zhi
  const spouseWx = ZHI_DETAIL[spousePalace]?.wx || ''
  const spouseRelation = WUXING_RELATION[dayWx]?.[spouseWx] || ''
  const marriageHints: Record<string, string> = {
    '同我': '配偶与自己性格相近，容易理解但也容易争执',
    '我生': '自己付出较多，对配偶有奉献精神',
    '我克': '对配偶有掌控欲，男命正财坐日支利婚',
    '克我': '配偶个性强势，对自己有约束力',
    '生我': '配偶对自己帮助大，有依赖感',
  }
  analysis.push(`【婚姻感情】日支${spousePalace}（${spouseWx}），日支为夫妻宫。${marriageHints[spouseRelation] || ''}。`)

  // 事业方向
  const careerByWx: Record<string, string> = {
    '木': '教育、文化、出版、中医、园林、服装、家具',
    '火': '科技、电子、能源、餐饮、传媒、演艺、美容',
    '土': '房地产、建筑、农业、矿业、仓储、殡葬',
    '金': '金融、银行、机械、汽车、五金、法律、军警',
    '水': '物流、航运、旅游、水产、酒类、传播、自由职业',
  }
  const careerWx = Object.keys(WUXING_RELATION[dayWx]).find(k => WUXING_RELATION[dayWx][k] === '我克')!
  const careerWx2 = Object.keys(WUXING_RELATION[dayWx]).find(k => WUXING_RELATION[dayWx][k] === '我生')!
  analysis.push(`【事业方向】喜用五行对应行业：`)
  if (helpMe >= total * 0.5) {
    analysis.push(`　宜从事${careerWx}行业：${careerByWx[careerWx] || ''}`)
    analysis.push(`　或${careerWx2}行业：${careerByWx[careerWx2] || ''}`)
  } else {
    analysis.push(`　宜从事${dayWx}行业：${careerByWx[dayWx] || ''}`)
    const shengWoWx = Object.keys(WUXING_RELATION[dayWx]).find(k => WUXING_RELATION[dayWx][k] === '生我')!
    analysis.push(`　或${shengWoWx}行业：${careerByWx[shengWoWx] || ''}`)
  }

  // 健康提示
  const healthByWx: Record<string, string> = {
    '木': '肝胆、眼睛、筋骨、头部',
    '火': '心脏、小肠、血液、舌',
    '土': '脾胃、肌肉、口腔、消化系统',
    '金': '肺、大肠、皮肤、呼吸系统',
    '水': '肾、膀胱、耳朵、生殖系统',
  }
  analysis.push(`【健康提示】五行${weakest.join('、')}不足，需注意${weakest.map(w => healthByWx[w] || '').join('、')}方面的保养。`)

  // 流年提示
  const currentYear = new Date().getFullYear()
  const ganOrder = '甲乙丙丁戊己庚辛壬癸'
  const zhiOrder = '子丑寅卯辰巳午未申酉戌亥'
  const yearGan = ganOrder[(currentYear - 4) % 10]
  const yearZhi = zhiOrder[(currentYear - 4) % 12]
  const yearSS = getShishen(dayGan, yearGan)
  analysis.push(`【${currentYear}年流年】${yearGan}${yearZhi}年，流年天干为「${yearSS}」。${DAYUN_MEANING[yearSS] || ''}`)

  // 十二长生
  const changSheng = getChangSheng(dayGan, bazi.day.zhi)
  analysis.push(`【十二长生】日干${dayGan}在日支${bazi.day.zhi}为「${changSheng}」。${CHANGSHENG_MEANING[changSheng] || ''}`)

  // 神煞
  const shenSha = getShenSha(bazi)
  if (shenSha.length > 0) {
    analysis.push('【神煞】')
    shenSha.forEach(s => analysis.push(`　${s}`))
  }

  // 大运排列
  const dayun = getDayun(bazi, gender)
  if (dayun.length > 0) {
    analysis.push('【大运】（每步十年）')
    dayun.forEach(d => analysis.push(`　${d}`))
  }

  // 六亲分析
  const liuqin = getLiuqin(dayGan, counts, helpMe >= total * 0.5)
  analysis.push('【六亲关系】')
  liuqin.forEach(l => analysis.push(`　${l}`))

  // 幸运元素
  const luckyColor: Record<string, string> = { '木': '绿色、青色', '火': '红色、紫色', '土': '黄色、棕色', '金': '白色、银色', '水': '黑色、蓝色' }
  const luckyDir: Record<string, string> = { '木': '东方', '火': '南方', '土': '中央', '金': '西方', '水': '北方' }
  const luckyNum: Record<string, string> = { '木': '3、8', '火': '2、7', '土': '5、0', '金': '4、9', '水': '1、6' }
  const yongWx = helpMe >= total * 0.5 ? careerWx : dayWx
  analysis.push(`【幸运元素】`)
  analysis.push(`　幸运颜色：${luckyColor[yongWx] || ''}`)
  analysis.push(`　幸运方位：${luckyDir[yongWx] || ''}`)
  analysis.push(`　幸运数字：${luckyNum[yongWx] || ''}`)

  return analysis
}

// 地支关系
const LIUHE: [string, string, string][] = [
  ['子', '丑', '土'], ['寅', '亥', '木'], ['卯', '戌', '火'],
  ['辰', '酉', '金'], ['巳', '申', '水'], ['午', '未', '火'],
]
const SANHE: [string, string, string, string][] = [
  ['申', '子', '辰', '水'], ['亥', '卯', '未', '木'],
  ['寅', '午', '戌', '火'], ['巳', '酉', '丑', '金'],
]
const SANHUI: [string, string, string, string][] = [
  ['寅', '卯', '辰', '木'], ['巳', '午', '未', '火'],
  ['申', '酉', '戌', '金'], ['亥', '子', '丑', '水'],
]
const LIUCHONG: [string, string][] = [
  ['子', '午'], ['丑', '未'], ['寅', '申'], ['卯', '酉'], ['辰', '戌'], ['巳', '亥'],
]
const XIANGXING: { zhis: string[]; desc: string }[] = [
  { zhis: ['寅', '巳', '申'], desc: '无恩之刑，恩将仇报，人际关系需谨慎' },
  { zhis: ['丑', '未', '戌'], desc: '恃势之刑，仗势欺人或被欺，注意权力关系' },
  { zhis: ['子', '卯'], desc: '无礼之刑，缺乏礼数，感情易生波折' },
]
const ZIXING = ['辰', '午', '酉', '亥']
const XIANGHUI: [string, string][] = [
  ['子', '未'], ['丑', '午'], ['寅', '巳'], ['卯', '辰'], ['申', '亥'], ['酉', '戌'],
]

function analyzeDizhi(bazi: any): string[] {
  const zhis = [bazi.year.zhi, bazi.month.zhi, bazi.day.zhi, bazi.hour.zhi]
  const positions = ['年支', '月支', '日支', '时支']
  const result: string[] = []

  // 六合
  for (const [a, b, wx] of LIUHE) {
    const idxs = zhis.reduce<number[]>((acc, z, i) => (z === a || z === b) ? [...acc, i] : acc, [])
    if (idxs.length >= 2 && zhis.some(z => z === a) && zhis.some(z => z === b)) {
      const posA = positions[zhis.indexOf(a)]
      const posB = positions[zhis.indexOf(b)]
      result.push(`${a}${b}六合化${wx}（${posA}·${posB}）— 合则和顺，主人缘好、贵人助力`)
    }
  }

  // 三合
  for (const [a, b, c, wx] of SANHE) {
    const has = [a, b, c].filter(z => zhis.includes(z))
    if (has.length === 3) {
      result.push(`${a}${b}${c}三合${wx}局 — 三合成局力量大，${wx}五行力量显著增强`)
    } else if (has.length === 2) {
      const missing = [a, b, c].find(z => !zhis.includes(z))!
      result.push(`${has.join('')}半合${wx}局（缺${missing}）— 有合之意但力量不足`)
    }
  }

  // 三会
  for (const [a, b, c, wx] of SANHUI) {
    if ([a, b, c].every(z => zhis.includes(z))) {
      result.push(`${a}${b}${c}三会${wx}局 — 方局力量极强，${wx}气势磅礴`)
    }
  }

  // 六冲
  for (const [a, b] of LIUCHONG) {
    if (zhis.includes(a) && zhis.includes(b)) {
      const posA = positions[zhis.indexOf(a)]
      const posB = positions[zhis.indexOf(b)]
      const chongMeaning: Record<string, string> = {
        '子午': '水火相冲，心肾不交，主奔波变动',
        '丑未': '土土相冲，财库冲开，主财运波动',
        '寅申': '木金相冲，驿马逢冲，主远行变动',
        '卯酉': '木金相冲，桃花逢冲，主感情波折',
        '辰戌': '土土相冲，魁罡逢冲，主刚烈变动',
        '巳亥': '火水相冲，驿马逢冲，主奔波劳碌',
      }
      const key = [a, b].sort().join('')
      const sortedKey = LIUCHONG.find(([x, y]) => (x === a && y === b) || (x === b && y === a))
      const mk = sortedKey ? sortedKey[0] + sortedKey[1] : key
      result.push(`${a}${b}相冲（${posA}·${posB}）— ${chongMeaning[mk] || '冲则动荡，主变化'}`)
    }
  }

  // 相刑
  for (const { zhis: xingZhis, desc } of XIANGXING) {
    const has = xingZhis.filter(z => zhis.includes(z))
    if (has.length >= 2) {
      result.push(`${has.join('')}相刑 — ${desc}`)
    }
  }
  // 自刑
  const selfPunish = ZIXING.filter(z => zhis.filter(x => x === z).length >= 2)
  selfPunish.forEach(z => result.push(`${z}${z}自刑 — 自我矛盾，内心纠结`))

  // 相害
  for (const [a, b] of XIANGHUI) {
    if (zhis.includes(a) && zhis.includes(b)) {
      result.push(`${a}${b}相害 — 暗中损害，防小人暗箭`)
    }
  }

  return result
}

// 空亡
function getKongWang(bazi: any): string {
  const ganOrder = '甲乙丙丁戊己庚辛壬癸'
  const dayGanIdx = ganOrder.indexOf(bazi.day.gan)
  const dayZhiIdx = ZHI_ORDER.indexOf(bazi.day.zhi)
  // 找到本旬首（甲X）的地支index
  const xunStart = (dayZhiIdx - dayGanIdx + 12) % 12
  // 空亡是本旬未覆盖的两个地支
  const kong1 = ZHI_ORDER[(xunStart + 10) % 12]
  const kong2 = ZHI_ORDER[(xunStart + 11) % 12]

  const allZhi = [bazi.year.zhi, bazi.month.zhi, bazi.day.zhi, bazi.hour.zhi]
  const positions = ['年支', '月支', '日支', '时支']
  const hit = allZhi.reduce<string[]>((acc, z, i) => (z === kong1 || z === kong2) ? [...acc, `${positions[i]}${z}`] : acc, [])

  let desc = `日柱空亡为${kong1}、${kong2}。`
  if (hit.length > 0) {
    desc += `${hit.join('、')}落空亡 — 空亡主虚，该宫位所代表的事项有虚象或延迟，但逢冲可填实。`
  } else {
    desc += '四柱无空亡，命局充实。'
  }
  return desc
}

const CHANGSHENG_ORDER = ['长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养']
const CHANGSHENG_MEANING: Record<string, string> = {
  '长生': '如初生婴儿，生机勃勃，万事开头，有贵人扶持',
  '沐浴': '又称败地，多变动、桃花，需防诱惑和不稳定',
  '冠带': '渐入佳境，如人成年加冠，事业开始有起色',
  '临官': '如人做官，事业上升期，有权有势，利考试升迁',
  '帝旺': '最旺之地，精力充沛，事业巅峰，但盛极必衰需谨慎',
  '衰': '由盛转衰，力不从心，宜守成不宜冒进',
  '病': '精力不济，多忧虑，注意健康，宜休养',
  '死': '气绝之象，旧事结束，但也意味着新的开始',
  '墓': '收藏之地，利储蓄、收藏，但行动力不足',
  '绝': '气数已尽，绝处逢生，大破大立之象',
  '胎': '孕育新生，新计划酝酿中，尚未成形',
  '养': '如胎儿在母腹，静待时机，不宜操之过急',
}

// 十二长生起始位置（阳干顺行，阴干逆行）
const CHANGSHENG_START: Record<string, number> = {
  '甲': 0, '丙': 2, '戊': 2, '庚': 4, '壬': 8, // 阳干长生位
  '乙': 6, '丁': 10, '己': 10, '辛': 0, '癸': 4, // 阴干长生位
}
const ZHI_ORDER = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

function getChangSheng(dayGan: string, zhi: string): string {
  const start = CHANGSHENG_START[dayGan]
  if (start === undefined) return ''
  const zhiIdx = ZHI_ORDER.indexOf(zhi)
  if (zhiIdx < 0) return ''
  const isYang = '甲丙戊庚壬'.includes(dayGan)
  let offset = isYang ? (zhiIdx - start + 12) % 12 : (start - zhiIdx + 12) % 12
  return CHANGSHENG_ORDER[offset]
}

function getShenSha(bazi: any): string[] {
  const result: string[] = []
  const dayGan = bazi.day.gan
  const yearZhi = bazi.year.zhi

  // 天乙贵人
  const tianyiMap: Record<string, string[]> = {
    '甲': ['丑', '未'], '戊': ['丑', '未'], '庚': ['丑', '未'],
    '乙': ['子', '申'], '己': ['子', '申'],
    '丙': ['亥', '酉'], '丁': ['亥', '酉'],
    '壬': ['卯', '巳'], '癸': ['卯', '巳'],
    '辛': ['午', '寅'],
  }
  const tianyiZhis = tianyiMap[dayGan] || []
  const allZhi = [bazi.year.zhi, bazi.month.zhi, bazi.day.zhi, bazi.hour.zhi]
  if (allZhi.some((z: string) => tianyiZhis.includes(z))) {
    result.push('天乙贵人 — 逢凶化吉，贵人运强，遇难有人相助')
  }

  // 文昌
  const wenchangMap: Record<string, string> = { '甲': '巳', '乙': '午', '丙': '申', '丁': '酉', '戊': '申', '己': '酉', '庚': '亥', '辛': '子', '壬': '寅', '癸': '卯' }
  if (allZhi.includes(wenchangMap[dayGan])) {
    result.push('文昌贵人 — 利学业考试，聪明好学，文采出众')
  }

  // 驿马
  const yimaMap: Record<string, string> = { '寅': '申', '午': '申', '戌': '申', '申': '寅', '子': '寅', '辰': '寅', '巳': '亥', '酉': '亥', '丑': '亥', '亥': '巳', '卯': '巳', '未': '巳' }
  if (allZhi.includes(yimaMap[yearZhi])) {
    result.push('驿马 — 主奔波变动，利出行、迁移、外地发展')
  }

  // 桃花
  const taohuaMap: Record<string, string> = { '寅': '卯', '午': '卯', '戌': '卯', '申': '酉', '子': '酉', '辰': '酉', '巳': '午', '酉': '午', '丑': '午', '亥': '子', '卯': '子', '未': '子' }
  if (allZhi.includes(taohuaMap[yearZhi])) {
    result.push('桃花（咸池） — 主人缘、异性缘旺，有魅力，但需防烂桃花')
  }

  // 华盖
  const huagaiMap: Record<string, string> = { '寅': '戌', '午': '戌', '戌': '戌', '申': '辰', '子': '辰', '辰': '辰', '巳': '丑', '酉': '丑', '丑': '丑', '亥': '未', '卯': '未', '未': '未' }
  if (allZhi.includes(huagaiMap[yearZhi])) {
    result.push('华盖 — 主聪明孤高，利宗教、艺术、哲学，有超凡脱俗之气')
  }

  // 天德
  const tiandeMap: Record<string, string> = { '寅': '丁', '卯': '申', '辰': '壬', '巳': '辛', '午': '亥', '未': '甲', '申': '癸', '酉': '寅', '戌': '丙', '亥': '乙', '子': '巳', '丑': '庚' }
  const monthZhi = bazi.month.zhi
  const allGan = [bazi.year.gan, bazi.month.gan, bazi.day.gan, bazi.hour.gan]
  if (allGan.includes(tiandeMap[monthZhi]) || allZhi.includes(tiandeMap[monthZhi])) {
    result.push('天德贵人 — 逢凶化吉，一生少灾祸，有福德庇佑')
  }

  // 月德
  const yuedeMap: Record<string, string> = { '寅': '丙', '午': '丙', '戌': '丙', '申': '壬', '子': '壬', '辰': '壬', '巳': '庚', '酉': '庚', '丑': '庚', '亥': '甲', '卯': '甲', '未': '甲' }
  if (allGan.includes(yuedeMap[monthZhi])) {
    result.push('月德贵人 — 为人慈善，一生平安少祸，有阴德')
  }

  if (result.length === 0) {
    result.push('命中神煞不显，平稳之象')
  }
  return result
}

function getDayun(bazi: any, gender?: 'male' | 'female'): string[] {
  const ganOrder = '甲乙丙丁戊己庚辛壬癸'
  const monthGanIdx = ganOrder.indexOf(bazi.month.gan)
  const monthZhiIdx = ZHI_ORDER.indexOf(bazi.month.zhi)
  if (monthGanIdx < 0 || monthZhiIdx < 0) return []

  const dayGan = bazi.day.gan
  const yearGan = bazi.year.gan
  const isYangYear = '甲丙戊庚壬'.includes(yearGan)
  const isMale = gender !== 'female'
  // 阳年男命/阴年女命顺行，阴年男命/阳年女命逆行
  const forward = (isYangYear && isMale) || (!isYangYear && !isMale)
  const dir = forward ? 1 : -1

  const result: string[] = []
  result.push(`　（${isMale ? '男' : '女'}命·${isYangYear ? '阳' : '阴'}年·${forward ? '顺行' : '逆行'}）`)
  for (let i = 1; i <= 8; i++) {
    const gIdx = ((monthGanIdx + i * dir) % 10 + 10) % 10
    const zIdx = ((monthZhiIdx + i * dir) % 12 + 12) % 12
    const gan = ganOrder[gIdx]
    const zhi = ZHI_ORDER[zIdx]
    const ss = getShishen(dayGan, gan)
    const age = i * 10
    result.push(`第${i}步（${age - 9}~${age}岁）：${gan}${zhi} — ${ss}运。${DAYUN_MEANING[ss] || ''}`)
  }
  return result
}

function getLiuqin(dayGan: string, counts: Record<string, number>, isStrong: boolean): string[] {
  const dayWx = WUXING_GAN[dayGan]
  const result: string[] = []
  const shengWo = Object.keys(WUXING_RELATION[dayWx]).find(k => WUXING_RELATION[dayWx][k] === '生我')!
  const woSheng = Object.keys(WUXING_RELATION[dayWx]).find(k => WUXING_RELATION[dayWx][k] === '我生')!
  const woKe = Object.keys(WUXING_RELATION[dayWx]).find(k => WUXING_RELATION[dayWx][k] === '我克')!
  const keWo = Object.keys(WUXING_RELATION[dayWx]).find(k => WUXING_RELATION[dayWx][k] === '克我')!

  const strength = (wx: string) => {
    const c = counts[wx] || 0
    if (c >= 3) return '旺相，关系密切有力'
    if (c >= 1) return '中和，关系平稳'
    return '衰弱，缘分较薄需多经营'
  }

  result.push(`父母（${shengWo}）：${strength(shengWo)}`)
  result.push(`兄弟朋友（${dayWx}）：${strength(dayWx)}`)
  result.push(`子女（${woSheng}）：${strength(woSheng)}`)
  result.push(`配偶/财（${woKe}）：${strength(woKe)}`)
  result.push(`事业/官（${keWo}）：${strength(keWo)}`)
  return result
}
