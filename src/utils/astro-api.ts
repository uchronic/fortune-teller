// 本地命理计算（西方占星 / 塔罗 / 数字命理）
// 纯前端实现，不依赖任何外部 API。
//
// 历史说明：早期版本曾内置 astrology-api.io 的远程调用层，但 UI 从未实际
// 使用，且把 API key 硬编码进了源码。已整体移除，仅保留下面的本地算法。

export interface AstroInput {
  name: string
  year: number
  month: number
  day: number
  hour: number
  minute: number
  city: string
  countryCode: string
}

export function getLocalNatalAnalysis(year: number, month: number, day: number, hour: number): string[] {
  const signs = [
    { name: '摩羯座', en: 'Capricorn', start: [1,1], end: [1,19], element: '土', ruler: '土星', trait: '务实稳重、有责任感、目标明确' },
    { name: '水瓶座', en: 'Aquarius', start: [1,20], end: [2,18], element: '风', ruler: '天王星', trait: '独立创新、人道主义、思维超前' },
    { name: '双鱼座', en: 'Pisces', start: [2,19], end: [3,20], element: '水', ruler: '海王星', trait: '敏感直觉、富有同情心、想象力丰富' },
    { name: '白羊座', en: 'Aries', start: [3,21], end: [4,19], element: '火', ruler: '火星', trait: '勇敢冲动、开拓精神、行动力强' },
    { name: '金牛座', en: 'Taurus', start: [4,20], end: [5,20], element: '土', ruler: '金星', trait: '稳定踏实、享受生活、重视物质安全' },
    { name: '双子座', en: 'Gemini', start: [5,21], end: [6,21], element: '风', ruler: '水星', trait: '聪明善变、好奇心强、沟通能力佳' },
    { name: '巨蟹座', en: 'Cancer', start: [6,22], end: [7,22], element: '水', ruler: '月亮', trait: '重感情、顾家、情绪敏感、保护欲强' },
    { name: '狮子座', en: 'Leo', start: [7,23], end: [8,22], element: '火', ruler: '太阳', trait: '自信大方、领导力强、热情慷慨' },
    { name: '处女座', en: 'Virgo', start: [8,23], end: [9,22], element: '土', ruler: '水星', trait: '细致完美、分析力强、注重健康' },
    { name: '天秤座', en: 'Libra', start: [9,23], end: [10,23], element: '风', ruler: '金星', trait: '追求平衡、审美力强、善于社交' },
    { name: '天蝎座', en: 'Scorpio', start: [10,24], end: [11,22], element: '水', ruler: '冥王星', trait: '深沉专注、洞察力强、意志坚定' },
    { name: '射手座', en: 'Sagittarius', start: [11,23], end: [12,21], element: '火', ruler: '木星', trait: '乐观自由、追求真理、热爱冒险' },
    { name: '摩羯座', en: 'Capricorn', start: [12,22], end: [12,31], element: '土', ruler: '土星', trait: '务实稳重、有责任感、目标明确' },
  ]

  const sunSign = signs.find(s => {
    const afterStart = month > s.start[0] || (month === s.start[0] && day >= s.start[1])
    const beforeEnd = month < s.end[0] || (month === s.end[0] && day <= s.end[1])
    return afterStart && beforeEnd
  }) || signs[0]

  // 月亮星座（简化估算：基于出生日期的月相周期）
  const moonIdx = (year + month * 2 + day + Math.floor(hour / 6)) % 12
  const moonSigns = ['白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座', '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座']
  const moonSign = moonSigns[moonIdx]

  // 上升星座（简化估算：基于出生时间）
  const ascIdx = (Math.floor((hour + 4) / 2) + signs.findIndex(s => s.name === sunSign.name)) % 12
  const ascSign = moonSigns[ascIdx]

  const lines: string[] = []
  lines.push('【太阳星座】')
  lines.push(`　${sunSign.name}（${sunSign.en}）`)
  lines.push(`　元素：${sunSign.element}象 | 守护星：${sunSign.ruler}`)
  lines.push(`　核心特质：${sunSign.trait}`)
  lines.push('')
  lines.push('【月亮星座】（情感与内在）')
  lines.push(`　${moonSign}`)
  lines.push(`　月亮代表内心情感需求、潜意识反应模式和安全感来源。`)
  lines.push('')
  lines.push('【上升星座】（外在表现）')
  lines.push(`　${ascSign}`)
  lines.push(`　上升代表他人对你的第一印象、外在行为模式和人生方向。`)
  lines.push('')

  const elementMeaning: Record<string, string> = {
    '火': '充满热情与行动力，喜欢挑战和冒险，但需注意耐心',
    '土': '务实稳重，注重物质安全和实际成果，但需避免过于保守',
    '风': '思维活跃，善于沟通和社交，但需注意深度和专注',
    '水': '情感丰富，直觉敏锐，富有同理心，但需注意情绪管理',
  }
  lines.push('【元素能量】')
  lines.push(`　太阳${sunSign.element}象：${elementMeaning[sunSign.element]}`)
  lines.push('')

  const retrograde = year % 3 === 0 ? '水星' : year % 3 === 1 ? '金星' : '火星'
  lines.push('【年度行星提示】')
  lines.push(`　出生年${retrograde}能量突出，在相关领域（${retrograde === '水星' ? '沟通、学习、旅行' : retrograde === '金星' ? '感情、审美、财运' : '行动力、竞争、勇气'}）有特殊课题。`)
  lines.push('')
  lines.push('注：月亮和上升星座为简化估算，精确计算需要出生地经纬度。')

  return lines
}

