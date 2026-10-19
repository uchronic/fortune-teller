import { useState } from 'react'
import type { BirthInput } from '../utils/fortune'
export function BirthForm({ onSubmit, busy = false, title = '输入生辰，观照人生', compact = false, initialInput }: {
  onSubmit: (input: BirthInput) => void; busy?: boolean; title?: string; compact?: boolean; initialInput?: BirthInput
}) {
  const [value, setValue] = useState<BirthInput>({calendar:'solar',sect:2,...(initialInput||{year:1990,month:1,day:1,hour:12,minute:0,gender:'male'})})
  const change = (key: keyof BirthInput, val: unknown) => setValue(v=>({...v,[key]:val}))
  return <form className={compact?'birth-form compact':'form-card birth-form'} onSubmit={event=>{event.preventDefault();onSubmit(value)}}>
    <h2>{title}</h2><div className="form-row">
      <label>历法<select value={value.calendar} onChange={e=>change('calendar',e.target.value)}><option value="solar">公历</option><option value="lunar">农历</option></select></label>
      <label>性别<select value={value.gender} onChange={e=>change('gender',e.target.value)}><option value="male">男</option><option value="female">女</option></select></label>
    </div><div className="form-row">
      <label>年<input required type="number" min="1900" max="2100" value={value.year} onChange={e=>change('year',+e.target.value)}/></label>
      <label>月<input required type="number" min="1" max="12" value={value.month} onChange={e=>change('month',+e.target.value)}/></label>
      <label>日<input required type="number" min="1" max={value.calendar==='lunar'?30:31} value={value.day} onChange={e=>change('day',+e.target.value)}/></label>
    </div><div className="form-row">
      <label>时（0–23）<input required type="number" min="0" max="23" value={value.hour} onChange={e=>change('hour',+e.target.value)}/></label>
      <label>分<input required type="number" min="0" max="59" value={value.minute} onChange={e=>change('minute',+e.target.value)}/></label>
      {value.calendar==='lunar'&&<label>月份<select value={value.leapMonth?'leap':'normal'} onChange={e=>change('leapMonth',e.target.value==='leap')}><option value="normal">普通月</option><option value="leap">闰月</option></select></label>}
    </div><details className="options"><summary>排盘约定</summary><p>按北京时间（UTC+8）输入，不作真太阳时校正。</p>
      <label>八字子时换日<select value={value.sect} onChange={e=>change('sect',+e.target.value)}><option value="2">00:00 换日（默认）</option><option value="1">23:00 换日</option></select></label>
    </details><button className="btn-primary" disabled={busy}>{busy?'正在排盘…':compact?'确认生辰':'开始排盘'}</button>
  </form>
}
