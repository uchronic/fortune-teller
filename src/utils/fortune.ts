import { astro } from 'iztro'
// @ts-expect-error lunar-javascript ships no type declarations
import { Solar } from 'lunar-javascript'

export interface BirthInput {
  year: number
  month: number
  day: number
  hour: number // 0-23
  gender: 'male' | 'female'
}

export function getZiwei(input: BirthInput) {
  const { year, month, day, hour, gender } = input
  const hourIdx = Math.floor((hour + 1) / 2) % 12
  const dateStr = `${year}-${month}-${day}`
  return astro.bySolar(dateStr, hourIdx, gender === 'male' ? '男' : '女')
}

export function getBazi(input: BirthInput) {
  const solar = Solar.fromYmdHms(input.year, input.month, input.day, input.hour, 0, 0)
  const lunar = solar.getLunar()
  const eightChar = lunar.getEightChar()

  return {
    year: { gan: eightChar.getYearGan(), zhi: eightChar.getYearZhi() },
    month: { gan: eightChar.getMonthGan(), zhi: eightChar.getMonthZhi() },
    day: { gan: eightChar.getDayGan(), zhi: eightChar.getDayZhi() },
    hour: { gan: eightChar.getTimeGan(), zhi: eightChar.getTimeZhi() },
    lunar: {
      year: lunar.getYearInChinese(),
      month: lunar.getMonthInChinese(),
      day: lunar.getDayInChinese(),
    },
    zodiac: lunar.getYearShengXiao(),
    nayin: {
      year: eightChar.getYearNaYin(),
      month: eightChar.getMonthNaYin(),
      day: eightChar.getDayNaYin(),
      hour: eightChar.getTimeNaYin(),
    },
  }
}

export function getLiuyao() {
  // 模拟铜钱摇卦：每次三枚铜钱
  const lines: number[] = []
  for (let i = 0; i < 6; i++) {
    const coins = [Math.random(), Math.random(), Math.random()]
    const heads = coins.filter(c => c > 0.5).length
    // 3阳=老阳9, 2阳1阴=少阳7, 1阳2阴=少阴8, 3阴=老阴6
    lines.push([6, 8, 7, 9][heads])
  }
  return lines
}

const LIUYAO_NAMES = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻']
const BAGUA = ['坤', '震', '坎', '兑', '艮', '离', '巽', '乾']

export function interpretLiuyao(lines: number[]) {
  const lower = ((lines[0] % 2) << 0) | ((lines[1] % 2) << 1) | ((lines[2] % 2) << 2)
  const upper = ((lines[3] % 2) << 0) | ((lines[4] % 2) << 1) | ((lines[5] % 2) << 2)

  return {
    lines,
    lineNames: LIUYAO_NAMES,
    lowerGua: BAGUA[lower],
    upperGua: BAGUA[upper],
    lineTypes: lines.map(l => {
      if (l === 9) return '老阳 ⚊→⚋'
      if (l === 6) return '老阴 ⚋→⚊'
      if (l === 7) return '少阳 ⚊'
      return '少阴 ⚋'
    }),
  }
}

export function getShichen(hour: number): string {
  const names = ['子', '丑', '丑', '寅', '寅', '卯', '卯', '辰', '辰', '巳', '巳', '午',
                 '午', '未', '未', '申', '申', '酉', '酉', '戌', '戌', '亥', '亥', '子']
  return names[hour] + '时'
}
