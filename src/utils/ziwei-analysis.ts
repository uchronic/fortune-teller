const STAR_MEANINGS: Record<string, string> = {
  '紫微': '帝星。主尊贵、领导力、自尊心强。为人大方有气度，但有时过于自我。',
  '天机': '智慧星。主聪明善变、思维敏捷。善于策划分析，但有时想太多而犹豫不决。',
  '太阳': '光明星。主贵人运、名声、父亲缘。性格开朗热情，乐于助人，但有时过于操劳。',
  '武曲': '财星。主财富、刚毅、决断力。适合金融、管理类工作，但有时过于刚硬。',
  '天同': '福星。主安逸、温和、享受。心态乐观知足，但有时缺乏进取心。',
  '廉贞': '桃花星。主感情丰富、才艺、政治。多才多艺但情绪起伏大。',
  '天府': '库星。主稳重、财库、保守。理财能力强，为人稳健可靠。',
  '太阴': '富星。主财富、细腻、母亲缘。性格温柔内敛，有艺术天赋。',
  '贪狼': '欲望星。主才艺、桃花、多才多艺。兴趣广泛，社交能力强，但有时贪多嚼不烂。',
  '巨门': '暗星。主口才、是非、研究。善于分析辩论，适合律师、教师，但易招口舌。',
  '天相': '印星。主贵人、辅佐、衣食。为人正派有礼，适合幕僚参谋类角色。',
  '天梁': '荫星。主长辈缘、化解、医药。有逢凶化吉之力，适合医疗、公益。',
  '七杀': '将星。主魄力、冲劲、变动。做事果断有魄力，适合创业、军警。',
  '破军': '耗星。主变动、开创、破旧立新。不安于现状，喜欢挑战，但人生波动大。',
}

const PALACE_MEANINGS: Record<string, string> = {
  '命宫': '一生总论，性格、外貌、才能',
  '兄弟': '兄弟姐妹、朋友、合伙人关系',
  '夫妻': '婚姻感情、配偶特质',
  '子女': '子女缘分、性生活、创作力',
  '财帛': '财运、理财方式、收入来源',
  '疾厄': '健康状况、灾厄、体质',
  '迁移': '外出运、旅行、外地发展',
  '交友': '社交圈、下属、人际关系',
  '官禄': '事业、工作、学业、地位',
  '田宅': '不动产、家庭环境、居住',
  '福德': '精神生活、兴趣爱好、福气',
  '父母': '父母缘、长辈、文书运',
}