const TAROT_MAJOR = [
  { name: '愚者', up: '新的开始、冒险、自由、无限可能', down: '鲁莽、不计后果、迷失方向' },
  { name: '魔术师', up: '创造力、技能、意志力、自信', down: '欺骗、操控、才能浪费' },
  { name: '女祭司', up: '直觉、潜意识、内在智慧、神秘', down: '隐藏的真相、忽视直觉、表面化' },
  { name: '女皇', up: '丰收、母性、创造、自然之美', down: '依赖、过度保护、创造力枯竭' },
  { name: '皇帝', up: '权威、结构、控制、父性力量', down: '专制、僵化、过度控制' },
  { name: '教皇', up: '传统、信仰、指导、精神追求', down: '教条、盲从、挑战权威' },
  { name: '恋人', up: '爱情、和谐、选择、价值观', down: '失衡、不和谐、错误选择' },
  { name: '战车', up: '意志力、胜利、决心、行动', down: '失控、攻击性、方向不明' },
  { name: '力量', up: '勇气、耐心、内在力量、慈悲', down: '自我怀疑、软弱、缺乏信心' },
  { name: '隐士', up: '内省、独处、智慧、寻找真理', down: '孤立、逃避、过度封闭' },
  { name: '命运之轮', up: '转折、机遇、命运、周期变化', down: '厄运、抗拒变化、失控' },
  { name: '正义', up: '公正、真相、因果、平衡', down: '不公、偏见、逃避责任' },
  { name: '倒吊人', up: '牺牲、新视角、等待、放下', down: '拖延、无谓牺牲、固执' },
  { name: '死神', up: '结束、转变、新生、放下过去', down: '抗拒改变、停滞、恐惧' },
  { name: '节制', up: '平衡、耐心、调和、中庸之道', down: '失衡、过度、缺乏耐心' },
  { name: '恶魔', up: '束缚、欲望、物质主义、阴影面', down: '解脱、面对恐惧、打破枷锁' },
  { name: '塔', up: '突变、觉醒、破旧立新、真相揭露', down: '逃避灾难、恐惧改变、延迟崩塌' },
  { name: '星星', up: '希望、灵感、宁静、信心', down: '失望、缺乏信心、与灵性断联' },
  { name: '月亮', up: '幻觉、潜意识、恐惧、直觉', down: '走出迷雾、克服恐惧、真相大白' },
  { name: '太阳', up: '成功、喜悦、活力、光明', down: '暂时受挫、过度乐观、虚荣' },
  { name: '审判', up: '觉醒、重生、召唤、自我评估', down: '自我怀疑、逃避审视、拒绝成长' },
  { name: '世界', up: '完成、圆满、成就、新循环', down: '未完成、缺乏收尾、停滞不前' },
]

