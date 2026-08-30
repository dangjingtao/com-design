# V2 Candidate — Incremental Loading / Infinite List

> Status: Candidate  
> Scope: Com Design V2  
> Platforms: iOS / Android / WeChat Mini Program / Web-Desktop compatible  
> Decision state: 讨论中；尚未计入正式 Core Component / Composite / UX Pattern 数量。

## Why not call it only “Infinite Scroll”

V2 不建议把能力简单定义为一个 `Infinite Scroll` 组件。

更准确的设计系统能力是：

**Incremental Loading / Infinite List Pattern**

它描述“长集合如何继续取下一段数据”的交互契约；自动触底加载只是其中一种触发策略。

建议支持：

- `automatic`：接近列表末尾时自动请求下一段；
- `manual`：显示明确的 Load More / 加载更多动作；
- 自动模式失败或平台能力受限时，必须能够退化为显式 retry / load-more，而不是让列表无声停止。

## When to use

适合：

- Feed / 动态流；
- 消息、内容、商品、搜索结果等较长集合；
- 用户主要目标是继续浏览，而不是精确跳页。

不应默认用于所有列表：

- 用户需要明确总量、页码或稳定位置引用；
- 需要频繁到达页面 Footer；
- 强任务型管理列表需要批量选择、跨页操作或明确分页边界；
- 数据量很小，分页反而制造额外交互。

设计指引应同时保留 Pagination / Load More 等替代方案。V2 的目标是治理长列表，不是把所有列表都做成无限滚动。

## Shared state contract

跨平台共享状态建议至少包含：

```text
idle
loading-initial
ready
loading-more
load-more-error
end-reached
refreshing (separate refresh behavior)
```

要求：

- initial loading 与 loading-more 必须区分；继续加载时不能把已有内容整体替换成 Skeleton；
- loading-more 默认使用列表尾部 inline progress；
- 请求失败保留已有内容，并在失败位置提供 retry；
- `end-reached` 必须有稳定终止状态，避免重复触发请求；
- 同一 cursor / page 不得因为连续触底事件产生并发重复请求；
- 新旧请求乱序返回时不得打乱集合顺序；
- 推荐 cursor / continuation-token 模型优先于让 UI 依赖裸 page number，但 Core 不绑定后端协议；
- 返回详情页后，应尽量恢复列表数据、筛选条件与 scroll position，不让用户从顶部重新开始；
- Pull to Refresh / 下拉刷新是独立行为：refresh 刷新当前集合，load-more 延长集合，两者不能混成一个 loading 状态。

## Trigger contract

自动加载不应要求“真的滚到底才加载”。

- 使用可配置的 prefetch / threshold 语义，在用户接近末尾时提前加载；
- threshold 使用语义距离或 viewport-relative 策略，由平台 Adapter 映射，不能让业务页面各写一套 magic number；
- 触发器必须有 request-in-flight guard；
- 内容不足一屏时，需要定义是否继续自动补页直到填满可用 viewport，且必须有最大连续请求保护，防止接口异常造成请求循环；
- Filter / Search / Sort 改变时，应重建 continuation state，并明确 scroll restoration 策略。

## Platform mapping

### iOS

V2 只定义行为，不绑定 UITableView / UICollectionView / SwiftUI List 等具体实现。

Adapter 需要处理：

- iOS bounce / overscroll 不得造成重复 load-more；
- Safe Area 与底部 Home Indicator 不得遮挡 loading / retry / end state；
- 动态内容插入后保持视觉 scroll position 稳定；
- VoiceOver 可以感知“正在加载更多”“加载失败”“已无更多内容”，但不能每新增一批 Item 就产生大量打断式播报；
- 与 pull-to-refresh 共存时，顶部 refresh 与底部 incremental loading 状态独立。

### Android

同样不绑定 RecyclerView / Compose LazyColumn 等框架。

Adapter 需要处理：

- overscroll / fling 过程中可能多次进入 threshold，必须去重；
- 快速滚动下应允许提前 prefetch，而不是等滚动停止；
- 新批次插入不应导致 viewport 跳动；
- TalkBack 获得与 iOS 等价的 loading / error / end 语义；
- 系统 Navigation Bar / gesture inset 不遮挡列表尾部状态。

### WeChat Mini Program

小程序必须作为正式目标平台考虑，不能拿 Web 的 IntersectionObserver 思路硬套。

V2 Platform Adapter 应允许映射到两类宿主滚动模型：

1. **Page-level scroll**：使用宿主页面的 reach-bottom 能力；
2. **Contained scroll region**：使用可滚动容器自身的 lower-threshold / scroll-to-lower 等等价能力。

设计约束：

- Core Pattern 不写死具体微信 API 名称，防止宿主 API 演进污染设计系统契约；
- 页面级滚动与内嵌 scroll region 必须二选一明确 ownership，避免嵌套滚动导致触底判断混乱；
- 小程序端尤其需要 request guard，因为 reach-bottom / lower-threshold 可能在快速滚动、内容高度变化时重复触发；
- 列表批次应控制 DOM / node 数量增长，长列表实现必须允许平台侧接入 virtualization / recycling 能力；
- 不要求三端使用同一个 virtualization 实现，只要求视觉、状态与恢复行为一致；
- 网络较差时，已有内容保持可用，底部失败态应提供显式重试，不让用户只能反复上下滚动碰运气。

## Virtualization boundary

**Infinite loading ≠ Virtualization。**

V2 应把两件事分开：

- Incremental Loading：决定什么时候继续取得更多数据；
- Virtualized / Recycling List：决定大量已取得 Item 如何高性能渲染。

但两者需要可组合。

当数据可能增长到数百 / 数千项时，Platform Adapter SHOULD 能接入各平台自己的虚拟化 / recycling 实现；Com Design 不要求用一个跨平台渲染库强行统一。

## Accessibility and usability

- 必须存在可感知的 loading / error / end state；
- 自动加载不能让键盘 / screen-reader 用户永远无法到达列表后的重要操作；如果页面 Footer 有关键动作，应优先避免无限自动加载或提供明确停止 / Load More 策略；
- retry 必须是可聚焦 / 可点击动作；
- 新内容加载后不应抢夺当前 focus；
- 如果集合支持 Index Bar、Filter Bar、Search 等能力，加载更多不能重置 active index / filter / query。

## Candidate classification

当前建议：

- `Incremental Loading`：**Core UX Pattern candidate**，因为它主要治理状态、触发、错误恢复、位置保持和平台差异；
- `Infinite List`：可作为 Composite / implementation pattern candidate，但不急于增加一个独立 Core Component；
- `Virtualized List`：Platform / implementation capability candidate，不直接作为视觉组件计数；
- `Load More`：Incremental Loading 的一种触发 variant，不单独增加组件；
- `Pull to Refresh`：应另行审查，不能因为做 Incremental Loading 就顺手视为已支持。

## Current recommendation

**建议 V2 支持 Incremental Loading，但不把“无限滚动”设成所有长列表的默认行为。**

跨 iOS / Android / 微信小程序统一的是状态模型、触发语义、错误恢复、scroll restoration 与 accessibility；真正的 scroll event、virtualization 与 platform inset 交给各端 Adapter。