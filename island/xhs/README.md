# 孤岛绘境 · 小红书小工具上传候选包

下载：[island-sketchbook-xhs.zip](https://github.com/browningabc123456-boop/gpt/raw/refs/heads/main/releases/island-sketchbook-xhs.zip)

上传时选择这个 ZIP 本身，不要再次套文件夹，不要使用之前的 web.zip 或源码 ZIP。包根目录有 index.html，assets 中是独立脚本、纸艺图片、字体和许可；游戏不依赖原试玩域名，也不需要自行引入 SDK。

## 当前验证状态

- 对照小红书[官方容器能力清单](https://miniapp-sandbox.xiaohongshu.com/minitool/doc)，文档最后更新 2026-10-13，本包准备日期 2026-10-21。
- 仅有一个 HTML 入口，经典外置脚本，编译目标 ES2017 / Chrome 61；现代 CSS 有基础声明，补齐 Array.at / flat / flatMap、Object.fromEntries、Promise.finally、对话框等实际使用能力。
- 素材、字体、Three.js 和原创合成音乐均在包内。没有外部资源、联网请求、动态执行代码、WASM、Worker、XR、外链或浏览器文件下载。
- 图片通过平台 writeTempFile / saveImageToPhotosAlbum 主动保存。无宿主 API 或授权失败时明确提示，不伪报保存成功。
- 按客户端版本选择 Storage API。大存档分片，每个 key 写入合法 JSON 且低于 1 MB；串行写入、校验恢复、写完后切换索引，读取失败时保护原数据。总容量不足会提示，不假装永久保存。
- 岛屿相册最多 16 张且序列化大小不超过 3.5 MB，平台总缓存限制仍会进一步约束可存数量。仅用户主动保存图片后收藏；失败会回滚收藏。
- JSON 文件选择、Blob 下载改为文本备份和粘贴恢复，避免小工具只允许选择图片 / 视频的限制。备份不含风景卡。
- 手机布局为宿主顶部按钮预留空间；WebGL 上下文丢失时暂停绘制并尝试保存，恢复后继续显示。

33 项原游戏规则测试、7 项上传构建 / 平台桥接测试通过。当前 Chromium 在严格 CSP（不允许内联脚本和联网）与模拟平台 API 下的 10 项流程验证通过，含 561 个物件场景、造景、原生模拟存档重开、相册保存和夜晚切换。没有拿到真实小红书容器，不将模拟结果宣称为真机验证。

## 上传与审核

1. 在小红书小工具上传页第一步复制**当前完整改写口令**，交给助手执行对应版本 Skill 和官方校验。
2. 选择本 ZIP 上传，在平台模拟器中检查纸艺渲染、操作栏、缩放旋转、存档与相册。
3. 使用 Android / iOS 真机预览，重点检查复杂岛屿性能、WebGL 2 支持、音乐、相册授权和重新打开后的存档。
4. 填写后台要求的名称、图标等资料，再按平台流程提交审核。

官方文档明确要求使用上传页当次口令，能力清单不能代替口令。目前用户尚未提供该口令，因而本文件是按公开文档准备的**上传候选包**，并非已执行官方 Skill 校验、已通过平台验证或审核的正式上线包。若平台报错，需要以当次口令 / 预览结果继续修正，不能保证直接审核通过。

## 本地构建

在仓库根目录：

    npm ci
    npm run build:island:xhs
    npm run test:island:xhs

输出目录为 island-xhs-dist（不入 Git），发布包在 releases/island-sketchbook-xhs.zip。xhs/adapt.mjs 只在上传构建时改写，不改变网页版和既有试玩站点。
