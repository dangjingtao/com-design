# Penpot MCP 操作手册

本手册沉淀通过 Penpot MCP 操作 Penpot 的全部关键知识，供新会话快速上手，无需重新查阅 API。
真相源是本机的 `com-design` 设计系统（`colors_and_type.css` 等），Penpot 是同步目标。

## 0. 前置检查清单

每次操作 Penpot 前按顺序确认：

1. 当前 MCP 服务器名称固定为 `mcp_penpot`，可用工具：
   - `execute_code`：在 Penpot 插件上下文执行 JavaScript（核心工具）
   - `high_level_overview`：返回高层 API 概览（每个会话只读一次即可，内容本手册已覆盖）
   - `penpot_api_info`：查询任意类型/成员的 API 文档
   - `export_shape`：导出形状为图片
2. 用户必须在 Penpot 里打开目标文件，并通过 `File → MCP Server → Connect` 连接插件。
3. MCP 只作用于**当前聚焦的页面**，同一时间只能有一个 Penpot 标签页持有 MCP。
4. 写入是真实改动文件，先跑只读验证连通，再描述改动、分步执行。

只读连通测试：

```javascript
return {
  pages: penpotUtils.getPages(),
  currentPage: penpot.currentPage?.name,
  selection: penpot.selection.length
};
```

## 1. 三个可用工具的调用方式

调用统一走 `run_mcp`，`server_name` 固定 `mcp_penpot`，参数放在 `args` 对象里。

### execute_code

```json
{ "code": "return penpotUtils.getPages();" }
```

代码在插件上下文执行，可访问全局对象 `penpot`、`penpotUtils`、`storage`。
- 用 `return` 返回任意 JS 对象，不要 `JSON.stringify`。
- `console.log` 会单独返回，绝不要同时 log 和 return 同一份数据。
- `storage` 跨调用持久化，中间结果、可复用函数都存这里。
- 代码是函数体，不是模块；异常消息会直接返回。

### penpot_api_info

```json
{ "type": "TokenSet" }
{ "type": "TokenSet", "member": "addToken" }
```

不确定某个类型的字段或方法时再查；常用类型本手册第 5 节已整理。

## 2. 全局对象速查

### penpot（Penpot 类型）

常用成员：
- `penpot.root`：当前页面根形状
- `penpot.currentPage`：当前 Page
- `penpot.currentFile`：当前 File
- `penpot.selection`：用户选中的形状数组（读后立刻存 `storage`，因为选择可能变化）
- `penpot.library`：`LibraryContext`
  - `penpot.library.local`：本文件库（颜色/字体/组件/token 都写这里）
  - `penpot.library.connected`：已连接的外部库
- `penpot.fonts`：字体上下文，`penpot.fonts.findByName("...")`
- `penpot.history`：历史上下文
- `penpot.theme`：当前主题
- `penpot.viewport`：视口控制

创建形状（创建后需 appendChild 到父级才会出现在画布）：
- `penpot.createBoard()`、`createRectangle()`、`createEllipse()`、`createText(text)`、`createPath()`
- `penpot.createShapeFromSvg(svgString)`：从 SVG 字符串建形状（图标首选）
- `penpot.group(shapes)`、`penpot.createVariantFromComponents(boards)`
- `penpot.createPage()`

导出/代码生成：
- `penpot.generateMarkup(shapes, { type: "html" | "svg" })`
- `penpot.generateStyle(shapes, { type: "css", includeChildren: true })`
- `shape.export(config)`：返回 `Uint8Array`

### penpotUtils（必须优先用，不要自己实现）

- `getPages()`：`{id, name}[]`
- `getPageById(id)` / `getPageByName(name)`
- `findShapeById(id)`
- `findShape(predicate, root?)`：找第一个；root 不传则全局搜
- `findShapes(predicate, root?)`：找全部
- `shapeStructure(shape, maxDepth?)`：返回 `{id, name, type, children?, layout?}` 树
- `isContainedIn(shape, container)`
- `setParentXY(shape, parentX, parentY)`：相对父级定位（parentX/parentY 只读）
- `analyzeDescendants(root, evaluator, maxDepth?)`：遍历后代收集结果

