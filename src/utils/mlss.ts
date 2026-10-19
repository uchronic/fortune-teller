type Listener = (stage: string) => void
let worker: Worker | undefined
let sequence = 0
const pending = new Map<number, {resolve: (result: any) => void; reject: (error: Error) => void; timer: ReturnType<typeof setTimeout>}>()
const listeners = new Set<Listener>()
let stage = '首次使用时准备排盘工具'
export function listenToEngine(listener: Listener) {
  listeners.add(listener); listener(stage)
  return () => { listeners.delete(listener) }
}
function getWorker() {
  if (!worker) {
    worker = new Worker(`${import.meta.env.BASE_URL}mlss-worker.mjs?v=1.5.0`, { type: 'module' })
    worker.onmessage = ({ data }) => {
      if (data.stage) { stage = data.stage; listeners.forEach(fn => fn(stage)); return }
      const request = pending.get(data.id)
      if (!request) return
      clearTimeout(request.timer); pending.delete(data.id)
      if (data.error) request.reject(new Error(data.error))
      else request.resolve(data.result)
    }
    worker.onerror = () => {
      pending.forEach(request => { clearTimeout(request.timer); request.reject(new Error('排盘工具加载失败，请刷新页面重试')) })
      pending.clear(); worker?.terminate(); worker = undefined
    }
  }
  return worker
}
export function calculate<T = any>(action: string, payload: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    const active = getWorker(), id = ++sequence
    const timer = setTimeout(() => { pending.delete(id); reject(new Error('加载时间较长，请检查网络后重试')) }, 120000)
    pending.set(id, { resolve, reject, timer }); active.postMessage({ id, action, payload })
  })
}
