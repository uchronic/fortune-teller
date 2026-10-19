import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { calculate } from '../utils/mlss'
import { BirthForm } from './BirthForm'
import type { BirthInput } from '../utils/fortune'
export function ErrorMessage({error}:{error:string}) { return <p className="error" role="alert">{error.split('\n').filter(Boolean).at(-1)}</p> }
export function TaskResult({action,payload,children}:{action:string;payload:unknown;children:(data:any)=>ReactNode}) {
  const [state,setState]=useState<{data?:any;error?:string}>({}), signature=JSON.stringify(payload)
  useEffect(()=>{let live=true;setState({});calculate(action,JSON.parse(signature)).then(data=>{if(live)setState({data})}).catch(e=>{if(live)setState({error:e.message})});return()=>{live=false}},[action,signature])
  if(state.error)return <ErrorMessage error={state.error}/>
  return state.data?children(state.data):<p className="loading" role="status">正在推演，请稍候…</p>
}
function TimePicker({onChange,label}:{onChange:(input:BirthInput)=>void;label:string}) {
  const now=new Date(Date.now()+8*3600000)
  return <form className="time-picker" onSubmit={e=>{e.preventDefault();const value=String(new FormData(e.currentTarget).get('moment'));const [date,time]=value.split('T');const [year,month,day]=date.split('-').map(Number);const [hour,minute]=time.split(':').map(Number);onChange({year,month,day,hour,minute,gender:'male'})}}><label>{label}<input required type="datetime-local" min="1900-01-01T00:00" max="2100-12-31T23:59" name="moment" defaultValue={now.toISOString().slice(0,16)}/></label><button className="btn-primary">开始推演</button></form>
}
export function TimeTool({kind}:{kind:'meihua'|'qimen'|'calendar'}) {
  const [input,setInput]=useState<BirthInput|null>(null), titles={meihua:'梅花易数',qimen:'奇门遁甲',calendar:'黄历与吉时'}
  return <div className="result-card"><span className="eyebrow">TIME & CHANGE</span><h3>{titles[kind]}</h3><p className="muted">选择北京时间，{kind==='meihua'?'以农历年月日时起卦':kind==='qimen'?'按时家奇门拆补法排盘':'查看宜忌与各时辰值神'}。</p><TimePicker label="日期与时间" onChange={setInput}/>
    {input&&<TaskResult action={kind} payload={input}>{data=>kind==='calendar'?<Calendar data={data}/>:kind==='qimen'?<Qimen data={data}/>:<div className="reading-grid">{Object.entries(data).map(([k,v])=><div className="reading-cell" key={k}><span>{k}</span><strong>{String(v)}</strong></div>)}</div>}</TaskResult>}</div>
}
function Calendar({data}:{data:any}) {return <div className="analysis"><p>{data.lunar} · {data.ganzhi}</p><div className="reading-grid"><div className="reading-cell"><span className="good">宜</span><strong>{data.yi.join(' · ')}</strong></div><div className="reading-cell"><span className="warning">忌</span><strong>{data.ji.join(' · ')}</strong></div></div><p>冲 {data.chong} · 煞 {data.sha}</p><h4>时辰一览</h4><div className="time-grid">{data.times.map((t:any)=><div className={`time-cell ${t.luck==='吉'?'auspicious':''}`} key={t.range}><strong>{t.ganzhi} · {t.luck}</strong><span>{t.range} · {t.god}</span><small>宜 {t.yi.join('、')||'—'}</small><small>忌 {t.ji.join('、')||'—'}</small></div>)}</div></div>}
function Qimen({data}:{data:any}) {
  const positions=['巽','離','坤','震','中','兌','艮','坎','乾']
  return <div className="analysis"><p className="gold">{data.干支}</p><p>{data.節氣} · {data.排局}</p><div className="qimen-grid">{positions.map(p=><div className="qimen-palace" key={p}><strong>{p}宫</strong>{Object.entries(data).filter(([,v])=>typeof v==='object'&&v!==null&&!Array.isArray(v)&&(v as any)[p]!==undefined).map(([k,v])=><span key={k}>{k}：{typeof (v as any)[p]==='object'?JSON.stringify((v as any)[p]):String((v as any)[p])}</span>)}</div>)}</div><details className="options"><summary>完整排盘数据</summary><pre>{JSON.stringify(data,null,2)}</pre></details></div>
}
export function Chenggu({reading}:{reading:any}) {const c=reading.chenggu;return <div className="result-card"><span className="eyebrow">BONE WEIGHT</span><h3>袁天罡称骨</h3><p className="sub-info">{reading.lunar}</p><div className="weight-display">{Math.floor(c.total_weight/10)}<small>两</small>{c.total_weight%10}<small>钱</small></div><blockquote>{c.verse_canonical}</blockquote><div className="analysis">{Object.entries(c).filter(([k,v])=>['advice','analysis','verse_explanation','interpretation'].includes(k)&&typeof v==='string').map(([k,v])=><p key={k}>{String(v)}</p>)}</div><p className="muted">以农历年月日及时辰查表，采用与本地 MLSS 相同的权重与歌诀。</p></div>}
export function Compatibility({first}:{first:BirthInput|null}) {
  const [a,setA]=useState<BirthInput|null>(first),[b,setB]=useState<BirthInput|null>(null)
  return <div className="result-card"><span className="eyebrow">TWO CHARTS</span><h3>双人合盘</h3><div className="pair-forms"><BirthForm compact title="甲方生辰" initialInput={first||undefined} onSubmit={setA}/><BirthForm compact title="乙方生辰" onSubmit={setB}/></div><p className="muted">{a?'甲方已确认':'请确认甲方生辰'} · {b?'乙方已确认':'请确认乙方生辰'}</p>{a&&b&&<TaskResult action="compatibility" payload={{a,b}}>{r=><div className="analysis"><h4>{r.dayStems[0]} × {r.dayStems[1]}</h4><p>日干：{r.elements.join(' / ')} · {r.relation}</p><p>日支：{r.dayRelation}</p><div className="reading-grid">{['a','b'].map((k,i)=><div className="reading-cell" key={k}><span>{i?'乙方':'甲方'}四柱</span><strong>{r[k].pillars.map((p:any)=>p.ganzhi).join(' ')}</strong><p>日主{r[k].wuxing.strong_weak}</p></div>)}</div>{r.notes.map((n:string)=><p key={n}>{n}</p>)}</div>}</TaskResult>}</div>
}
const knowledgeCards=[
  {category:'取名',title:'先辨五行，再谈名字',body:'取名先看八字整体、月令与喜用，再看字义、读音和书写。五行数量缺少某一项，不等于必须在名字里补这一项。'},
  {category:'取名',title:'取字围绕“名”展开',body:'传统取字常用同义、反义、相关联想、典故和排行。先确定名字的核心意象，再从经典语境中寻找自然呼应。'},
  {category:'风水',title:'先看环境与动线',body:'观察采光、通风、干湿、噪声、出入动线与空间功能。涉及方位判断时，应先确认实测朝向和户型，再进行理气分析。'},
  {category:'风水',title:'形势与理气分开记录',body:'将可观察的空间形势、实际朝向、建造或入住时间分别记录。缺少测量时，不用一张无比例照片推定精确方位。'},
  {category:'择日',title:'比较多个候选日',body:'先核对公历与农历，再比较日辰、宜忌、时辰与当事人生辰。说明取舍依据，避免只用一个“吉”字概括所有事项。'},
  {category:'八字',title:'以节气定月，以约定分子时',body:'公历输入先转农历和八字；节气交接、23 时和零时边界需单独核对。排盘页可选择八字在 23:00 或 00:00 换日。'},
  {category:'六爻',title:'先定问事，再取用神',body:'六爻按具体问题确定用神，结合月建、日辰、旬空、动变与世应。卦辞和上下卦五行只是参考，不能替代完整装卦。'},
]
export function Knowledge() {
  const [query,setQuery]=useState('紫微'),[submitted,setSubmitted]=useState('紫微'),[category,setCategory]=useState('全部')
  return <div className="result-card"><span className="eyebrow">CLASSICS & METHODS</span><h3>古籍与方法</h3><form className="search-form" onSubmit={e=>{e.preventDefault();setSubmitted(query)}}><label className="sr-only" htmlFor="classic-query">古籍关键词</label><input id="classic-query" maxLength={100} value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜索紫微、天府、夫妻…"/><button className="btn-secondary">检索古籍</button></form>
    <TaskResult action="classics" payload={{query:submitted}}>{r=><div className="analysis"><p className="muted">骨髓赋 · 紫微斗数全集 · 紫微斗数全书，收录 {r.total} 段选文。</p>{r.hits.length?r.hits.map((hit:any,i:number)=><article className="classic-hit" key={i}><span className="pill">{hit.book_title} · {hit.chapter_title}</span><p>{hit.text||hit.snippet}</p></article>):<p>没有找到匹配内容，试试更短的关键词。</p>}</div>}</TaskResult>
    <h4>方法笔记</h4><div className="filter-tabs">{['全部','八字','六爻','择日','取名','风水'].map(c=><button className={c===category?'active':''} key={c} onClick={()=>setCategory(c)}>{c}</button>)}</div><div className="knowledge-grid">{knowledgeCards.filter(c=>category==='全部'||c.category===category).map(c=><article className="knowledge-card" key={c.title}><span>{c.category}</span><h4>{c.title}</h4><p>{c.body}</p></article>)}</div></div>
}