常用查找谓词：
```javascript
// 所有文本
penpotUtils.findShapes(s => s.type === 'text', penpot.root);
// 所有图片
penpotUtils.findShapes(s => s.type === 'image' || s.fills?.some(f => f.fillImage), penpot.root);
// 按名称找
penpotUtils.findShape(s => s.name === 'Button/Primary');
```

## 3. 文件/页面结构

设计层级：File → Page → root Shape → Board / Group / 基础形状。

形状类型（`shape.type`）：
`board`、`group`、`rectangle`、`ellipse`、`path`、`text`、`image`、`boolean`、`svg-raw`。

Page API：
- `page.root`：根形状
- `page.findShapes({ name?, nameLike?, type? })`
- `page.getShapeById(id)`

## 4. 形状通用属性与操作

位置尺寸：
- `x`、`y`：页面绝对坐标，可写
- `parentX`、`parentY`、`boardX`、`boardY`：只读，相对坐标
- `width`、`height`、`bounds`：只读，改尺寸必须用 `shape.resize(w, h)`
- `center`：只读中心点

可写样式：
- `name`
- `fills: Fill[]`：设置时整体替换数组（数组元素只读，不能改单项）
  - 实色：`{ fillColor: "#FF0000", fillOpacity: 1 }`
  - 无填充：`[]`
  - 颜色必须大写 hex（如 `#FF5533`）
- `strokes: Stroke[]`
- `shadows: Shadow[]`
- `borderRadius`（统一）或 `borderRadiusTopLeft` 等四角
- `opacity`、`rotation`、`blendMode`、`blur`
- `hidden`、`visible`、`blocked`
- `flipX`、`flipY`
- `constraintsHorizontal`：`left|right|center|leftright|scale`
- `constraintsVertical`：`top|bottom|center|topbottom|scale`

层级：
- 父级 `children` 数组顺序即 z-order
- `bringToFront()`、`sendToBack()`、`bringForward()`、`sendBackward()`
- `setParentIndex(index)`

结构：
- `parent`：父形状（root 为 null）
- `parent.appendChild(shape)` / `parent.insertChild(index, shape)`：会自动从旧父级移除，保留绝对坐标
- `shape.clone()`：深拷贝
- `shape.remove()`：永久删除（组件资产内的后代会被改为不可见而非删除）

Fill 完整字段：
```
{ fillColor?, fillOpacity?, fillColorGradient?, fillColorRefFile?, fillColorRefId?, fillImage? }
```

Shadow 完整字段：
```
{ id?, style?: "drop-shadow"|"inner-shadow", offsetX?, offsetY?, blur?, spread?, hidden?, color? }
```
注意 CSS 的 `0 4px 12px 0 rgba(...)` 要拆成 offsetX=0, offsetY=4, blur=12, spread=0。

## 5. 关键类型参考

### Text 形状

- `characters`：文本内容
- `fontSize`：字符串如 `"14"`（resize 不改字号，只改 bounding box）
- `fontFamily`、`fontWeight`、`fontStyle`、`fontId`、`fontVariantId`
- `lineHeight`、`letterSpacing`
- `align`：`left|center|right|justify`
- `verticalAlign`：`top|center|bottom`
- `growType`：`fixed|auto-width|auto-height`；调 resize 会重置为 fixed，需重新设回
- `textBounds`：实际渲染边界（只读）
- `getRange(start, end)`：取字符区间做局部样式
- `applyTypography(typography)`：应用库字体样式