export function analyzeZiwei(ziwei: any): string[] {
  if (!ziwei?.palaces) return ['命盘数据不完整']
  const analysis: string[] = []

  // 五行局
  if (ziwei.fiveElementsClass) {
    analysis.push(`【五行局】${ziwei.fiveElementsClass}。五行局决定起运年龄和命盘能量基调。`)
  }

  // 命宫详解
  const mingPalace = ziwei.palaces.find((p: any) => p.name === '命宫')
  if (mingPalace) {
    const majors = (mingPalace.majorStars || []).map((s: any) => s.name.replace(/[^一-龥]/g, ''))
    if (majors.length > 0) {
      analysis.push(`【命宫主星】${majors.join('、')}坐命`)
      majors.forEach((star: string) => {
        if (STAR_MEANINGS[star]) {
          analysis.push(`　★${star}：${STAR_MEANINGS[star]}`)
        }
      })
    } else {
      analysis.push('【命宫】无主星坐命，借对宫迁移宫星曜论命。性格较为多变，受环境影响大。')
    }
  }

  // 全部12宫位分析
  const allPalaceNames = ['官禄', '财帛', '夫妻', '子女', '福德', '疾厄', '迁移', '交友', '兄弟', '田宅', '父母']
  allPalaceNames.forEach(name => {
    const palace = ziwei.palaces.find((p: any) => p.name === name)
    if (palace?.majorStars?.length) {
      const stars = palace.majorStars.map((s: any) => s.name.replace(/[^一-龥]/g, ''))
      const starInfo = stars.map((s: string) => STAR_MEANINGS[s] ? `${s}` : s).join('、')
      analysis.push(`【${name}宫】${starInfo}坐守。${PALACE_MEANINGS[name] || ''}。`)
      stars.forEach((star: string) => {
        if (STAR_MEANINGS[star]) {
          analysis.push(`　★${star}在${name}：${getStarInPalace(star, name)}`)
        }
      })
    } else if (palace) {
      analysis.push(`【${name}宫】无主星，借对宫星曜论断。${PALACE_MEANINGS[name] || ''}。`)
    }
  })

  // 命盘格局
  const allMajors = ziwei.palaces.flatMap((p: any) => (p.majorStars || []).map((s: any) => ({ star: s.name.replace(/[^一-龥]/g, ''), palace: p.name })))
  const patterns = detectPatterns(allMajors)
  if (patterns.length > 0) {
    analysis.push('【格局】')
    patterns.forEach(p => analysis.push(`　${p}`))
  }

  // 四化分析
  const sihua = analyzeSihua(ziwei)
  if (sihua.length > 0) {
    analysis.push('【四化分析】')
    sihua.forEach(s => analysis.push(`　${s}`))
  }

  // 大限走势
  const daXian = analyzeDaXian(ziwei)
  if (daXian.length > 0) {
    analysis.push('【大限走势】（每十年一限）')
    daXian.forEach(d => analysis.push(`　${d}`))
  }

  // 流年简析
  const liuNian = analyzeLiuNian(ziwei)
  if (liuNian.length > 0) {
    analysis.push('【流年简析】')
    liuNian.forEach(l => analysis.push(`　${l}`))
  }

  return analysis
}

