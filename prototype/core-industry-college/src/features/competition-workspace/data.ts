export type WorkshopLifecycle = "notStarted" | "inProgress" | "ended";
export type MaterialKey = "projectBrief" | "competitorScreens" | "operationData" | "brandAssets" | "pitchDraft";

export type CompetitionTeam = {
  id: string;
  name: string;
  role: string;
  members: { name: string; role: string; school: string }[];
};

export type CompetitionProject = {
  id: string;
  name: string;
  track: string;
  summary: string;
  currentStage: string;
  mentor: string;
};

export type CompetitionResource = {
  id: string;
  title: string;
  category: "规则" | "模板" | "资料";
  description: string;
  updatedAt: string;
};

export type WorkshopSkill = {
  id: "s1" | "s2" | "s3" | "s4" | "s5" | "s6";
  code: string;
  name: string;
  summary: string;
  capabilities: string[];
  taskIds: string[];
};

export type WorkshopTask = {
  id: string;
  skillId: WorkshopSkill["id"];
  title: string;
  summary: string;
  prompt: string;
  helper: string;
  computeCost: number;
  requiredMaterials: MaterialKey[];
  resultId: string;
};

export type WorkshopResultTemplate = {
  id: string;
  taskId: string;
  title: string;
  summary: string;
  highlights: string[];
  nextSuggestion: string;
};

export type CompetitionWorkspaceData = {
  competitionId: string;
  team: CompetitionTeam;
  project: CompetitionProject;
  resources: CompetitionResource[];
};

export const materialLabels: Record<MaterialKey, string> = {
  projectBrief: "项目简介",
  competitorScreens: "竞品截图 / 链接",
  operationData: "近 7 天经营数据",
  brandAssets: "品牌与商品素材",
  pitchDraft: "现有路演稿",
};

export const workspaceData: Record<string, CompetitionWorkspaceData> = {
  "sanchuang-16": {
    competitionId: "sanchuang-16",
    team: {
      id: "team-1",
      name: "山城新零售队",
      role: "队长",
      members: [
        { name: "林晓", role: "队长 / 项目统筹", school: "华南商贸学院" },
        { name: "陈语", role: "内容运营", school: "华南商贸学院" },
        { name: "周越", role: "数据分析", school: "华南商贸学院" },
      ],
    },
    project: {
      id: "project-1",
      name: "岭南植物精粹校园新零售计划",
      track: "美妆电商 / 新零售",
      summary: "围绕岭南植物成分、校园内容种草与私域复购，验证年轻消费者的产品与渠道组合。",
      currentStage: "项目诊断与运营验证",
      mentor: "许老师",
    },
    resources: [
      { id: "rules-2026", title: "第十六届三创赛参赛规则", category: "规则", description: "报名、团队、赛道、材料与评审基础规则。", updatedAt: "2026-08-12" },
      { id: "pitch-template", title: "路演 PPT 结构模板", category: "模板", description: "问题、方案、市场、运营、财务与团队的基础路演结构。", updatedAt: "2026-08-15" },
      { id: "beauty-research", title: "美妆新零售赛道资料包", category: "资料", description: "赛道背景、用户趋势、内容电商与案例资料。", updatedAt: "2026-08-16" },
    ],
  },
  "sanchuang-15": {
    competitionId: "sanchuang-15",
    team: {
      id: "team-archive",
      name: "历史参赛团队",
      role: "成员",
      members: [{ name: "林晓", role: "运营", school: "华南商贸学院" }],
    },
    project: {
      id: "project-archive",
      name: "历史项目摘要",
      track: "电子商务",
      summary: "赛事已结束，仅保留历史信息用于赛后 handoff。",
      currentStage: "赛事已结束",
      mentor: "—",
    },
    resources: [{ id: "archive-rules", title: "历史赛事规则", category: "规则", description: "赛事期资料只读。", updatedAt: "2025-08-20" }],
  },
};

