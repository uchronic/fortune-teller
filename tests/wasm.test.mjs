import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {loadPyodide} from 'pyodide'

test('packaged browser Python executes the complete parity suite', async () => {
  const py = await loadPyodide()
  py.unpackArchive(new Uint8Array(readFileSync(new URL('../public/python/mlss.zip', import.meta.url))), 'zip', {extractDir:'/engine'})
  py.FS.writeFile('/engine/test_engine.py', readFileSync(new URL('./test_engine.py', import.meta.url)))
  const success = await py.runPythonAsync(`
import sys, unittest
sys.path.insert(0, '/engine')
import test_engine
result = unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromModule(test_engine))
result.wasSuccessful()
`)
  assert.equal(success, true)
})