function getStarInPalace(star: string, palace: string): string {
  const combos: Record<string, Record<string, string>> = {
    '紫微': { '官禄': '权威显赫，适合管理、领导岗位', '财帛': '财运亨通，善于理财投资', '夫妻': '配偶条件优越，但自尊心强需互相尊重', '福德': '精神富足，有品味追求', '疾厄': '体质尚可，注意心脏血压', '迁移': '外出发展有贵人提携，适合异地创业', '交友': '朋友层次高，社交圈优质', '兄弟': '兄弟中有出色者，手足情深', '田宅': '居住环境优越，利置产', '子女': '子女优秀有出息', '父母': '父母有地位，家教严格' },
    '武曲': { '官禄': '事业心强，适合金融、技术领域', '财帛': '正财运佳，靠实力赚钱', '夫妻': '配偶务实能干，但感情较为理性', '福德': '物质享受好，但精神压力大', '疾厄': '注意呼吸系统、筋骨', '迁移': '外出利财，适合经商', '交友': '朋友务实，利合作', '兄弟': '兄弟间有竞争但互助', '田宅': '利不动产投资', '子女': '子女独立能干', '父母': '父母严厉，家教重实际' },
    '天同': { '官禄': '工作轻松但升迁较慢', '财帛': '财来财去，不善积蓄', '夫妻': '感情和谐温馨', '福德': '知足常乐，晚年享福', '疾厄': '体质偏弱，注意肠胃', '迁移': '外出安逸，不喜奔波', '交友': '人缘好，朋友多', '兄弟': '兄弟和睦，互相关爱', '田宅': '居家舒适，重享受', '子女': '子女乖巧温顺', '父母': '父母慈爱，家庭温暖' },
    '太阳': { '官禄': '利公职、名声、海外发展', '财帛': '财运起伏，利名不利财', '夫妻': '男命利妻，女命利夫', '福德': '热心公益，操劳但快乐', '疾厄': '注意眼睛、头部、血压', '迁移': '外出有名声，利海外', '交友': '朋友众多，乐于助人', '兄弟': '兄弟有成就，互相扶持', '田宅': '住所光线好，利阳宅', '子女': '子女活泼开朗', '父母': '父亲有能力，父缘好' },
    '贪狼': { '官禄': '多才多艺，适合演艺、销售、公关', '财帛': '偏财运好，善于投机', '夫妻': '桃花旺，感情丰富多彩', '福德': '兴趣广泛，享乐主义', '疾厄': '注意肝胆、泌尿系统', '迁移': '外出多应酬，社交活跃', '交友': '酒肉朋友多，需辨真伪', '兄弟': '兄弟各有才艺', '田宅': '居家讲究品味', '子女': '子女聪明多才', '父母': '父母有才艺或桃花' },
    '七杀': { '官禄': '事业波动大但有大成就可能', '财帛': '财运起伏，大进大出', '夫妻': '感情波折多，配偶个性强', '福德': '内心不安定，追求刺激', '疾厄': '注意外伤、手术', '迁移': '外出奔波劳碌但有成', '交友': '朋友个性强，有助力也有冲突', '兄弟': '兄弟间竞争激烈', '田宅': '居所多变动', '子女': '子女个性强，管教不易', '父母': '与父母关系有压力' },
    '天机': { '官禄': '适合策划、顾问、技术类工作', '财帛': '善于理财规划但不宜投机', '夫妻': '配偶聪明但多思虑', '福德': '思维活跃，兴趣多变', '疾厄': '注意神经系统、肝胆', '迁移': '适合流动性工作', '交友': '朋友聪明但关系多变', '兄弟': '兄弟聪明各有主见', '田宅': '居所常有变动', '子女': '子女聪慧', '父母': '父母开明，重教育' },
    '太阴': { '官禄': '适合文职、艺术、夜间工作', '财帛': '财运稳定，利储蓄', '夫妻': '配偶温柔体贴', '福德': '内心平静，有艺术修养', '疾厄': '注意眼睛、肾脏', '迁移': '利夜间外出，适合安静环境', '交友': '朋友温和，知心者少', '兄弟': '姐妹缘好', '田宅': '居家整洁优雅', '子女': '女儿缘好', '父母': '母亲缘深，母亲有才' },
    '廉贞': { '官禄': '适合政治、法律、公关', '财帛': '财运起伏，有偏财', '夫妻': '感情复杂，桃花多', '福德': '情绪起伏大，多愁善感', '疾厄': '注意心脏、血液', '迁移': '外出多是非', '交友': '朋友复杂，需慎选', '兄弟': '兄弟间感情复杂', '田宅': '居所有纠纷之象', '子女': '子女感情丰富', '父母': '与父母关系有波折' },
    '天府': { '官禄': '事业稳健，适合管理、金融', '财帛': '财库丰盈，善于守财', '夫妻': '配偶稳重可靠', '福德': '生活安逸，物质丰富', '疾厄': '体质较好，注意脾胃', '迁移': '外出平稳，利守不利攻', '交友': '朋友可靠，贵人多', '兄弟': '兄弟稳重互助', '田宅': '不动产丰厚', '子女': '子女稳重踏实', '父母': '父母富裕，家境好' },
    '巨门': { '官禄': '适合律师、教师、研究', '财帛': '靠口才技术赚钱', '夫妻': '口舌多，需多沟通', '福德': '多思多虑，精神压力大', '疾厄': '注意口腔、肠胃', '迁移': '外出多口舌是非', '交友': '朋友间易有误会', '兄弟': '兄弟间有口角', '田宅': '居所有邻里纠纷', '子女': '子女伶牙俐齿', '父母': '与父母沟通需耐心' },
    '天相': { '官禄': '适合辅佐、秘书、公务员', '财帛': '财运平稳，有贵人助', '夫妻': '配偶正派有礼', '福德': '生活有规律，重礼节', '疾厄': '注意皮肤、泌尿', '迁移': '外出有贵人', '交友': '朋友正派，互相尊重', '兄弟': '兄弟有礼有节', '田宅': '居所整洁有序', '子女': '子女有教养', '父母': '父母重教育礼仪' },
    '天梁': { '官禄': '适合医疗、公益、教育', '财帛': '不重财但不缺财', '夫妻': '配偶年长或成熟', '福德': '有宗教缘，心态豁达', '疾厄': '逢凶化吉，大病化小', '迁移': '外出有长辈贵人', '交友': '朋友中长辈多', '兄弟': '兄弟中有年长者照顾', '田宅': '祖产丰厚', '子女': '子女孝顺', '父母': '父母长寿，缘分深' },
    '破军': { '官禄': '事业多变动，适合开创性工作', '财帛': '财来财去，大起大落', '夫妻': '感情波折，婚姻多变', '福德': '不安于现状，喜新厌旧', '疾厄': '注意外伤、手术', '迁移': '外出奔波，变动频繁', '交友': '朋友来去匆匆', '兄弟': '兄弟各奔东西', '田宅': '居所多搬迁', '子女': '子女叛逆独立', '父母': '与父母缘薄，早独立' },
  }
  return combos[star]?.[palace] || `${star}在${palace}宫，需结合四化和其他星曜综合论断。`
}

