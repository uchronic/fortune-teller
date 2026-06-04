import { useState } from 'react'
import { getLiuyao, interpretLiuyao } from '../utils/fortune'

const GUA_64: Record<string, { name: string; judgment: string; image: string }> = {
  '乾乾': { name: '乾为天', judgment: '元亨利贞。大吉大利，利于坚守正道。', image: '天行健，君子以自强不息。' },
  '坤坤': { name: '坤为地', judgment: '元亨，利牝马之贞。柔顺包容，厚德载物。', image: '地势坤，君子以厚德载物。' },
  '坎坎': { name: '坎为水', judgment: '习坎，有孚维心亨。险中求通，诚信可济。', image: '水洊至，君子以常德行，习教事。' },
  '离离': { name: '离为火', judgment: '利贞亨，畜牝牛吉。光明附丽，柔顺则吉。', image: '明两作，大人以继明照于四方。' },
  '震震': { name: '震为雷', judgment: '亨，震来虩虩。虽有惊恐，终得安泰。', image: '洊雷，君子以恐惧修省。' },
  '巽巽': { name: '巽为风', judgment: '小亨，利有攸往。谦逊柔顺，渐进有利。', image: '随风，君子以申命行事。' },
  '艮艮': { name: '艮为山', judgment: '艮其背，不获其身。适时止步，静以修身。', image: '兼山，君子以思不出其位。' },
  '兑兑': { name: '兑为泽', judgment: '亨利贞。喜悦和谐，以正为本。', image: '丽泽，君子以朋友讲习。' },
  '乾兑': { name: '天泽履', judgment: '履虎尾，不咥人亨。谨慎行事，虽险无害。', image: '上天下泽，君子以辨上下。' },
  '乾离': { name: '天火同人', judgment: '同人于野，亨。志同道合，利涉大川。', image: '天与火，君子以类族辨物。' },
  '坤震': { name: '地雷复', judgment: '亨，出入无疾。一阳来复，万象更新。', image: '雷在地中，先王以至日闭关。' },
  '坤坎': { name: '地水师', judgment: '贞丈人吉。统率有方，纪律严明则吉。', image: '地中有水，君子以容民畜众。' },
  '震坤': { name: '雷地豫', judgment: '利建侯行师。顺时而动，众人欢悦。', image: '雷出地奋，先王以作乐崇德。' },
  '坎坤': { name: '水地比', judgment: '吉，原筮元永贞。亲近辅佐，诚信相交。', image: '地上有水，先王以建万国亲诸侯。' },
  '巽乾': { name: '风天小畜', judgment: '亨，密云不雨。小有积蓄，尚需等待。', image: '风行天上，君子以懿文德。' },
  '离乾': { name: '火天大有', judgment: '元亨。盛大丰有，光明正大。', image: '火在天上，君子以遏恶扬善。' },
  '兑乾': { name: '泽天夬', judgment: '扬于王庭。果断决策，以正胜邪。', image: '泽上于天，君子以施禄及下。' },
  '乾坤': { name: '天地否', judgment: '否之匪人。天地不交，闭塞不通，宜守待变。', image: '天地不交，君子以俭德辟难。' },
  '坤乾': { name: '地天泰', judgment: '小往大来，吉亨。天地交泰，万事亨通。', image: '天地交，后以财成天地之道。' },
  '坎艮': { name: '水山蹇', judgment: '利西南。前路艰难，宜退守等待。', image: '山上有水，君子以反身修德。' },
  '艮坎': { name: '山水蒙', judgment: '亨，匪我求童蒙。启蒙教化，循序渐进。', image: '山下出泉，君子以果行育德。' },
  '离坎': { name: '火水未济', judgment: '亨，小狐汔济。事未成就，仍需努力。', image: '火在水上，君子以慎辨物居方。' },
  '坎离': { name: '水火既济', judgment: '亨小利贞。事已成就，宜守不宜进。', image: '水在火上，君子以思患而预防之。' },
  '乾坎': { name: '天水讼', judgment: '有孚窒惕，中吉。争讼之事，宜和解不宜强争。', image: '天与水违行，君子以作事谋始。' },
  '坎乾': { name: '水天需', judgment: '有孚，光亨贞吉。等待时机，诚信则通。', image: '云上于天，君子以饮食宴乐。' },
  '乾震': { name: '天雷无妄', judgment: '元亨利贞。顺应天道，不可妄为。', image: '天下雷行，先王以茂对时育万物。' },
  '震乾': { name: '雷天大壮', judgment: '利贞。阳气壮盛，利于正道。', image: '雷在天上，君子以非礼弗履。' },
  '乾巽': { name: '天风姤', judgment: '女壮，勿用取女。偶然相遇，不宜深交。', image: '天下有风，后以施命诰四方。' },
  '巽坤': { name: '风地观', judgment: '盥而不荐。观察形势，以德服人。', image: '风行地上，先王以省方观民设教。' },
  '坤巽': { name: '地风升', judgment: '元亨。循序渐进，步步高升。', image: '地中生木，君子以顺德积小以高大。' },
  '艮乾': { name: '山天大畜', judgment: '利贞。大有积蓄，利于守正。', image: '天在山中，君子以多识前言往行。' },
  '乾艮': { name: '天山遁', judgment: '亨小利贞。退避隐遁，以退为进。', image: '天下有山，君子以远小人。' },
  '离坤': { name: '火地晋', judgment: '康侯用锡马蕃庶。光明上进，受到赏识。', image: '明出地上，君子以自昭明德。' },
  '坤离': { name: '地火明夷', judgment: '利艰贞。光明受损，韬光养晦。', image: '明入地中，君子以莅众用晦而明。' },
  '兑坎': { name: '泽水困', judgment: '亨贞大人吉。困境中守正，终能脱困。', image: '泽无水，君子以致命遂志。' },
  '坎兑': { name: '水泽节', judgment: '亨，苦节不可贞。节制有度，过犹不及。', image: '泽上有水，君子以制数度议德行。' },
  '震坎': { name: '雷水解', judgment: '利西南。困难解除，宜宽容待人。', image: '雷雨作，君子以赦过宥罪。' },
  '坎震': { name: '水雷屯', judgment: '元亨利贞。创业维艰，坚持则通。', image: '云雷，君子以经纶。' },
  '巽坎': { name: '风水涣', judgment: '亨，王假有庙。涣散之象，宜聚不宜散。', image: '风行水上，先王以享于帝立庙。' },
  '坎巽': { name: '水风井', judgment: '改邑不改井。根基稳固，利民利己。', image: '木上有水，君子以劳民劝相。' },
  '震艮': { name: '雷山小过', judgment: '亨利贞。小事可为，大事不宜。', image: '山上有雷，君子以行过乎恭。' },
  '艮震': { name: '山雷颐', judgment: '贞吉。慎言节食，养正则吉。', image: '山下有雷，君子以慎言语节饮食。' },
  '兑巽': { name: '泽风大过', judgment: '栋桡，利有攸往。非常之时，行非常之事。', image: '泽灭木，君子以独立不惧。' },
  '巽兑': { name: '风泽中孚', judgment: '豚鱼吉。诚信感化，无往不利。', image: '泽上有风，君子以议狱缓死。' },
  '离震': { name: '火雷噬嗑', judgment: '亨，利用狱。明断是非，果断处理。', image: '雷电，先王以明罚敕法。' },
  '震离': { name: '雷火丰', judgment: '亨，王假之。丰盛之时，宜大不宜小。', image: '雷电皆至，君子以折狱致刑。' },
  '离巽': { name: '火风鼎', judgment: '元吉亨。革故鼎新，大业可成。', image: '木上有火，君子以正位凝命。' },
  '巽离': { name: '风火家人', judgment: '利女贞。家道正则天下定。', image: '风自火出，君子以言有物而行有恒。' },
  '兑艮': { name: '泽山咸', judgment: '亨利贞。感应相通，利于婚姻。', image: '山上有泽，君子以虚受人。' },
  '艮兑': { name: '山泽损', judgment: '有孚元吉。减损自己，利益他人。', image: '山下有泽，君子以惩忿窒欲。' },
  '巽震': { name: '风雷益', judgment: '利有攸往。增益之时，利于行动。', image: '风雷，君子以见善则迁有过则改。' },
  '震巽': { name: '雷风恒', judgment: '亨无咎利贞。持之以恒，始终如一。', image: '雷风，君子以立不易方。' },
  '离艮': { name: '火山旅', judgment: '小亨，旅贞吉。旅途之中，谨慎则吉。', image: '山上有火，君子以明慎用刑。' },
  '艮离': { name: '山火贲', judgment: '亨，小利有攸往。文饰之美，内实为要。', image: '山下有火，君子以明庶政。' },
  '兑离': { name: '泽火革', judgment: '己日乃孚。变革之时，顺天应人。', image: '泽中有火，君子以治历明时。' },
  '离兑': { name: '火泽睽', judgment: '小事吉。乖离之象，小事可为。', image: '上火下泽，君子以同而异。' },
  '坤艮': { name: '地山谦', judgment: '亨，君子有终。谦虚受益，满招损。', image: '地中有山，君子以裒多益寡。' },
  '艮坤': { name: '山地剥', judgment: '不利有攸往。剥落之时，宜静不宜动。', image: '山附于地，上以厚下安宅。' },
  '坤兑': { name: '地泽临', judgment: '元亨利贞。居高临下，亲民利物。', image: '泽上有地，君子以教思无穷。' },
  '兑坤': { name: '泽地萃', judgment: '亨，王假有庙。聚集之象，利于团结。', image: '泽上于地，君子以除戎器戒不虞。' },
  '震兑': { name: '雷泽归妹', judgment: '征凶，无攸利。婚嫁之象，需守本分。', image: '泽上有雷，君子以永终知敝。' },
  '兑震': { name: '泽雷随', judgment: '元亨利贞。随顺时势，灵活应变。', image: '泽中有雷，君子以向晦入宴息。' },
}

