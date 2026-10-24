# 小红书小工具 · 孤岛绘境第六版上传候选包

[下载 island-sketchbook-xhs-v6.zip](https://github.com/browningabc123456-boop/gpt/raw/refs/heads/main/releases/island-sketchbook-xhs-v6.zip)

直接上传 ZIP 本身，不解压、不再次套文件夹。根目录只有一个 index.html；assets 是独立经典脚本、样式、图片、字体和许可。没有原试玩域名依赖，没有外部 SDK 或 CDN。

本版：更高纸材对比、15%–400% 疏密度、12 种随机主题及多种道路 / 水域 / 聚落布局；进入时选择已有作品或新建，手动保存 / 覆盖 / 另存为 / 删除；移除相册、天气、流星、地图和冗余文案，仅留昼夜。旋转支持双指自然扭转和单指旋转模式。旧岛迁移为独立存档，工作草稿和手动存档隔离。

## 平台适配

- ES2017 / Chrome 61 语法，经典外置脚本；现代 CSS 提供基础声明，按实际用到的能力补齐 Array.at / flat、Object.fromEntries、对话框等。
- 无 fetch / XHR / WebSocket / Worker / WASM / eval / new Function / XR / 外链 / 文件下载等禁用能力。页面不联网。
- 图片主动调用 writeTempFile / saveImageToPhotosAlbum 保存到系统相册，不再写入岛屿相册。未授权、未注入平台 API 或保存失败会明确提示。
- 根据客户端版本启用 Storage API，不满足时使用有异常处理的设备临时存储。大存档拆为每 key 小于 1 MB 的 JSON 分片，串行写入、校验恢复、完成后切换索引；失败不替换原完整数据。空间不足提示删除旧存档。
- 最多 40 个作品存档，实际数量受平台 10 MB 总缓存约束。作品缩略图为低分辨率 JPEG；不永久存储大截图。旧版相册不再加载或新增，但不会自动清除旧数据。
- 文本备份 / 恢复替代 JSON 文件选择和 Blob 下载；不调用剪贴板 API。
- WebGL 上下文丢失时暂停并尝试暂存，恢复后重绘。设备需支持 WebGL 2；没有将纸艺场景替换为精度更低的二维版本。

## 验证状态

37 项规则、随机布局、存档迁移与快照隔离测试，7 项桥接 / 分片存储 / 打包测试；本地 Chromium 在严格 CSP 和模拟平台接口下检查手机游戏流程。结果见 [validation.json](../../releases/island-sketchbook-xhs-validation.json)。本地模拟不代表真实小红书客户端验证。

按[官方能力清单](https://miniapp-sandbox.xiaohongshu.com/minitool/doc)准备（最近已核对文档版本为 2026-10-13）。用户仍未提供上传页当前完整改写口令，尚未加载该口令指定的官方 Skill，也未执行官方当次校验或平台审核。因此交付的是上传候选包，不能宣称直接审核通过或已上线。

在上传页按当前口令完成官方校验，再上传 ZIP 做 Android / iOS 真机预览，检查密集场景帧率、保存 / 删除 / 重开、缩放旋转、音乐和系统相册授权后提交审核。

## 构建

    npm run build:island:xhs
    npm run test:island:xhs

上传适配独立在 xhs/adapt.mjs，普通浏览器版不依赖平台桥接。原 Sites 演示未作为本次发布目标；新版通过 GitHub 下载交付。