export function getLocalTarot(): string[] {
  const lines: string[] = []
  const drawn: number[] = []
  while (drawn.length < 3) {
    const idx = Math.floor(Math.random() * TAROT_MAJOR.length)
    if (!drawn.includes(idx)) drawn.push(idx)
  }
  const positions = ['过去（影响当下的根源）', '现在（当前的状态）', '未来（发展的趋势）']
  drawn.forEach((idx, i) => {
    const card = TAROT_MAJOR[idx]
    const reversed = Math.random() > 0.5
    lines.push(`【${positions[i]}】`)
    lines.push(`　${card.name}（${reversed ? '逆位' : '正位'}）`)
    lines.push(`　${reversed ? card.down : card.up}`)
    lines.push('')
  })
  lines.push('提示：塔罗反映当下能量状态，非固定命运。心诚则灵，三月内同一问题不宜反复占卜。')
  return lines
}

export function getLocalNumerology(year: number, month: number, day: number): string[] {
  const reduce = (n: number): number => {
    while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
      n = String(n).split('').reduce((a, b) => a + +b, 0)
    }
    return n
  }
  const lifePath = reduce(reduce(year) + reduce(month) + reduce(day))
  const birthday = reduce(day)

  const meanings: Record<number, string> = {
    1: '领导者、独立、开创、自信。适合创业或独当一面的工作',
    2: '合作者、敏感、外交、和谐。适合团队协作和调解',
    3: '表达者、创意、乐观、社交。适合艺术、写作、演讲',
    4: '建设者、务实、稳定、勤奋。适合工程、管理、规划',
    5: '自由者、变化、冒险、多才。适合旅行、销售、媒体',
    6: '照顾者、责任、家庭、美感。适合教育、医疗、设计',
    7: '思考者、分析、灵性、内省。适合研究、哲学、技术',
    8: '成就者、权力、财富、野心。适合商业、金融、管理',
    9: '人道者、智慧、慈悲、完成。适合公益、艺术、教育',
    11: '直觉大师、灵感、理想主义。高度敏感，有精神领袖潜质',
    22: '建筑大师、远见、实践力。能将宏大愿景落地为现实',
    33: '疗愈大师、无私奉献、教导。以爱和智慧服务他人',
  }

  const lines: string[] = []
  lines.push('【生命路径数】')
  lines.push(`　数字：${lifePath}`)
  lines.push(`　含义：${meanings[lifePath] || meanings[reduce(lifePath)] || ''}`)
  lines.push('')
  lines.push('【生日数】')
  lines.push(`　数字：${birthday}`)
  lines.push(`　含义：${meanings[birthday] || meanings[reduce(birthday)] || ''}`)
  lines.push('')

  const personalYear = reduce(reduce(month) + reduce(day) + reduce(new Date().getFullYear()))
  const pyMeaning: Record<number, string> = {
    1: '新周期开始，适合启动新项目、做重大决定',
    2: '耐心等待期，适合合作、培养关系',
    3: '自我表达年，社交活跃，创意涌现',
    4: '打基础年，努力工作，建立稳固结构',
    5: '变动年，可能有搬迁、旅行、重大转变',
    6: '家庭责任年，关注家人、感情、健康',
    7: '内省年，适合学习、研究、灵性成长',
    8: '收获年，事业财运有突破，权力增长',
    9: '完成年，结束旧事物，为新周期做准备',
  }
  lines.push('【个人年数】')
  lines.push(`　${new Date().getFullYear()}年个人年数：${personalYear}`)
  lines.push(`　${pyMeaning[personalYear] || pyMeaning[reduce(personalYear)] || ''}`)

  return lines
}
