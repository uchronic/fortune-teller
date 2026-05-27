import { analyzeBazi } from '../utils/analysis'

interface Props {
  bazi: {
    year: { gan: string; zhi: string }
    month: { gan: string; zhi: string }
    day: { gan: string; zhi: string }
    hour: { gan: string; zhi: string }
    lunar: { year: string; month: string; day: string }
    zodiac: string
    nayin: { year: string; month: string; day: string; hour: string }
  }
  gender: 'male' | 'female'
}

export function BaziCard({ bazi, gender }: Props) {
  const pillars = [
    { label: '年柱', ...bazi.year, nayin: bazi.nayin.year },
    { label: '月柱', ...bazi.month, nayin: bazi.nayin.month },
    { label: '日柱', ...bazi.day, nayin: bazi.nayin.day },
    { label: '时柱', ...bazi.hour, nayin: bazi.nayin.hour },
  ]
  const analysis = analyzeBazi(bazi, gender)

  return (
    <div className="result-card">
      <h3>八字命盘</h3>
      <p className="sub-info">
        农历{bazi.lunar.year}年{bazi.lunar.month}月{bazi.lunar.day} · 属{bazi.zodiac}
      </p>
      <div className="bazi-grid">
        {pillars.map(p => (
          <div key={p.label} className="pillar">
            <span className="pillar-label">{p.label}</span>
            <span className="pillar-gan">{p.gan}</span>
            <span className="pillar-zhi">{p.zhi}</span>
            <span className="pillar-nayin">{p.nayin}</span>
          </div>
        ))}
      </div>
      <div className="analysis">
        <h4>命理解析</h4>
        {analysis.map((line, i) => <p key={i}>{line}</p>)}
      </div>
    </div>
  )
}
