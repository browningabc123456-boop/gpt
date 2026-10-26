# 我在末日前囤物资 · 小工具 v0.10.2

最终上传文件：xhs-minitool-v0102.zip。请选择这个ZIP整包；解压后的根目录直接是index.html与assets。

已安装并读取用户提供的minitool-zip-builder 1.8.0，已执行随包Python审计脚本检查产物目录和最终ZIP：0 ERROR；目录0 WARN，ZIP 1 WARN（3.33MiB超过2MiB建议，但低于10MiB硬上限）。

文件白名单、唯一HTML入口、经典外置脚本、CSP与不可用API、ES2017/Chrome61构建、CSS局部回退、安全区和性能降级已经静态核对。许可证保存为JSON；33段拟音以小型PCM缓冲播放，不使用data/blob媒体源，保留袋装增强与瓶子原音量。包内24个文件，无TXT/WAV文件。Chrome61 CSS未实测，真实设备性能未实测。

在线能力文档https://miniapp-sandbox.xiaohongshu.com/minitool/doc在申请网络访问后仍被云环境出口策略返回403。按SKILL第2步允许的本地基线兜底适配；未完成在线契约核验，也未声称发现新增能力。

普通浏览器结果仅用于代码调试，不是小工具功能、兼容性或交付验收。以下三项必须用同一份ZIP继续验证：

1. 创服平台模拟器完整功能验证。
2. Android真机扫码验证。
3. iOS真机扫码验证。

本次未登录创服平台，未主动上传或启动真机验证；三项均为待用户验证，不阻塞ZIP交付。

校验摘要：xhs-minitool-v0102.validation.json
官方审计日志：xhs-minitool-v0102.audit.log
仅作代码调试的记录：xhs-minitool-v0102.debug.json
SHA-256以校验摘要所记值为准。
