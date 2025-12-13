# 本地动画库（可选）

本原型已内置“原生滚动动画”降级实现，无需外部库即可工作。
若你需要更强的时间轴与控制，可在本地放置以下文件（无需联网）：

- gsap.min.js（GSAP 3.x）
- ScrollTrigger.min.js（GSAP 插件）
- lenis.min.js（可选：平滑滚动）

放置路径
- vendor/gsap.min.js
- vendor/ScrollTrigger.min.js
- vendor/lenis.min.js

获取方式（任一）：
- 从官方或 CDN 手动下载对应文件并复制到上述路径：
  - https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js
  - https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js
  - https://unpkg.com/@studio-freight/lenis/bundled/lenis.min.js
- 或通过现有项目依赖 node_modules 复制同名文件

启用方式
- index.html 已按顺序引用 vendor 下的文件；若文件存在，脚本会检测并优先使用 GSAP/ScrollTrigger；
- 若文件不存在，则自动使用原生降级动画（已默认启用）。

注意
- 使用 GSAP 时，可在 URL 添加 `?debug=1` 查看 ScrollTrigger 标记；
- 在系统开启“减少动效”时，复杂动画将自动停用。


## 联系表单（Formspree）接入说明

当前 `Contact Us` 区块已内置 Formspree 方案与兜底逻辑：

1) 配置 Endpoint（必做）
- 打开 `script.js`，找到：
  `const FORMSPREE_ENDPOINT = 'https://formspree.io/f/your_form_id';`
- 将 `your_form_id` 替换为你在 formspree.io 后台创建表单后得到的 ID（形如 `https://formspree.io/f/abcd1234`）。

2) 提交数据结构
- 前端发送 JSON：`{ subject, message, page, ua }`
  - `subject`：邮件标题（来自页面输入框）
  - `message`：邮件内容（来自页面文本域）
  - `page`：提交来源页 URL（自动填充）
  - `ua`：用户代理（用于排查问题/统计）

3) 反滥用与安全
- 已内置蜜罐字段（隐藏输入 `#hp`）与时间陷阱（页面停留 ≥ 2.5s 才允许提交）。
- 如需更强防护，建议在 Formspree 后台开启 Turnstile/ reCAPTCHA（按官方文档接入）。

4) 失败兜底（未配置或超额）
- 若未配置有效 Endpoint，或网络/限额导致失败，前端会自动回退为 `mailto:contact@eyayoo.com`，并将页面输入的标题/内容拼接到邮件客户端。

5) UI 行为
- “复制邮箱”按钮会将 `contact@eyayoo.com` 复制到剪贴板，并在下方显示提示；
- “发送邮件”按钮优先走 Formspree，失败时回退到 mailto；
- 表单字段的展示文案在占位符中（无“可选”字样）。

6) 可选参数
- 关闭/开启平滑滚动：默认关闭，若需开启可在 URL 添加 `?smooth=1`；
- 动画调试：`?debug=1` 显示标记（需本地 GSAP 依赖）。
