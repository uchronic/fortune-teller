import { analyzeZiwei } from '../utils/ziwei-analysis'

interface Props {
  ziwei: any
}

const PALACE_ORDER = [
  '命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄',
  '迁移', '交友', '官禄', '田宅', '福德', '父母'
]

export function ZiweiCard({ ziwei }: Props) {
  const palaces = ziwei?.palaces || []
  const analysis = analyzeZiwei(ziwei)

  return (
    <div className="result-card">
      <h3>紫微斗数命盘</h3>
      {ziwei?.fiveElementsClass && (
        <p className="sub-info">五行局：{ziwei.fiveElementsClass}</p>
      )}
      <div className="ziwei-grid">
        {palaces.slice(0, 12).map((p: any, i: number) => (
          <div key={i} className="palace">
            <span className="palace-name">{p.name || PALACE_ORDER[i]}</span>
            <span className="palace-branch">{p.earthlyBranch}</span>
            <div className="palace-stars">
              {(p.majorStars || []).map((s: any) => (
                <span key={s.name} className="star major">{s.name}</span>
              ))}
              {(p.minorStars || []).slice(0, 3).map((s: any) => (
                <span key={s.name} className="star minor">{s.name}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="analysis">
        <h4>命盘解读</h4>
        {analysis.map((line, i) => <p key={i}>{line}</p>)}
      </div>
    </div>
  )
}
