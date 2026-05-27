import { useState } from 'react'
import type { BirthInput } from '../utils/fortune'

interface Props { onSubmit: (input: BirthInput) => void }

export function BirthForm({ onSubmit }: Props) {
  const [year, setYear] = useState(1990)
  const [month, setMonth] = useState(1)
  const [day, setDay] = useState(1)
  const [hour, setHour] = useState(12)
  const [gender, setGender] = useState<'male' | 'female'>('male')

  return (
    <div className="form-card">
      <h2>请输入生辰</h2>
      <div className="form-row">
        <label>
          年<input type="number" min={1900} max={2030} value={year} onChange={e => setYear(+e.target.value)} />
        </label>
        <label>
          月<input type="number" min={1} max={12} value={month} onChange={e => setMonth(+e.target.value)} />
        </label>
        <label>
          日<input type="number" min={1} max={31} value={day} onChange={e => setDay(+e.target.value)} />
        </label>
      </div>
      <div className="form-row">
        <label>
          时辰
          <select value={hour} onChange={e => setHour(+e.target.value)}>
            {[
              [23,'子时(23-1点)'],[1,'丑时(1-3点)'],[3,'寅时(3-5点)'],
              [5,'卯时(5-7点)'],[7,'辰时(7-9点)'],[9,'巳时(9-11点)'],
              [11,'午时(11-13点)'],[13,'未时(13-15点)'],[15,'申时(15-17点)'],
              [17,'酉时(17-19点)'],[19,'戌时(19-21点)'],[21,'亥时(21-23点)']
            ].map(([v, l]) => <option key={v as number} value={v as number}>{l}</option>)}
          </select>
        </label>
        <label>
          性别
          <select value={gender} onChange={e => setGender(e.target.value as 'male'|'female')}>
            <option value="male">男</option>
            <option value="female">女</option>
          </select>
        </label>
      </div>
      <button className="btn-primary" onClick={() => onSubmit({ year, month, day, hour, gender })}>
        开始排盘
      </button>
    </div>
  )
}