function getLiuqinForGua(wx: string): { parents: string; siblings: string; children: string; wealth: string; officer: string } {
  const relations: Record<string, { parents: string; siblings: string; children: string; wealth: string; officer: string }> = {
    '金': { parents: '土', siblings: '金', children: '水', wealth: '木', officer: '火' },
    '木': { parents: '水', siblings: '木', children: '火', wealth: '土', officer: '金' },
    '水': { parents: '金', siblings: '水', children: '木', wealth: '火', officer: '土' },
    '火': { parents: '木', siblings: '火', children: '土', wealth: '金', officer: '水' },
    '土': { parents: '火', siblings: '土', children: '金', wealth: '水', officer: '木' },
  }
  return relations[wx] || { parents: '?', siblings: '?', children: '?', wealth: '?', officer: '?' }
}

function getGuaAnalysis(upper: string, lower: string, lines: number[]): string[] {
  const key = upper + lower
  const gua = GUA_64[key]
  const analysis: string[] = []

  if (gua) {
    analysis.push(`【本卦】${gua.name}`)
    analysis.push(`【卦辞】${gua.judgment}`)
    analysis.push(`【象曰】${gua.image}`)
  } else {
    analysis.push(`【本卦】上${upper}下${lower}`)
  }

  // 变卦
  const changing = lines.filter(l => l === 6 || l === 9)
  if (changing.length > 0) {
    const changedLines = lines.map(l => {
      if (l === 9) return 8 // 老阳变阴
      if (l === 6) return 7 // 老阴变阳
      return l
    })
    const newLower = ((changedLines[0] % 2) << 0) | ((changedLines[1] % 2) << 1) | ((changedLines[2] % 2) << 2)
    const newUpper = ((changedLines[3] % 2) << 0) | ((changedLines[4] % 2) << 1) | ((changedLines[5] % 2) << 2)
    const BAGUA = ['坤', '震', '坎', '兑', '艮', '离', '巽', '乾']
    const newKey = BAGUA[newUpper] + BAGUA[newLower]
    const bianGua = GUA_64[newKey]
    if (bianGua) {
      analysis.push(`【变卦】${bianGua.name}`)
      analysis.push(`【变卦辞】${bianGua.judgment}`)
    }
  }

  // 动爻详解
  if (changing.length === 0) {
    analysis.push('【动爻】六爻皆静，以本卦卦辞断之。事态稳定，按现状发展，短期内不会有大变化。')
  } else if (changing.length === 1) {
    const idx = lines.findIndex(l => l === 6 || l === 9)
    const yaoPos = ['初', '二', '三', '四', '五', '上'][idx]
    const yaoMeaning: Record<number, string> = {
      0: '初爻动：事情刚起步，根基在变，宜谨慎打基础。初爻为地基，动则根基不稳，需先稳固后方可进取',
      1: '二爻动：内部调整，家庭或内心有变化。二爻为宅爻，主家宅、内部事务，动则家中有事',
      2: '三爻动：内外交界，面临选择和转折。三爻为人爻之下，进退两难之位，需果断抉择',
      3: '四爻动：接近核心，贵人或机会将至。四爻为近君之位，动则有贵人提携或重要机遇',
      4: '五爻动：君位动，大事将成或大变将至。五爻为君位，动则大局有变，吉则大吉凶则大凶',
      5: '上爻动：事已至极，物极必反，宜收不宜进。上爻为终极之位，动则事物走向终结或转化',
    }
    analysis.push(`【动爻】${yaoPos}爻动。${yaoMeaning[idx]}。`)
    analysis.push(`　以动爻爻辞为主断，变卦为事情最终走向。`)
  } else {
    analysis.push(`【动爻】有${changing.length}个动爻，变化较多。`)
    lines.forEach((l, i) => {
      if (l === 6 || l === 9) {
        analysis.push(`　${['初', '二', '三', '四', '五', '上'][i]}爻动（${l === 9 ? '阳变阴' : '阴变阳'}）`)
      }
    })
    analysis.push('　多爻齐动，局势复杂多变，宜静观其变，不宜仓促决定。')
  }

  // 世应分析
  analysis.push(`【世应】世爻代表自己，应爻代表对方/事物。世应相生则顺，相克则有阻碍。`)

  // 六亲配置
  const guaWuxing: Record<string, string> = { '乾': '金', '兑': '金', '离': '火', '震': '木', '巽': '木', '坎': '水', '艮': '土', '坤': '土' }
  const upperWx = guaWuxing[upper] || ''
  const lowerWx = guaWuxing[lower] || ''
  const guaMainWx = upperWx // 以上卦五行为本卦属性
  if (guaMainWx) {
    const liuqinMap = getLiuqinForGua(guaMainWx)
    analysis.push('【六亲配置】')
    analysis.push(`　父母爻（生我者）：属${liuqinMap.parents}，主文书、长辈、庇护`)
    analysis.push(`　兄弟爻（同我者）：属${liuqinMap.siblings}，主竞争、朋友、破财`)
    analysis.push(`　子孙爻（我生者）：属${liuqinMap.children}，主福德、子女、解忧`)
    analysis.push(`　妻财爻（我克者）：属${liuqinMap.wealth}，主财运、妻子、收益`)
    analysis.push(`　官鬼爻（克我者）：属${liuqinMap.officer}，主事业、丈夫、灾祸`)
  }

  // 用神分析
  analysis.push('【用神提示】')
  analysis.push('　问事业：以官鬼爻为用神，旺则事业顺遂')
  analysis.push('　问财运：以妻财爻为用神，旺则财源广进')
  analysis.push('　问婚姻：男以妻财为用，女以官鬼为用')
  analysis.push('　问健康：以子孙爻为用神（药），官鬼为病')
  analysis.push('　问考试：以父母爻为用神，旺则金榜题名')

  // 五行生克
  if (upperWx && lowerWx) {
    const wxRelations: Record<string, Record<string, string>> = {
      '金': { '金': '比和', '木': '克下', '水': '生下', '火': '被克', '土': '被生' },
      '木': { '木': '比和', '土': '克下', '火': '生下', '金': '被克', '水': '被生' },
      '水': { '水': '比和', '火': '克下', '木': '生下', '土': '被克', '金': '被生' },
      '火': { '火': '比和', '金': '克下', '土': '生下', '水': '被克', '木': '被生' },
      '土': { '土': '比和', '水': '克下', '金': '生下', '木': '被克', '火': '被生' },
    }
    const rel = wxRelations[upperWx]?.[lowerWx] || ''
    const relMeaning: Record<string, string> = {
      '比和': '上下同心，事情顺利',
      '克下': '外强内弱，有压制之象',
      '生下': '外助内，有贵人相助',
      '被克': '内克外，内部力量制约发展',
      '被生': '内生外，自身有能力向外拓展',
    }
    analysis.push(`【五行】上卦${upper}属${upperWx}，下卦${lower}属${lowerWx}。${rel}：${relMeaning[rel] || ''}。`)
  }

  // 综合建议
  const yangCount = lines.filter(l => l % 2 === 1).length
  analysis.push('【综合断语】')
  if (yangCount >= 5) {
    analysis.push('　阳气极盛，刚健有力。利于果断行动、开拓新局。但需防刚过易折，适当柔和。')
  } else if (yangCount >= 4) {
    analysis.push('　阳气旺盛，利于主动出击、开拓进取。时机已到，宜把握机会。')
  } else if (yangCount === 3) {
    analysis.push('　阴阳均衡，顺势而为。不偏不倚，中庸之道为上策。')
  } else if (yangCount >= 1) {
    analysis.push('　阴气偏重，宜守不宜攻。韬光养晦，静待时机成熟再动。')
  } else {
    analysis.push('　纯阴之卦，万物收藏。宜休养生息，积蓄力量，切勿妄动。')
  }

  // 时间提示
  const timeHint: Record<string, string> = {
    '乾': '应期在戌亥之时（秋冬之交）',
    '坤': '应期在未申之时（夏秋之交）',
    '震': '应期在卯辰之时（春季）',
    '巽': '应期在辰巳之时（春夏之交）',
    '坎': '应期在子丑之时（冬季）',
    '离': '应期在午未之时（夏季）',
    '艮': '应期在丑寅之时（冬春之交）',
    '兑': '应期在酉戌之时（秋季）',
  }
  if (timeHint[upper]) {
    analysis.push(`【应期】以上卦论，${timeHint[upper]}。`)
  }

  return analysis
}