function detectPatterns(stars: { star: string; palace: string }[]): string[] {
  const patterns: string[] = []
  const mingStars = stars.filter(s => s.palace === '命宫').map(s => s.star)

  if (mingStars.includes('紫微') && mingStars.includes('天府')) patterns.push('紫府同宫：大富大贵之格，一生顺遂。')
  if (mingStars.includes('紫微') && mingStars.includes('贪狼')) patterns.push('紫贪同宫：才华横溢，桃花旺盛，中年后发。')
  if (mingStars.includes('紫微') && mingStars.includes('七杀')) patterns.push('紫杀同宫：权威霸气，适合创业或军警。')
  if (mingStars.includes('武曲') && mingStars.includes('天府')) patterns.push('武府同宫：财官双美，理财能力极强。')
  if (mingStars.includes('太阳') && mingStars.includes('太阴')) patterns.push('日月同宫：阴阳调和，聪明但多思。')
  if (mingStars.includes('廉贞') && mingStars.includes('七杀')) patterns.push('廉杀同宫：性格刚烈，事业心极强，波动大。')
  if (mingStars.includes('武曲') && mingStars.includes('贪狼')) patterns.push('武贪同宫：经商有道，中年发迹，利武职。')
  if (mingStars.includes('天机') && mingStars.includes('太阴')) patterns.push('机月同梁格：适合公职、大企业，稳定发展。')
  if (mingStars.includes('太阳') && mingStars.includes('巨门')) patterns.push('日巨同宫：口才出众，利传播、教育、法律。')
  if (mingStars.includes('天同') && mingStars.includes('天梁')) patterns.push('同梁同宫：福寿双全，利医疗、宗教。')
  if (mingStars.includes('廉贞') && mingStars.includes('天府')) patterns.push('廉府同宫：政商两宜，有领导才能。')
  if (mingStars.includes('武曲') && mingStars.includes('七杀')) patterns.push('武杀同宫：刚毅果断，利军警、外科。')

  const careerStars = stars.filter(s => s.palace === '官禄').map(s => s.star)
  if (careerStars.includes('紫微')) patterns.push('紫微在官禄：天生领导者，仕途光明。')
  if (careerStars.includes('武曲')) patterns.push('武曲在官禄：财经领域大有可为。')
  if (careerStars.includes('太阳')) patterns.push('太阳在官禄：利公职、名声远播。')
  if (careerStars.includes('天机')) patterns.push('天机在官禄：适合策划、技术、研究。')

  const wealthStars = stars.filter(s => s.palace === '财帛').map(s => s.star)
  if (wealthStars.includes('武曲')) patterns.push('武曲在财帛：正财格，理财能力强。')
  if (wealthStars.includes('天府')) patterns.push('天府在财帛：财库丰盈，善于守财。')
  if (wealthStars.includes('贪狼')) patterns.push('贪狼在财帛：偏财运好，利投机。')

  return patterns
}

