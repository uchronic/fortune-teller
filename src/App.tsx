import { useState } from 'react'
import { BirthForm } from './components/BirthForm'
import { BaziCard } from './components/BaziCard'
import { ZiweiCard } from './components/ZiweiCard'
import { LiuyaoCard } from './components/LiuyaoCard'
import { WesternAstro } from './components/WesternAstro'
import { getZiwei, getBazi, type BirthInput } from './utils/fortune'
import './app.css'

type Tab = 'input' | 'bazi' | 'ziwei' | 'liuyao' | 'western'

export default function App() {
  const [tab, setTab] = useState<Tab>('input')
  const [bazi, setBazi] = useState<any>(null)
  const [ziwei, setZiwei] = useState<any>(null)
  const [birthInput, setBirthInput] = useState<BirthInput | null>(null)

  const handleSubmit = (input: BirthInput) => {
    try {
      setBazi(getBazi(input))
      setZiwei(getZiwei(input))
      setBirthInput(input)
      setTab('bazi')
    } catch (e) {
      alert('排盘出错，请检查日期是否正确')
    }
  }

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
