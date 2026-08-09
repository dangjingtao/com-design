# 卡博士诗得丽 App — 设计协作文档

本目录是“卡博士诗得丽”移动端 App 的 Penpot 设计任务协作文件，供跨线程/跨会话接力使用。

## 文档说明

- penpot-工作方法.md：工作方法与底线（交付立场、视觉闭环、对照核查、跨线程交接协议）。
- 项目约定.md：本项目的具体事实（文件/库、token 用法、范围顺序、交互与设备框、踩坑记录、新线程开场话术）。
- 工作台账.md：72 屏逐屏进度表、批次划分、新增组件登记、待确认问题。每个线程做完必须更新。

技术层面的 Penpot MCP API 操作手册在上级目录：../PENPOT_MCP_PLAYBOOK.md。

## 新线程开工流程

1. 读本目录三份文档 + ../PENPOT_MCP_PLAYBOOK.md。
2. 在 Penpot 打开目标文件“卡博士”，MCP Connect here。
3. 确认能读到共享库 com-design-v1 的组件与 token（读不到先在素材面板启用/接受库更新）。
4. 从工作台账第一个未完成页面开始，直接用库组件与 token，不硬编码数值。
5. 每屏走视觉闭环：写代码 → 导出 PNG → 对照原型核查 → 改。
6. 做完一批：更新台账状态 → 提交到本仓库 dev 分支。

## 关键链接

- 原型（Mockplus）：https://rp.mockplus.cn/run/AscSuKkzW-/i6VzPr-_v4/cyiNGErb3
- Penpot 目标文件“卡博士”：team 81f57451-85cc-819d-8008-7097b210c59a，file 3be9e5e1-190f-8090-8008-74d44422f05d
- 共享库：com-design-v1（file 3be9e5e1-190f-8090-8008-736cfb2f9bcd）
