# 本地浏览器依赖与可选配置

站点已将浏览器运行所需的库提交到 `vendor/`，发布页面不依赖 CDN：

- `gsap.min.js`：GSAP 3.12.2
- `ScrollTrigger.min.js`：ScrollTrigger 3.12.2
- `lenis.min.js`：可选平滑滚动运行库

更新这些文件时必须同时核对许可证、浏览器兼容性、文件完整性和现有动画验收结果。不要在构建阶段从网络临时下载不同版本。

## 动画执行路径

| 条件 | 结果 |
|---|---|
| 正常、GSAP 与 ScrollTrigger 可用 | GSAP 时间轴与 ScrollTrigger |
| 依赖不可用或 `?animation=native` | 原生动画降级 |
| 系统减少动效或 `?animation=reduced` | 静态内容，停用复杂动画 |
| `?smooth=1`、Lenis 可用、非触屏 | Lenis 平滑滚动 |
| 默认或触屏设备 | 浏览器原生滚动 |

调试参数：

- `?debug=1`：在 GSAP 路径显示 ScrollTrigger 标记。
- `?animation=native`：确定性进入原生降级路径。
- `?animation=reduced`：确定性进入减少动效路径。
- `?smooth=1`：在满足条件时显式启用 Lenis。
- `?input=touch`：本地验收时模拟触屏输入分支。

所有路径都必须保持主要内容可见、导航和产品卡可交互。依赖缺失不应导致空白页面。

## 联系表单配置

`form-config.js` 是浏览器可见的公开配置：

```js
window.EYAYOO_CONFIG = Object.freeze({
  formspreeEndpoint: ''
});
```

### 默认 mailto 模式

- 保持 `formspreeEndpoint` 为空。
- 用户提交后打开 `mailto:contact@eyayoo.com`，主题和正文来自当前输入。
- 页面同时显示可直接点击的邮件兜底链接，以便邮件客户端未自动打开时继续操作。

### 可选 Formspree 模式

- 仅配置合法公开地址，例如 `https://formspree.io/f/abcd1234`。
- 前端发送 JSON：`{ subject, message, page, ua }`。
- 网络错误、限额或非成功响应会回到保留当前内容的 mailto 链接。
- 不要在 `form-config.js` 中放入 token、API key、私有端点或其他秘密。

### 防滥用与状态

- 隐藏蜜罐字段 `#hp` 被填写时拒绝提交。
- 页面停留不足 2.5 秒时拒绝提交。
- 发送、成功、失败、复制与等待提示均支持中英文并通过 `aria-live` 对辅助技术播报。
- 如需更强防滥用，应新建任务评估 Turnstile 或 serverless 代理，不能把私密凭据放入静态前端。
