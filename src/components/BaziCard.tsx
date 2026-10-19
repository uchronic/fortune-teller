export function BaziCard({ reading }: { reading:any }) {
  const labels=['年柱','月柱','日柱','时柱'], wx=reading.wuxing
  const scores=Object.entries(wx.total_scores) as [string,number][]
  const max=Math.max(...scores.map(([,v])=>v))
  return <div className="result-card"><div className="section-title"><div><span className="eyebrow">FOUR PILLARS</span><h3>八字命盘</h3></div><span className="pill">{wx.day_stem}日主 · {wx.strong_weak}</span></div>
    <p className="sub-info">{reading.solar} · {reading.lunar}</p><div className="bazi-grid">{reading.pillars.map((p:any,i:number)=><div className="pillar" key={i}>
      <span className="pillar-label">{labels[i]} · {p.shishen}</span><span className="pillar-gan">{p.ganzhi[0]}</span><span className="pillar-zhi">{p.ganzhi[1]}</span><span className="pillar-nayin">{p.nayin}</span>
      <span className="pillar-detail">藏干 {p.hidden.join(' ')}</span><span className="pillar-detail">{p.hiddenShishen.join(' · ')}</span><span className="pillar-detail">{p.stage} · 空亡 {p.kongwang}</span></div>)}</div>
    <div className="analysis"><h4>五行权重</h4><p className="muted">结合月令、天干、地支与藏干计分。日主权重占比 {(wx.ratio*100).toFixed(2)}%。</p>
      <div className="element-bars">{scores.map(([name,value])=><div className="element-row" key={name}><span>{name}</span><div className="bar-track"><div className={`bar wx-${name}`} style={{width:`${value/max*100}%`}}/></div><strong>{value.toFixed(2)}</strong></div>)}</div>
      <p>日主{wx.day_stem}{wx.day_element}，量化模型判为「{wx.strong_weak}」。取用仍需结合格局、调候和大运。</p></div>
    <div className="analysis"><h4>大运与起运</h4><p>{reading.yun.forward?'顺行':'逆行'} · 出生后 {reading.yun.years} 年 {reading.yun.months} 月 {reading.yun.days} 天起运</p><p className="muted">交运日期 {reading.yun.startDate}；下表年龄沿用历法库的起止年龄口径。</p>
      <div className="table-scroll"><table><thead><tr><th>大运</th><th>年龄</th><th>年份</th></tr></thead><tbody>{reading.yun.cycles.map((d:any)=><tr key={d.startAge}><td className="gold">{d.ganzhi}</td><td>{d.startAge}–{d.endAge} 岁</td><td>{d.startYear}–{d.endYear}</td></tr>)}</tbody></table></div></div>
    <div className="meta-grid"><div>胎元<strong>{reading.taiyuan}</strong></div><div>命宫<strong>{reading.minggong}</strong></div><div>身宫<strong>{reading.shengong}</strong></div></div>
  </div>
}