字体发现：
```javascript
const font = penpot.fonts.findByName("system-ui"); // 未必存在
const weights = font?.variants.map(v => v.fontWeight);
// 也可用 font.applyToText(text, variant)
```
注意 `com-design` 用系统字体栈 `system-ui, -apple-system, Segoe UI, Roboto, sans-serif`，
Penpot 里按平台实际匹配字体设置 fontFamily，不同设备字形有差异是预期。

### Board

画板，是组件、变体容器、Auto Layout 容器的基础。
- `clipContent`、`showInViewMode`
- `flex`、`grid`：布局系统
- `addFlexLayout()` / `addGridLayout()`：已有子元素时用 `penpotUtils.addFlexLayout(container, dir)` 保留顺序
- `horizontalSizing`、`verticalSizing`：`fix|auto`
- `guides`、`rulerGuides`
- `tokens`：各属性可绑定的 token 名字符串（见第 7 节）
- 组件相关：`isComponentRoot()`、`component()`、`detach()`、`combineAsVariants(ids)`

### Flex Layout

```javascript
board.addFlexLayout();           // 空画板
penpotUtils.addFlexLayout(board, "row"); // 已有子元素时用这个
board.flex.dir = "row";           // row|column|row-reverse|column-reverse
board.flex.rowGap = 8;
board.flex.columnGap = 12;
board.flex.alignItems = "center";
board.flex.justifyContent = "space-between";
board.flex.topPadding = 16;       // 或 verticalPadding / horizontalPadding
board.flex.horizontalSizing = "auto"; // fix|auto|fill
```
Flex 布局下子元素位置由布局控制，不要手动设 x/y（除非 `child.layoutChild.absolute = true`）。
子元素布局属性在 `child.layoutChild`：
- `absolute`、`topMargin/rightMargin/bottomMargin/leftMargin`
- `verticalSizing/horizontalSizing`、`minWidth/maxWidth/minHeight/maxHeight`
- `zIndex`

### Grid Layout

- `board.addGridLayout()`，`board.grid.rows/columns/rowGap/columnGap`
- `board.grid.appendChild(shape, row, column)`（行列从 1 开始）
- 单元格属性 `shape.layoutCell`

## 6. 库资产：颜色、字体、组件

本文件库：`penpot.library.local`（类型 `Library`）。

### 颜色样式

```javascript
const c = penpot.library.local.createColor();
c.name = "Brand/500";        // 用 "/" 分组
c.path = "Brand";            // 可选分组路径
c.color = "#5B5EF7";         // 大写 hex
c.opacity = 1;
```

`asFill()` / `asStroke()` 可直接转成 Fill/Stroke 用在形状上。

### 字体样式

```javascript
const t = penpot.library.local.createTypography();
t.name = "Heading";
t.fontFamily = "system-ui";
t.fontSize = "18";
t.fontWeight = "600";
t.lineHeight = "24";
t.letterSpacing = "0";
// t.fontStyle = "normal"; t.textTransform = null;
t.applyToText(textShape);
```

### 组件

```javascript
// 把画板注册为组件
const comp = penpot.library.local.createComponent([boardShape]);
// 实例化
const inst = comp.instance();          // 返回 Shape
// 主实例（用来编辑组件源）
const main = comp.mainInstance();
```

组件相关判断（在 Shape 上）：
- `isComponentRoot()`、`isComponentHead()`、`isComponentInstance()`
- `isComponentMainInstance()`、`isComponentCopyInstance()`
- `component()`：返回所属 `LibraryComponent`
- `detach()`：脱离组件
- `swapComponent(comp)`：切换组件
- `resetOverrides()`

### 变体（Variants）

```javascript
// 多个组件画板合并为变体容器
const vc = penpot.createVariantFromComponents([board1, board2]);
// vc 是 VariantContainer，其 .variants 是 Variants
vc.variants.addProperty();      // 新增一个变体属性
vc.variants.renameProperty(0, "variant");
vc.variants.addVariant();       // 新增变体
vc.variants.currentValues("variant"); // 当前值列表
// 实例切换变体
instance.switchVariant(0, "primary");
```

