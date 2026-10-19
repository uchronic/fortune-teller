import { useEffect, useState } from 'react'
import { BirthForm } from './components/BirthForm'
import { BaziCard } from './components/BaziCard'
import { ZiweiCard } from './components/ZiweiCard'
import { LiuyaoCard } from './components/LiuyaoCard'
import { WesternAstro } from './components/WesternAstro'
import { Chenggu, Compatibility, ErrorMessage, Knowledge, TaskResult, TimeTool } from './components/Tools'
import { getZiwei, type BirthInput } from './utils/fortune'
import { calculate, listenToEngine } from './utils/mlss'
import { toMlssChart } from './utils/ziwei-adapter'
import { loadHistory, saveHistory, removeHistory, describeEntry, type HistoryEntry } from './utils/history'
import './app.css'
import './mlss.css'
const tabs=[['input','排盘'],['bazi','八字'],['ziwei','紫微'],['chenggu','称骨'],['liuyao','六爻'],['meihua','梅花'],['qimen','奇门'],['calendar','黄历'],['compatibility','合盘'],['knowledge','知识'],['western','占星']] as const
type Tab=typeof tabs[number][0]
export default function App() {
  const [tab,setTab]=useState<Tab>('input'),[reading,setReading]=useState<any>(null),[ziwei,setZiwei]=useState<any>(null),[chart,setChart]=useState<any>(null)
  const [birthInput,setBirthInput]=useState<BirthInput|null>(null),[history,setHistory]=useState<HistoryEntry[]>(()=>loadHistory())
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[stage,setStage]=useState('')
  useEffect(()=>listenToEngine(setStage),[])
  const runChart=async(input:BirthInput)=>{
    setBusy(true);setError('')
    try {
      const result=await calculate('birth',input), normalized={...result.effectiveInput,sect:input.sect}
      const pan=getZiwei(normalized)
      setReading(result);setBirthInput(normalized);setZiwei(pan);setChart(toMlssChart(pan,normalized));setHistory(saveHistory(input));setTab('bazi')
    } catch(e) {setError(e instanceof Error?e.message:'排盘失败，请检查输入')}
    finally {setBusy(false)}
  }
  const download=()=>{
    const blob=new Blob([JSON.stringify({version:'1.5.0',input:birthInput,reading,ziwei:chart},null,2)],{type:'application/json'})
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='命理深算-命盘.json';a.click();URL.revokeObjectURL(url)
  }
  const needsBirth=['bazi','ziwei','chenggu'].includes(tab)&&!reading
  return <div className="app">
    <header className="masthead"><button className="brand" onClick={()=>setTab('input')} aria-label="命理深算首页"><span className="brand-mark">☯</span><span>命理深算<small>MLSS · 洛玉衡</small></span></button><span className="edition">壹点伍 · 2026</span></header>
    <section className="intro"><span className="eyebrow">古法为经 · 历算为纬</span><h1>知其所来，<br/><em>从容而行。</em></h1><p>八字与紫微观命局，梅花与奇门察时变。<br className="desktop-break"/>一处排盘，一览古籍，让每一次推演有据可循。</p><span className="privacy-note">生辰在浏览器内计算 · 历史仅保存在本机</span></section>
    <nav className="tool-nav" aria-label="命理工具">{tabs.map(([id,label])=><button key={id} className={tab===id?'active':''} aria-current={tab===id?'page':undefined} onClick={()=>{setTab(id);setError('')}}>{label}</button>)}</nav>
    <main id="main-content">
      {error&&<ErrorMessage error={error}/>}
      {busy&&<p className="loading" role="status">{stage||'正在排盘…'}</p>}
      {(tab==='input'||needsBirth)&&<><BirthForm busy={busy} onSubmit={runChart}/>{history.length>0&&<section className="history-card"><h3>最近命盘</h3><ul className="history-list">{history.map(e=><li key={e.id}><button disabled={busy} className="history-item" onClick={()=>runChart(e.input)}>{describeEntry(e)}</button><button className="history-del" aria-label={`删除 ${describeEntry(e)}`} onClick={()=>setHistory(removeHistory(e.id))}>×</button></li>)}</ul></section>}<div className="quick-links"><button onClick={()=>setTab('meihua')}>梅花时间起卦 <span>↗</span></button><button onClick={()=>setTab('calendar')}>查看黄历吉时 <span>↗</span></button><button onClick={()=>setTab('knowledge')}>检索古籍选文 <span>↗</span></button></div></>}
      {tab==='bazi'&&reading&&<BaziCard reading={reading}/>}
      {tab==='ziwei'&&chart&&<TaskResult action="ziwei" payload={{chart}}>{notes=><ZiweiCard ziwei={ziwei} chart={chart} notes={notes}/>}</TaskResult>}
      {tab==='chenggu'&&reading&&<Chenggu reading={reading}/>}
      {tab==='liuyao'&&<LiuyaoCard/>}
      {['meihua','qimen','calendar'].includes(tab)&&<TimeTool key={tab} kind={tab as 'meihua'|'qimen'|'calendar'}/>}
      {tab==='compatibility'&&<Compatibility first={birthInput}/>}
      {tab==='knowledge'&&<Knowledge/>}
      {tab==='western'&&<WesternAstro birthInput={birthInput}/>}
      {reading&&tab!=='input'&&<div className="actions"><button className="btn-secondary" onClick={()=>setTab('input')}>重新排盘</button><button className="btn-secondary" onClick={download}>保存命盘</button></div>}
    </main>
    <footer><span>命理乃趋势，非定数。</span><small>MLSS 1.5.0 · 2026-10-19 同步<br/>传统术数与文化研究</small><a href="https://github.com/uchronic/fortune-teller" target="_blank" rel="noreferrer">项目源码 ↗</a></footer>
  </div>
}
