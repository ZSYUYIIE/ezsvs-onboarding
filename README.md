# EZSVS · 入职第一天 — GitHub Pages 部署包

这是浏览器直接运行的 Unity 3D 培训游戏，不需要员工安装 EXE、APK 或 Unity。电脑与安卓平板使用同一个网址。首屏主要资源约 302.7 MB → 85.4 MB，减少 71.8%。完整发布资源约 279.9 MB，后续按楼层加载人物。建议使用 Wi-Fi。请先查看本包“测试说明.md”，安卓实际设备的验证尚未完成。

## 上传同事的操作

1. 解压收到的 ZIP。进入含有 `index.html`、`Build`、`StreamingAssets`、`asset-loader.js`、`web.js`、`.github` 的那一层文件夹。
2. 在公司指定的 GitHub 账号中新建空仓库，例如 `ezsvs-onboarding`。确认公司允许这份培训内容公开访问后再启用 Pages。普通 GitHub Pages 网址没有员工登录验证，知道网址的人可能访问；私有仓库不等于私有网页。
3. 推荐使用 GitHub Desktop：把该文件夹添加为本地仓库、提交全部文件、发布到指定 GitHub 仓库，默认分支使用 `main`。不要启用 Git LFS，不要把整个 ZIP 直接当作网站上传。
4. 在仓库的 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
5. 在 **Actions → Deploy EZSVS training to Pages → Run workflow** 运行。出现绿色完成标记后，打开部署结果里的网址。之后更新 `main` 会自动部署。
6. 把网址发给员工，例如 `https://你的账号.github.io/ezsvs-onboarding/`。部署包全部使用相对路径，仓库名可以更换。

也可用 **Add file → Upload files** 上传解压后的文件和文件夹。必须保留 `Build` 和 `StreamingAssets` 目录层级；确认 `.github/workflows/pages.yml` 和 `.nojekyll` 一并上传。大数据文件已分片，每片最多 4 MiB；若浏览器上传限制拦住某个文件，请改用 GitHub Desktop。不要重命名、漏传或手动合并分片。

## 员工怎么玩

- 首页“语言 / Language”可选中文或 English。培训中在“网页菜单 / Web Menu”切换，会先保存、再重新加载；进入后点“继续上次培训 / Continue”。两种语言共用同一份进度和成绩。
- 可以分别发送中文入口 `?lang=zh` 与英文入口 `?lang=en`，例如 `https://你的账号.github.io/ezsvs-onboarding/?lang=en`。不需要部署两份网站。
- 电脑用当前版本的 Chrome 或 Edge，安卓平板用当前版本的 Chrome。平板建议横屏，先选“自动”或“均衡”；电脑可选“精细”。不建议在微信内置浏览器里运行。
- 电脑：WASD 或点地行走，右键拖动视角，E 交谈 / 开门，G 前往目标，H 红线手册。
- 平板：左下拖动行走，右侧空白处拖动视角；点击人物或交互提示。网页菜单提供全屏。
- 按流程完成到岗、准入、巡检、变更、应急和结业。场景模拟不替代现场授权、岗位资质、正式 SOP 或实际应急指挥。

## 存档与记录

进度保存在当前设备、当前浏览器、当前网站域名的本地存储中。没有服务器账号、云存档或主管成绩后台。关闭页面后可续玩；清除浏览器数据、使用无痕模式、换设备或更换网站域名可能失去本机记录。

网页菜单的“导出存档 / 导入存档”可迁移进度。证书下载由浏览器处理。学员姓名只用于本机培训记录及证书，本版本没有主动上传成绩或姓名的功能。

## 本地预览

不能直接双击 `index.html`。电脑已装 Python 3 时，在本文件夹终端运行：

```powershell
python -m http.server 8080 --bind 127.0.0.1
```

然后打开 `http://127.0.0.1:8080/`。部署到 GitHub Pages 后不需要 Python，也不需要持续开着这台电脑。

## 故障处理

- **404 或白屏**：检查 `index.html` 是否在仓库根目录，`Build` 是否完整，Actions 是否成功。
- **素材下载失败**：先检查网络和漏传文件。不要重命名哈希资源与 `.part` 分片。
- **浏览器过旧 / WebGL 2 不可用**：更新 Chrome / Edge；电脑检查硬件加速是否正常。
- **平板卡顿或浏览器关闭标签**：关掉其他大应用，使用均衡画质和横屏；较旧或内存不足的平板可能无法运行本版 3D 场景。请参考同包实测报告，不把模拟器结果当作所有设备的保证。
- **需要限制仅员工访问**：当前包不含身份验证。先选择公司认可的带身份验证托管方式，再部署；不要在前端代码里写“共享密码”充当访问控制。

## 维护约定

本包仅含发布资源和部署资料，不能反向替代 Unity 工程。原 Windows / Android 版本与原工程保持不变。新版网页源码在单独的 Unity Web 项目中维护。

上传后请至少从一台电脑和实际使用的安卓平板各完成一次开场、交谈、保存及重新进入。东南亚各地访问 GitHub Pages 的速度取决于当地网络。

参考：[GitHub Pages 创建网站](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)、[Pages 使用限制](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)、[Pages 访问控制](https://docs.github.com/en/pages/getting-started-with-github-pages/changing-the-visibility-of-your-github-pages-site)。

## v0.4.0 下载优化

- 同时最多下载 3 个资源片；临时网络错误自动重试。每片下载后核对 SHA-256。
- 验证通过的片段保存在当前网站的浏览器缓存中，重开页面时复用；中途中断后，无需重新下载已完成的片段。不是从某个字节位置继续下载。
- 开场准备李毅、袁雨婷和共享素材；少量门口人员稍后后台准备。前往其他楼层时再准备该层人物，保留原有培训内容。
- 清理无用模型及不显示的冗余渲染组件；仅为建筑表面法线、粗糙度等贴图降低网页专用分辨率。人物脸部贴图精度保持不变。
- 浏览器可能因空间不足、清理数据或隐私模式无法保留缓存，此时仍可联网重新加载。缓存不等于完整离线运行。

升级原网站请优先阅读“升级说明.md”。该包改善下载量与重试体验；GitHub Pages 到中国大陆的网络线路仍可能慢，未实测中国大陆员工线路。