export function LiuyaoCard() {
  const [result, setResult] = useState<ReturnType<typeof interpretLiuyao> | null>(null)

  const shake = () => {
    const lines = getLiuyao()
    setResult(interpretLiuyao(lines))
  }

  return (
    <div className="result-card">
      <h3>六爻占卜</h3>
      {!result ? (
        <div className="liuyao-prompt">
          <p>心中默念所问之事</p>
          <button className="btn-primary" onClick={shake}>🪙 摇卦</button>
        </div>
      ) : (
        <div className="liuyao-result">
          <p className="gua-name">上卦：{result.upperGua} · 下卦：{result.lowerGua}</p>
          <div className="yao-list">
            {result.lineNames.map((name, i) => (
              <div key={i} className="yao-row">
                <span className="yao-name">{name}</span>
                <span className="yao-symbol">
                  {result.lines[i] % 2 === 1
                    ? <span className="yang-yao">━━━━━</span>
                    : <span className="yin-yao">━━　━━</span>
                  }
                </span>
                <span className="yao-type">{result.lineTypes[i]}</span>
              </div>
            ))}
          </div>
          <div className="analysis">
            <h4>卦象解析</h4>
            {getGuaAnalysis(result.upperGua, result.lowerGua, result.lines).map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
          <button className="btn-secondary" onClick={shake}>重新摇卦</button>
        </div>
      )}
    </div>
  )
}
