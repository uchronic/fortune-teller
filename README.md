# MLSS · 洛玉衡

在线地址：https://uchronic.github.io/fortune-teller/

React、TypeScript 与 Vite 构建的静态命理工具。MLSS 1.5 的 Python 算法通过同站托管的 Pyodide 在浏览器 Worker 中执行；出生信息在浏览器内计算，历史记录保存在本机。

包含八字与精确起运、紫微十二宫与格局、称骨、六爻纳甲、梅花、奇门、黄历、双人五行对照与典籍检索。网页的算法快照来自本地 MLSS；Hermes 的自由对话、私人案例和外部服务不属于静态网页功能。详细范围与校验样例见 [对齐说明](docs/MLSS-ALIGNMENT.md)。

## 本地开发

需要 Node.js 24 与 Python 3.13。首次运行：

```sh
npm ci
python -m zipfile -e engine/vendor.zip engine
npm test
npm run build
npm run preview
```

访问终端显示地址下的 `/fortune-teller/`。开发模式先运行一次 build 生成 Python 与运行时资源，再执行 `npm run dev`。首次打开计算工具需要下载 Python 运行时，之后由浏览器缓存。

## 更新本地算法快照

```sh
python scripts/sync_mlss.py --skill /path/to/mlss --qimen /path/to/kinqimen
npm test
npm run build
```

同步脚本只复制明确列出的计算模块和依赖，移除命令行测试入口；发布前仍需审阅差异。不要复制 Hermes 配置、凭证、记忆或个人案例。快照来源与哈希记录在 `engine/manifest.json`。

## 发布

推送 `main` 会运行 `.github/workflows/pages.yml`：安装锁定依赖、执行回归校验、构建并发布 GitHub Pages。构建产物和大型运行时不提交 Git；CI 从锁定的依赖生成。原 `gh-pages` 分支保留旧版，方便回退。

第三方来源与许可见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
