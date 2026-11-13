# EZSVS · 入职第一天 / Your First Day — v0.4.3-web.1

[打开培训 / Open training](https://zsyuyiie.github.io/ezsvs-onboarding/) · [完整 Unity 源码与网页 ZIP / Full source and web ZIP](https://github.com/ZSYUYIIE/ezsvs-onboarding/releases/tag/v0.4.3-web.1) · [测试报告 / Audit](docs/performance-audit-2026-11-13.md)

电脑、安卓手机和平板浏览器的三维入职培训。保留二十条运维红线、中英文、培训进度、证书、按楼层加载与浏览器缓存。

## 本次更新 / This update

- 优化场景导航、相机碰撞与人物异步加载；桌面 WebGL 使用空间网格单元，减少逐帧手动绘制开销。
- 按 GPU 支持选择完整的桌面 DXT 或移动 ETC2 包。`Build/`、`StreamingAssets/`、`mobile/` 和网页脚本必须保持同版；不要只更新首页。
- 桌面游玩中切换“流畅”会将三维场景比例降至 60%，UI 画布保持清晰；自动与高清保持完整桌面场景比例。
- 同一电脑、1280×720、自动画质与同一第二关冷通道视角：约 23 → 33 FPS（约提升 45%）。冷缓存本地进入第二关 6.39 → 4.73 秒；最大进入卡顿 2.77 → 0.81 秒。这些不是员工手机或公网加载速度保证。

English: navigation, camera queries, prefab streaming, WebGL rendering, GPU texture selection and runtime Smooth controls were improved. The controlled Stage 2 view was about 45% faster at the same resolution. Unity allocated memory rose about 16 MB. Full measurements, raw JSON and screenshots are in the audit.

## 操作与存档 / Controls and progress

电脑：WASD / 点地行走，右键拖动视角，E 交谈或开门，G 前往目标，H 手册。触屏：左下拖动行走，右侧空白处拖动视角，点人物或交互提示；建议横屏，可从网页菜单全屏。

Desktop: WASD or click to walk, right-drag to look, E to interact, G for the objective, H for the handbook. Touch: drag the left stick to move and the empty right side to look. Use landscape orientation.

首页可选中文或 English，也可使用 `?lang=zh` / `?lang=en`。网页菜单切换语言会先保存再重新加载，然后选择继续。保持原域名、仓库路径和浏览器，可继续使用原存档；本次没有改变 schema 3 和存档键。

Progress stays in the current browser. Export it from the web menu before clearing browser data or changing devices. There is no manager cloud dashboard or cross-device sync. No browser data was cleared by this deployment.

## 测试与限制 / Validation and limits

89 项交接检查、15 项导航/相机回归、17 项 JS 测试、6 项打包测试通过。英文课程 207 项、中文 202 项通过；ETC2 安卓触屏模拟英文课程 207 项通过。资源下载中断后重试、楼层卸载与返回、900×340 触屏布局及拖动行走均已检查。

Desktop and mobile WebGL builds passed and were packaged with SHA-256 verified parts. Stage 2 is still below a stable 60 FPS on the tested laptop. Physical-phone speed/thermal behavior needs testing. Known Unity/URP diagnostics and build-cache retry history are documented in the audit; a failed build is never treated as a release.

## 源码与发布 / Source and deployment

完整可编辑 Unity 工程在上述 Release 的 `EZSVS-Onboarding-Source-v0.4.3-web.1.zip`（约 1.65 GB），网页备份为 `Web-Pages-v0.4.3.zip`（约 515 MB）。使用 Unity 6000.3.22f1 + Web Build Support / URP 17.3.0；解压后先读 README。旧版原生快照与独立美术制作工程不在本次源码副本内。

This repository serves the tested compiled website. The full Unity project, integrated assets, build tools and regression tests are attached to the versioned release. Large source archives are kept out of the Pages artifact.

The existing `.github/workflows/pages.yml` publishes `main` to the original URL. Serve over HTTP/HTTPS; do not double-click `index.html`. For local preview: `python -m http.server 8080`. Existing history preserves the prior version; previous deployment commit: `9721a2e2cf58436e7d709bd9c567ce494215ac35`.
