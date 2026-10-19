let initialization;
let queue = Promise.resolve();
async function initialize() {
  self.postMessage({ stage: '正在准备排盘工具…' });
  const indexURL = new URL('./runtime/', import.meta.url).href;
  const { loadPyodide } = await import(`${indexURL}pyodide.mjs`);
  const py = await loadPyodide({ indexURL });
  const response = await fetch(new URL('./python/mlss.zip', import.meta.url));
  if (!response.ok) throw new Error('排盘资料加载失败，请重试');
  py.unpackArchive(await response.arrayBuffer(), 'zip', { extractDir: '/engine' });
  py.runPython("import sys; sys.path.insert(0, '/engine'); from api import handle_json");
  self.postMessage({ stage: '排盘工具已就绪' });
  return py;
}
self.onmessage = ({ data }) => {
  queue = queue.then(async () => {
    try {
      const py = await (initialization ??= initialize().catch(error => { initialization = undefined; throw error; }));
      py.globals.set('_mlss_action', data.action);
      py.globals.set('_mlss_payload', JSON.stringify(data.payload));
      const output = py.runPython('handle_json(_mlss_action, _mlss_payload)');
      self.postMessage({ id: data.id, result: JSON.parse(output) });
    } catch (error) {
      self.postMessage({ id: data.id, error: error.message || '计算失败，请检查输入' });
    }
  });
};
