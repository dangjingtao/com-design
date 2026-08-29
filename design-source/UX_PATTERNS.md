# Com Design Core UX Patterns

> Status: Release Candidate / Core  
> Scope: Company Mobile Core  
> Canonical machine source: `specs/core-patterns.json`  
> Pattern count: 6  
> Core Component count remains: 33

Com Design 的 Pattern 层用于描述**多个 Core Component 如何共同解决一个重复出现的用户任务**。Pattern 不是新组件，也不允许把某个业务项目的状态枚举、页面名或领域词带回 Core。

## 1. Status Composition｜状态组合

用于把状态表达从“一个彩色 Tag”提升到完整可理解的信息结构。

基本结构：

```text
状态
→ 必要解释
→ 可选证据 / 元信息
→ 可选下一步或恢复动作
```

原则：状态必须可被文字独立理解；颜色只强化，不独占语义。不要同时用同色 Card、Tag、icon block 和 Button 重复制造视觉重量。

## 2. Search Pattern｜搜索

用于以一个清晰查询入口完成检索，并正确表达 loading / zero-result / error。

重点不是 Search Field 本身，而是：

- 查询是否提交；
- 结果状态如何反馈；
- 进入详情再返回时是否保留搜索意图；
- 搜索区域是否保持中性，不抢占内容层级。

## 3. Collection Filter｜集合筛选

用于移动端列表、卡片流、机会、订单、项目等集合的筛选。

推荐结构：

```text
关键词（可选） + 筛选触发器
→ Bottom Sheet / Dialog 中编辑 draft
→ 确认后提交
→ 已生效条件可回显 / 移除
→ 结果反馈
```

Committed state 由集合页面持有；浮层只持有尚未确认的 draft。详情返回后，在任务仍连续时应保留已提交筛选条件。

## 4. State to Action｜状态到动作

用于账号、权限、资格、审核、生命周期、流程状态等复杂场景。

基本结构：

```text
现在是什么状态
→ 为什么
→ 现在最应该 / 可以做什么
→ 其它恢复或次要动作
```

**Primary 是稀缺层级信号。** 页面不能因为存在多个可点击操作，就生成多个同等级实心主按钮。

Pending / Rejected / Blocked / Expired / Completed 等状态需要解释主路径为什么改变或消失。不要用一个 disabled Primary 代替解释。

## 5. Intent Continuity / Handoff｜意图连续与回流

用于登录、授权、响应式 Web、第三方系统、跨 App 等会暂时打断当前任务的流程。

基本结构：

```text
原始任务
→ 暂时中断 / handoff
→ 携带最小必要上下文
→ 结果映射回原业务主体
→ 回到原任务继续
```

return target 必须安全校验；callback 不应创建第二份业务状态；失败、取消、拒绝、冲突都必须有明确出口。

## 6. Contextual Next Step｜上下文下一步

用于长期任务、审批、课程、项目、工单、赛事、任务 Runtime 等存在阶段性的流程。

它回答一个问题：

> **我现在最该做什么？**

推荐结构：

```text
当前上下文
→ 当前进度 / 状态
→ 一个下一步
→ 次要目的地
```

进度和下一步应从权威业务状态派生，不在工作台、首页或任务中心再复制一套状态真相。流程结束后，如果结果、记录或资产仍有长期价值，应自然交给长期结果 / 历史 / 资产入口。

---

## Pattern 与 Component 的边界

以下情况优先做 Pattern，而不是新增 Core Component：

- 由多个现有组件组合即可表达；
- 主要难点是状态、层级、顺序、回流或上下文；
- 不同业务对象可以复用同一交互逻辑；
- 新增一个“万能业务卡片”只会把产品语义塞进 Core。

以下情况才考虑新增 Core Component：

- 有稳定、可复用的独立控件语义；
- anatomy、states、interaction 可以独立定义；
- 多个产品会以同样的组件身份消费它；
- 不是为了减少某个项目里的几行组合代码。

## Color / Action discipline

Pattern 层继续服从 Com Design 的颜色剂量原则：

- Brand-filled area 是层级资源，不是装饰资源；
- 通常一个 view / action group 只有一个最高优先级 Primary；
- Secondary 默认中性 surface；
- Info 默认中性容器 + 品牌前景；
- 状态色只表达真实状态；
- 不通过堆叠彩色容器来制造“丰富感”。

详细机器契约以 `specs/core-patterns.json` 为准。