## 7. Design Tokens

这是对齐 `com-design` 的核心。Token 目录在 `penpot.library.local.tokens`（`TokenCatalog`）。

### 结构

```
TokenCatalog
├── themes: TokenTheme[]      主题（一组激活的 set）
└── sets: TokenSet[]          token 分组
    └── tokens: Token[]
```

### Token 类型（TokenType）

```
borderRadius | shadow | color | dimension | fontFamilies | fontSizes |
fontWeights | letterSpacing | number | opacity | rotation | sizing |
spacing | borderWidth | textCase | textDecoration | typography
```

### 创建 set / theme / token

```javascript
const cat = penpot.library.local.tokens;

// 建 set
const core = cat.addSet({ name: "core", active: true });
const light = cat.addSet({ name: "light", active: true });
const dark = cat.addSet({ name: "dark", active: false });

// 建主题组
const scheme = cat.addTheme({ group: "color-scheme", name: "Light" });
scheme.addSet(core);
scheme.addSet(light);
const darkTheme = cat.addTheme({ group: "color-scheme", name: "Dark" });
darkTheme.addSet(core);
darkTheme.addSet(dark);
// 同组同时只能有一个主题激活

// 加 token：值一律传字符串（数字也会被转成字符串）
core.addToken({ type: "spacing", name: "space-4", value: "4" });      // 或 "4px"
core.addToken({ type: "borderRadius", name: "radius-sm", value: "8" });
core.addToken({ type: "sizing", name: "control-height", value: "40" });
light.addToken({ type: "color", name: "color-primary", value: "#5B5EF7" });
dark.addToken({ type: "color", name: "color-primary", value: "#7B7EF8" });
```

`addToken` 的 value 接受 `string | number | string[]`，底层统一存字符串。

### 各类 token 值格式

- 数值类（spacing/sizing/borderRadius/borderWidth/fontSizes/fontWeights/letterSpacing/opacity/rotation/dimension/number）：传 `"4"` 或 `"4px"`、`"600"`、`"0"` 等纯数字字符串。
- color：大写 hex `"#5B5EF7"`。
- shadow：shadow token 的 value 可传字符串或 `TokenShadowValueString[]`。落值时优先用 `shape.shadows = [...]` 直接设 Shadow 对象数组，shadow token 用于可绑定引用。
- typography：传 `TokenTypographyValueString`（含 fontFamily/fontSize/fontWeight/lineHeight 等字段）；不确定字段时用 `penpot_api_info` 查 `TokenTypographyValueString`。

### 绑定 token 到形状

形状有一个 `tokens` 对象，属性填 token 名字符串即可绑定：

```javascript
board.tokens.fill = "color-surface";
board.tokens.borderRadiusTopLeft = "radius-md";
text.tokens.typography = "type-heading";
text.tokens.fill = "color-text-primary";
board.tokens.rowGap = "space-4";
board.tokens.paddingLeft = "space-16";
```

`tokens` 对象可绑定的属性（Board/Rectangle 等都有）：
```
width, height, fill, x, y, all,
borderRadiusTopLeft/TopRight/BottomRight/BottomLeft,
shadow, strokeColor, strokeWidth,
fontFamilies, fontSize, fontWeight, letterSpacing,
rotation, opacity,
layoutItemMinW/MaxW/MinH/MaxH,
rowGap, columnGap,
paddingLeft/Top/Right/Bottom, marginLeft/Top/Right/Bottom,
textCase, textDecoration, typography
```

也可以用 `shape.applyToken(token, properties?)` 批量绑定。

## 8. com-design → Penpot 映射约定

真相源 `colors_and_type.css` 有双层命名：`--com-*`（源）和 `--color-*`/`--space-*`/`--radius-*`/`--type-*`（消费层）。

Penpot 侧落法：

