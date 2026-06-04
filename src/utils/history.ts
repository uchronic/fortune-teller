// 本地命盘历史（localStorage，匿名，无后端）
// 只持久化 BirthInput 这个“种子”——重新跑 getBazi/getZiwei 即可复现完整命盘，
// 比序列化 iztro 的计算结果干净得多。

import type { BirthInput } from './fortune'

export interface HistoryEntry {
  id: string
  input: BirthInput
  savedAt: number // epoch ms
}

const KEY = 'ft_history_v1'
const MAX = 20

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function persist(list: HistoryEntry[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)))
  } catch {
    // 隐私模式 / 配额满 / 被禁用：静默降级，功能不受影响
  }
}

// 保存一条命盘。相同生辰（含性别）视为同一条，去重并提到最前。
export function saveHistory(input: BirthInput): HistoryEntry[] {
  const sig = signature(input)
  const list = loadHistory().filter(e => signature(e.input) !== sig)
  const entry: HistoryEntry = {
    id: sig + '_' + Date.now().toString(36),
    input,
    savedAt: Date.now(),
  }
  const next = [entry, ...list].slice(0, MAX)
  persist(next)
  return next
}

export function removeHistory(id: string): HistoryEntry[] {
  const next = loadHistory().filter(e => e.id !== id)
  persist(next)
  return next
}

export function clearHistory(): void {
  persist([])
}

function signature(i: BirthInput): string {
  return `${i.year}-${i.month}-${i.day}-${i.hour}-${i.gender}`
}

export function describeEntry(e: HistoryEntry): string {
  const { year, month, day, hour, gender } = e.input
  const g = gender === 'male' ? '男' : '女'
  const hh = String(hour).padStart(2, '0')
  return `${year}年${month}月${day}日 ${hh}时 · ${g}`
}