export const workshopSkills: WorkshopSkill[] = [
  {
    id: "s1",
    code: "S1",
    name: "项目洞察",
    summary: "先判断产品和方向值不值得继续投入。",
    capabilities: ["选品评分", "方向研判", "竞品分析", "用户需求洞察"],
    taskIds: ["s1-product-score"],
  },
  {
    id: "s2",
    code: "S2",
    name: "项目诊断",
    summary: "用结构化问题检查项目真实性、市场与商业模式。",
    capabilities: ["真实性自测", "用户画像", "市场可行性", "商业模式", "竞争分析"],
    taskIds: ["s2-market-feasibility"],
  },
  {
    id: "s3",
    code: "S3",
    name: "平台运营",
    summary: "把定位转成文案、图文、短视频、直播和客服表达。",
    capabilities: ["账号定位", "文案", "图文", "短视频", "直播", "客服话术"],
    taskIds: ["s3-copy-kit", "s3-visual-kit"],
  },
  {
    id: "s4",
    code: "S4",
    name: "数据复盘",
    summary: "从经营结果里找原因和下一轮增长动作。",
    capabilities: ["经营周报", "转化漏斗", "投放复盘", "用户行为", "增长机会"],
    taskIds: ["s4-weekly-review"],
  },
  {
    id: "s5",
    code: "S5",
    name: "项目冲刺",
    summary: "按赛事评分标准预检项目并准备路演。",
    capabilities: ["评分预检", "材料补缺", "路演 PPT", "答辩准备"],
    taskIds: ["s5-score-precheck", "s5-pitch-ppt"],
  },
  {
    id: "s6",
    code: "S6",
    name: "职业规划",
    summary: "把赛事表现转成求职表达与机会匹配。",
    capabilities: ["职业顾问", "面试准备", "公司推荐", "简历亮点"],
    taskIds: ["s6-company-match"],
  },
];

export const workshopTasks: WorkshopTask[] = [
  {
    id: "s1-product-score",
    skillId: "s1",
    title: "完成选品评分与方向研判",
    summary: "对核心产品、目标用户和竞品差异做一轮基础判断。",
    prompt: "请补充你们当前最想验证的产品、目标用户和核心差异。",
    helper: "可直接写团队当前真实判断，不需要完整商业计划书。",
    computeCost: 8,
    requiredMaterials: ["projectBrief"],
    resultId: "result-s1-product-score",
  },
  {
    id: "s2-market-feasibility",
    skillId: "s2",
    title: "完成市场可行性诊断",
    summary: "检查需求真实性、目标人群、竞争和商业模式是否站得住。",
    prompt: "目前有哪些真实用户反馈、竞品证据和成交/咨询信号？",
    helper: "优先写已经发生的事实；没有数据的地方可以明确写“尚未验证”。",
    computeCost: 12,
    requiredMaterials: ["projectBrief", "competitorScreens"],
    resultId: "result-s2-market-feasibility",
  },
  {
    id: "s3-copy-kit",
    skillId: "s3",
    title: "生成平台运营文案包",
    summary: "围绕账号定位生成标题、详情页、短视频、直播与客服话术。",
    prompt: "这轮内容最重要的运营目标是什么？请说明平台、产品和希望用户采取的动作。",
    helper: "例如：小红书种草、抖音短视频转化、直播间首购。",
    computeCost: 10,
    requiredMaterials: ["projectBrief"],
    resultId: "result-s3-copy-kit",
  },
  {
    id: "s3-visual-kit",
    skillId: "s3",
    title: "准备图文 / 视频内容方案",
    summary: "根据已有品牌与商品素材生成内容镜头和视觉方向。",
    prompt: "请说明现有素材、不可修改元素和希望生成的内容形式。",
    helper: "需要先补齐品牌与商品素材。",
    computeCost: 18,
    requiredMaterials: ["brandAssets"],
    resultId: "result-s3-visual-kit",
  },
  {
    id: "s4-weekly-review",
    skillId: "s4",
    title: "生成经营周报与增长复盘",
    summary: "把流量、转化、投放和用户行为合并成可执行周报。",
    prompt: "请补充本周关键数据变化，以及团队认为最异常的一个指标。",
    helper: "需要先上传或录入近 7 天经营数据。",
    computeCost: 14,
    requiredMaterials: ["operationData"],
    resultId: "result-s4-weekly-review",
  },
  {
    id: "s5-score-precheck",
    skillId: "s5",
    title: "按赛事评分标准做预检",
    summary: "提前发现创新性、真实性、商业性和现场表达的明显缺口。",
    prompt: "你最担心评委质疑哪一项？请写出目前团队的回答。",
    helper: "预检只用于团队准备，不替代正式赛事评审。",
    computeCost: 9,
    requiredMaterials: ["projectBrief"],
    resultId: "result-s5-score-precheck",
  },
  {
    id: "s5-pitch-ppt",
    skillId: "s5",
    title: "整理路演 PPT 结构",
    summary: "根据路演时长和现有材料整理答辩叙事。",
    prompt: "请说明预计路演时长、现有 PPT 情况和最想强化的部分。",
    helper: "若已有初稿，补齐后可获得更具体的改稿建议。",
    computeCost: 16,
    requiredMaterials: ["pitchDraft"],
    resultId: "result-s5-pitch-ppt",
  },
  {
    id: "s6-company-match",
    skillId: "s6",
    title: "生成公司与岗位方向建议",
    summary: "结合比赛表现和职业偏好，整理可探索的公司与岗位方向。",
    prompt: "请说明偏好的行业、城市和希望继续发挥的能力。",
    helper: "结果仅作为职业探索建议，是否投递由学生自己决定。",
    computeCost: 6,
    requiredMaterials: ["projectBrief"],
    resultId: "result-s6-company-match",
  },
];

