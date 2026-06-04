import { useState } from 'react'
import { BirthForm } from './components/BirthForm'
import { BaziCard } from './components/BaziCard'
import { ZiweiCard } from './components/ZiweiCard'
import { LiuyaoCard } from './components/LiuyaoCard'
import { WesternAstro } from './components/WesternAstro'
import { getZiwei, getBazi, type BirthInput } from './utils/fortune'
import { loadHistory, saveHistory, removeHistory, describeEntry, type HistoryEntry } from './utils/history'
import './app.css'

type Tab = 'input' | 'bazi' | 'ziwei' | 'liuyao' | 'western'

export default function App() {
  const [tab, setTab] = useState<Tab>('input')
  const [bazi, setBazi] = useState<any>(null)
  const [ziwei, setZiwei] = useState<any>(null)
  const [birthInput, setBirthInput] = useState<BirthInput | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory())

  const runChart = (input: BirthInput) => {
    setBazi(getBazi(input))
    setZiwei(getZiwei(input))
    setBirthInput(input)
    setTab('bazi')
  }

  const handleSubmit = (input: BirthInput) => {
    try {
      runChart(input)
      setHistory(saveHistory(input))
    } catch (e) {
      alert('排盘出错，请检查日期是否正确')
    }
  }

  const restore = (entry: HistoryEntry) => {
    try {
      runChart(entry.input)
      setHistory(saveHistory(entry.input)) // 提到最前
    } catch {
      alert('该命盘恢复失败，可能数据已损坏')
    }
  }

  const forget = (id: string) => setHistory(removeHistory(id))

  const share = () => {
    if (navigator.share) {
      navigator.share({ title: '命理深算 - 我的命盘', url: location.href })
    } else {
      navigator.clipboard.writeText(location.href)
      alert('链接已复制，发给朋友看看吧')
    }
  }

  return (
    <div className="app">
      <header>
        <h1 onClick={() => setTab('input')}>☯ 命理深算</h1>
        <p className="tagline">紫微斗数 · 八字命理 · 六爻占卜 · 西方占星</p>
      </header>

      {tab === 'input' && (
        <>
          <BirthForm onSubmit={handleSubmit} />
          <div style={{ textAlign: 'center', color: 'var(--muted)', margin: '16px 0' }}>— 或直接占卜 —</div>
          <button className="btn-primary" onClick={() => setTab('liuyao')}>🪙 六爻摇卦</button>

          {history.length > 0 && (
            <div className="history-card">
              <h3>最近命盘</h3>
              <ul className="history-list">
                {history.map(e => (
                  <li key={e.id}>
                    <button className="history-item" onClick={() => restore(e)}>
                      {describeEntry(e)}
                    </button>
                    <button className="history-del" title="删除" onClick={() => forget(e.id)}>✕</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {tab !== 'input' && (
        <>
          <nav className="tabs">
            <button className={tab === 'bazi' ? 'active' : ''} onClick={() => setTab('bazi')}>八字</button>
            <button className={tab === 'ziwei' ? 'active' : ''} onClick={() => setTab('ziwei')}>紫微</button>
            <button className={tab === 'western' ? 'active' : ''} onClick={() => setTab('western')}>占星</button>
            <button className={tab === 'liuyao' ? 'active' : ''} onClick={() => setTab('liuyao')}>六爻</button>
          </nav>

          {tab === 'bazi' && bazi && <BaziCard bazi={bazi} gender={birthInput!.gender} />}
          {tab === 'ziwei' && ziwei && <ZiweiCard ziwei={ziwei} />}
          {tab === 'western' && <WesternAstro birthInput={birthInput} />}
          {tab === 'liuyao' && <LiuyaoCard />}

          <div className="actions">
            <button className="btn-secondary" onClick={() => setTab('input')}>重新排盘</button>
            <button className="btn-primary" onClick={share}>分享给朋友</button>
          </div>
        </>
      )}

      <footer>仙风道骨 · 命理乃趋势非定数</footer>
    </div>
  )
}