| CSS 层 | Penpot 落法 |
|---|---|
| `--com-neutral-*`、`--com-brand-*` 等原始色阶 | 颜色样式，用路径分组（如 `Neutral/500`），同时建 color token |
| `--color-*` 消费层 | color token，命名去掉 `--color-` 前缀（如 `color-primary`） |
| `--space-*` | spacing token |
| `--radius-*` | borderRadius token |
| `--type-*` | typography token + 库字体样式 |
| `--com-elevation-*` | shadow token |
| `--size-*` | sizing token |
| `.dark` 覆盖值 | 独立 dark token set |

建议的 set 规划：
- `core`：spacing、sizing、radius、borderWidth、fontSizes/Weights、shadow、typography（两主题共用，始终激活）
- `light`：所有 color token 的亮色值
- `dark`：所有 color token 的暗色值
- 主题组 `color-scheme`：`Light`（core+light）、`Dark`（core+dark）

幂等同步约定（换机/更新时不产生重复）：
- 每个 Penpot 资产的 `setPluginData("com-design", "source-id", "<id>")` 写入源标识
- 同步前先扫描现有资产按 source-id 匹配：存在则更新值，不存在才建
- 颜色 source-id 用 CSS 变量名（如 `com-brand-500`）；组件用 slug

CSS `var()` 必须递归解析成具体值后再写入 Penpot，Penpot token 不接受 CSS var 引用。

## 9. 常用操作片段

### 新建画板

```javascript
const board = penpot.createBoard();
board.name = "Button/Primary";
board.x = 0; board.y = 0;
board.resize(120, 40);
board.fills = [{ fillColor: "#5B5EF7", fillOpacity: 1 }];
board.borderRadius = 8;
penpot.root.appendChild(board);
```

### 从 SVG 建图标

```javascript
const svg = `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">...</svg>`;
const icon = penpot.createShapeFromSvg(svg);
icon.name = "icon/check";
board.appendChild(icon);
```

### 批量读当前页结构

```javascript
return penpotUtils.shapeStructure(penpot.root, 3);
```

### 列出现有库资产

```javascript
const lib = penpot.library.local;
return {
  colors: lib.colors.map(c => ({ id: c.id, name: c.name, color: c.color })),
  typographies: lib.typographies.map(t => ({ id: t.id, name: t.name })),
  components: lib.components.map(c => ({ id: c.id, name: c.name })),
  tokenSets: lib.tokens.sets.map(s => ({ name: s.name, active: s.active, count: s.tokens.length })),
  themes: lib.tokens.themes.map(t => ({ group: t.group, name: t.name, active: t.active }))
};
```

### 用 source-id 做幂等查找

```javascript
function findBySourceId(lib, sourceId) {
  return lib.colors.find(c => c.getPluginData("com-design") === sourceId)
    || lib.typographies.find(t => t.getPluginData("com-design") === sourceId)
    || lib.components.find(c => c.getPluginData("com-design") === sourceId);
}
```

## 10. 注意事项与坑

- 颜色 hex 必须大写：`#5B5EF7`，不要小写。
- `fills/strokes/shadows` 数组元素只读，改样式要整体替换数组。
- `width/height` 只读，必须用 `resize()`。
- parentX/parentY/boardX/boardY 只读，相对定位用 `penpotUtils.setParentXY`。
- 已有子元素的画板加 FlexLayout 要用 `penpotUtils.addFlexLayout`，否则子元素顺序会乱。
- Text 调 `resize()` 会把 `growType` 重置为 fixed，需要 auto 尺寸时重新设回。
- 一次只能一个 Penpot 标签页持 MCP；换页面/文件会改变 MCP 作用对象。
- 远程 MCP 不支持 `import_image` 本地路径导入；`export_shape` 也不能直接写本地磁盘。
- 写入前先只读验证；大改动拆成可回滚的小步。
- 不要把 `console.log` 和 `return` 用于同一份数据，会收到两份。
- `metadata.json` 是工程文件，不要手动创建或修改。