export const resultTemplates: WorkshopResultTemplate[] = [
  {
    id: "result-s1-product-score",
    taskId: "s1-product-score",
    title: "选品评分与方向研判",
    summary: "核心方向可以继续验证，但“植物成分”需要从概念差异转成用户可感知的购买理由。",
    highlights: ["目标人群相对清晰：18–24 岁校园女性", "内容场景与校园试用天然匹配", "竞品差异目前仍偏叙事，需要真实样本验证"],
    nextSuggestion: "进入 S2 市场可行性诊断，补足竞品证据和真实用户反馈。",
  },
  {
    id: "result-s2-market-feasibility",
    taskId: "s2-market-feasibility",
    title: "市场可行性诊断报告",
    summary: "用户需求存在，但目前证据主要来自定性访谈，建议把首购与复购拆开验证。",
    highlights: ["需求真实性：中", "竞争强度：高", "团队执行基础：较好", "下一轮优先动作：补 20 个真实用户样本"],
    nextSuggestion: "选择 S3 平台运营任务，把当前价值主张转成可测试内容。",
  },
  {
    id: "result-s3-copy-kit",
    taskId: "s3-copy-kit",
    title: "平台运营文案包",
    summary: "已生成账号定位、标题方向、详情页结构、短视频脚本、直播开场与客服话术。",
    highlights: ["账号定位：成分真实 + 校园试用", "短视频首句优先展示使用场景", "直播话术避免只讲植物概念，先讲具体肤感问题"],
    nextSuggestion: "补齐品牌素材后，可继续生成 S3 图文 / 视频内容方案。",
  },
  {
    id: "result-s3-visual-kit",
    taskId: "s3-visual-kit",
    title: "图文 / 视频内容方案",
    summary: "围绕产品质地、校园场景和成分证据组织 3 套内容镜头。",
    highlights: ["产品近景用于建立质感", "宿舍 / 校园环境强化真实使用", "成分证据只作为辅助，不单独做大段科普"],
    nextSuggestion: "执行一轮内容测试后，进入 S4 数据复盘。",
  },
  {
    id: "result-s4-weekly-review",
    taskId: "s4-weekly-review",
    title: "经营周报与数据复盘",
    summary: "流量增长没有同步带来成交，主要损耗发生在详情页到加购。",
    highlights: ["曝光 +32%", "加购率下降 18%", "新客首购比复购更弱", "建议先调整首购利益点，再扩大投放"],
    nextSuggestion: "完成调整后再跑一周数据，避免一次性改太多变量。",
  },
  {
    id: "result-s5-score-precheck",
    taskId: "s5-score-precheck",
    title: "赛事评分预检",
    summary: "真实性证据和商业闭环仍是最可能被追问的部分。",
    highlights: ["创新表达：较清楚", "真实交易证据：偏弱", "团队分工：完整", "答辩风险：竞品差异解释过于抽象"],
    nextSuggestion: "补齐证据后，继续整理路演 PPT。",
  },
  {
    id: "result-s5-pitch-ppt",
    taskId: "s5-pitch-ppt",
    title: "路演 PPT 结构建议",
    summary: "建议把 8 分钟路演压缩为 9 页主叙事，证据页集中回答真实性与增长逻辑。",
    highlights: ["前 90 秒讲问题与用户", "中段用真实数据证明执行", "结尾明确下一阶段资源需求"],
    nextSuggestion: "按结构修改后再做一次计时演练。",
  },
  {
    id: "result-s6-company-match",
    taskId: "s6-company-match",
    title: "公司与岗位方向建议",
    summary: "赛事中体现出的内容运营与数据复盘能力，更适合品牌增长、内容电商和运营分析方向。",
    highlights: ["优先探索：品牌增长实习", "可补强：结构化数据表达", "城市偏好：广州 / 深圳", "结果仅用于学生本人职业探索"],
    nextSuggestion: "赛后可从长期资产进入平台简历，再自主选择是否投递。",
  },
];

export const skillById = (id?: string) => workshopSkills.find(item => item.id === id);
export const taskById = (id?: string) => workshopTasks.find(item => item.id === id);
export const resultById = (id?: string) => resultTemplates.find(item => item.id === id);
export const resourceById = (competitionId?: string, resourceId?: string) => workspaceData[competitionId ?? ""]?.resources.find(item => item.id === resourceId);
