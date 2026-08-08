# PenPot Sync Policy — V1

## 目标

PenPot 是 Com Design Mobile 的正式视觉资产载体，但 Token / Contract 的命名与语义必须来自机器 Source Package，而不是在 PenPot 中独立演化。

---

## 1. 两类资产分开验收

### Formal Spec Visual

给人阅读的正式规范页。

要求：

- 中文解释优先，英文 Component / Token ID 保留
- Visual specimen 是主角，Token table 是辅助
- 不做 Demo Gallery，不堆装饰
- 0 outer overflow
- 0 internal section overlap
- 正式 Viewer 中必要内容 `hideInViewer = false`
- 不出现已删除 / Deprecated Token 的 stale reference

### Reusable Component Asset

真正可复用的 PenPot Component / Variant / State 资产。

要求：

- Name 与 Component Contract 一致
- Variant / State 不靠复制一堆无关系 Frame 假装组件库
- Token binding 可追溯到 Manifest
- 不把 Product-specific Pattern 混入 Core Component Page

Formal Spec 画得漂亮，不等于 Reusable Component Library 已完成；两者必须分别验收。

---

## 2. 推荐页面结构

- `00 Cover / System Index`
- `01 Foundations`
- `02 Actions / Button`
- `03 Forms / Field Family`
- `04 Selection Controls`
- `05 Navigation`
- `06 Information`
- `07 Feedback`
- `08 Overlay`
- `09 Progress`
- `10 Search & Menu`
- `11 Theme / Density / Motion Verification`
- `90 Reusable Component Library`
- `99 Token / MCP Verification`

不要求为了页码机械拆成几十页；内容量小时允许合并，但类别边界要稳定。

---

## 3. Token sync

Canonical entrypoint：`contracts/design-system-v1.json`。

PenPot 同步顺序：

1. Foundation Token
2. Active Theme mapping
3. Density / Platform / Motion modes
4. Component bindings
5. Visual specimen

禁止：

- 在 PenPot 里先手工新建一个 Semantic 名，再回头让 JSON 追认
- Component 直接绑 Primitive
- 为某产品局部需求修改 Core Token

---

## 4. Theme specimen

至少验证以下 Light / Dark 对照：

- Page + Surface + Section
- Primary / Secondary / Destructive Button
- Input empty / value / focus / error / disabled
- List Item / Tabs / Bottom Navigation
- Tag / Alert status family
- Dialog / Bottom Sheet / Menu
- Search Field
- Progress / Stepper

Dark 不能只检查“看起来像深色”，必须检查 Semantic role 是否仍成立。

---

## 5. Density specimen

至少验证 Compact / Comfortable：

- Button
- Input
- List Item single / two line
- Tabs / Segmented Control
- Bottom Navigation
- Menu Item
- Search Field

要求：

- Density 变化不改变文字层级
- touch target 不随视觉压缩跌破平台下限
- 多行文本自然增高
- Compact 不出现文本/图标碰撞

---

## 6. Motion specimen

PenPot 若只能静态表达 Motion，则用标注说明，不伪造“已验证动画”。

应标注：

- Standard duration / easing
- Reduced Motion behavior
- Overlay enter / exit relationship
- Skeleton shimmer 在 Reduced 下关闭

真实 Motion 验证最终应在产品原型 / 实现环境执行。

---

## 7. Export audit

每次正式导出 `.penpot` 后，自动/人工检查：

- file revision / exportedAt
- page names
- main board dimensions
- content bounds
- `hideInViewer`
- token alias dangling refs
- Component → Primitive 直连
- stale token name
- duplicate formal page
- reusable component / variant metadata 是否真实存在

不要只相信“完成报告”。验收以实际导出文件为准。

---

## 8. Version stamp

正式 PenPot 文件至少记录：

- `designSystemVersion`
- `manifestVersion`
- `tokenFoundationVersion`
- `lastSyncAt`

若视觉资产版本落后于 Manifest，应明确标记 `out-of-sync`，不能默认为最新规范。

---

## 9. Tooling limitation

如果 MCP / PenPot 当前无法创建某类 reusable component / variant / theme mode：

- 明确记录 Tooling Limitation
- Formal Spec 可以继续完成
- 不得把“规范样本已画出”描述成“Reusable Library 已建立”
- 不得为了规避工具限制修改 Core Contract