function analyzeSihua(ziwei: any): string[] {
  const result: string[] = []
  if (!ziwei?.palaces) return result

  const huaTypes = ['化禄', '化权', '化科', '化忌']
  const huaMeaning: Record<string, string> = {
    '化禄': '主财禄、顺利、人缘好',
    '化权': '主权力、掌控、积极进取',
    '化科': '主名声、贵人、考试顺利',
    '化忌': '主阻碍、执着、是非困扰',
  }

  for (const palace of ziwei.palaces) {
    const allStars = [...(palace.majorStars || []), ...(palace.minorStars || [])]
    for (const star of allStars) {
      for (const hua of huaTypes) {
        if (star.name?.includes(hua)) {
          const starName = star.name.replace(/[化禄权科忌]/g, '').replace(/[^一-龥]/g, '')
          result.push(`${starName}${hua}在${palace.name}宫 — ${huaMeaning[hua]}。对${PALACE_MEANINGS[palace.name] || palace.name}方面影响明显。`)
        }
      }
    }
  }
  if (result.length === 0) {
    result.push('四化星分布均匀，无特别集中之宫位。')
  }
  return result
}

function analyzeDaXian(ziwei: any): string[] {
  const result: string[] = []
  if (!ziwei?.palaces) return result

  // 大限按宫位顺序走，每十年一限
  for (let i = 0; i < 6 && i < ziwei.palaces.length; i++) {
    const palace = ziwei.palaces[i]
    const stars = (palace.majorStars || []).map((s: any) => s.name.replace(/[^一-龥]/g, '')).filter((s: string) => s)
    const startAge = (i + 1) * 10 - 9
    const endAge = (i + 1) * 10
    const starStr = stars.length > 0 ? stars.join('、') : '无主星'
    result.push(`第${i + 1}限（${startAge}~${endAge}岁）走${palace.name}宫：${starStr}。${getDaXianHint(palace.name, stars)}`)
  }
  return result
}

function getDaXianHint(palace: string, _stars: string[]): string {
  const hints: Record<string, string> = {
    '命宫': '自我意识强，人生方向明确',
    '兄弟': '人际关系活跃，合作机会多',
    '夫妻': '感情婚姻为重心',
    '子女': '子女缘或创作力旺盛',
    '财帛': '财运为主轴，利求财',
    '疾厄': '注意健康，宜养生',
    '迁移': '变动多，利外出发展',
    '交友': '社交活跃，贵人或小人并存',
    '官禄': '事业上升期，利升迁',
    '田宅': '利置产、家庭事务',
    '福德': '精神生活丰富，利修行',
    '父母': '长辈缘重，利学习',
  }
  return hints[palace] || ''
}

function analyzeLiuNian(ziwei: any): string[] {
  const result: string[] = []
  const currentYear = new Date().getFullYear()
  const zhiOrder = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
  const yearZhi = zhiOrder[(currentYear - 4) % 12]

  if (!ziwei?.palaces) return result

  // 流年宫位 = 流年地支所在宫位
  const liuNianPalace = ziwei.palaces.find((p: any) => {
    const branch = p.earthlyBranch || p.branch || ''
    return branch.includes(yearZhi)
  })

  if (liuNianPalace) {
    const stars = (liuNianPalace.majorStars || []).map((s: any) => s.name.replace(/[^一-龥]/g, '')).filter((s: string) => s)
    result.push(`${currentYear}年流年走${liuNianPalace.name}宫（${yearZhi}）`)
    if (stars.length > 0) {
      result.push(`主星：${stars.join('、')}`)
      stars.forEach((star: string) => {
        if (STAR_MEANINGS[star]) {
          result.push(`　${star}：${STAR_MEANINGS[star].split('。')[0]}`)
        }
      })
    }
    result.push(`流年重点：${PALACE_MEANINGS[liuNianPalace.name] || '综合运势'}`)
  } else {
    result.push(`${currentYear}年（${yearZhi}年）：整体运势平稳，无特别冲击。`)
  }
  return result
}
