import { useState } from 'react'
import { getLocalNatalAnalysis, getLocalTarot, getLocalNumerology } from '../utils/astro-api'

interface Props {
  birthInput: { year: number; month: number; day: number; hour: number } | null
}

export function WesternAstro({ birthInput }: Props) {
  const [results, setResults] = useState<{ title: string; lines: string[] }[]>(() => {
    if (birthInput) {
      return [{ title: '星座分析', lines: getLocalNatalAnalysis(birthInput.year, birthInput.month, birthInput.day, birthInput.hour) }]
    }
    return []
  })

  const add = (title: string, lines: string[]) => {
    setResults(prev => [...prev, { title, lines }])
  }

  return (
    <div className="result-card">
      <h3>西方占星 · 塔罗 · 数字命理</h3>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {birthInput && (
          <>
            <button className="btn-secondary" onClick={() => add('星座分析', getLocalNatalAnalysis(birthInput.year, birthInput.month, birthInput.day, birthInput.hour))}>🌟 星座</button>
            <button className="btn-secondary" onClick={() => add('数字命理', getLocalNumerology(birthInput.year, birthInput.month, birthInput.day))}>🔢 数字命理</button>
          </>
        )}
        <button className="btn-secondary" onClick={() => add('塔罗牌阵', getLocalTarot())}>🃏 塔罗</button>
      </div>

      {results.map((r, i) => (
        <div key={i} className="analysis" style={{ marginTop: 12 }}>
          <h4>{r.title}</h4>
          {r.lines.map((line, j) => <p key={j}>{line}</p>)}
        </div>
      ))}

      {results.length > 0 && (
        <button className="btn-secondary" onClick={() => setResults([])} style={{ marginTop: 12 }}>清除结果</button>
      )}

      {!birthInput && results.length === 0 && (
        <p style={{ color: 'var(--muted)', textAlign: 'center' }}>
          输入生辰后可解锁星座和数字命理，或直接使用塔罗
        </p>
      )}
    </div>
  )
}
