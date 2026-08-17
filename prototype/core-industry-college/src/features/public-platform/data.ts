export type Competition = {
  id: string;
  name: string;
  organizer: string;
  summary: string;
  status: "registrationOpen" | "inProgress" | "ended" | "upcoming";
  tags: string[];
  registrationEnds?: string;
  workspaceAvailable?: boolean;
  eligibility?: "eligible" | "ineligible" | "unknown";
};

export type Opportunity = {
  id: string;
  title: string;
  companyId: string;
  city: string;
  mode: "实习" | "校招" | "项目实践";
  summary: string;
  skills: string[];
  status: "open" | "closed";
};

export type Company = {
  id: string;
  name: string;
  industry: string;
  summary: string;
  resourceRelations: { type: "赛事" | "权益" | "课程" | "活动" | "岗位"; title: string; to?: string }[];
};

export const competitions: Competition[] = [
  {
    id: "sanchuang-16",
    name: "第十六届全国大学生电子商务“创新、创意及创业”挑战赛",
    organizer: "三创赛组委会",
    summary: "面向高校学生的创新创业赛事。当前平台重点承接报名、赛事身份、团队与赛后成果沉淀。",
    status: "registrationOpen",
    tags: ["电子商务", "创新创业", "全国赛事"],
    registrationEnds: "报名窗口进行中",
    workspaceAvailable: true,
    eligibility: "eligible",
  },
  {
    id: "innovation-cup-2026",
    name: "2026 青年品牌创新挑战赛",
    organizer: "联合品牌企业",
    summary: "围绕品牌增长与校园消费场景的创新项目挑战，面向在校学生团队开放。",
    status: "upcoming",
    tags: ["品牌", "营销", "团队赛"],
    registrationEnds: "即将开放",
    eligibility: "unknown",
  },
  {
    id: "green-business-2026",
    name: "绿色商业实践赛",
    organizer: "绿色产业合作联盟",
    summary: "聚焦绿色零售、低碳供应链与可持续商业实践。",
    status: "registrationOpen",
    tags: ["绿色商业", "实践"],
    registrationEnds: "剩余 12 天",
    eligibility: "ineligible",
  },
  {
    id: "sanchuang-15",
    name: "第十五届三创赛",
    organizer: "三创赛组委会",
    summary: "历史赛事，保留公开信息；赛事期权限已结束，长期成果仍归学生账号。",
    status: "ended",
    tags: ["历史赛事"],
    workspaceAvailable: true,
    eligibility: "eligible",
  },
];

export const companies: Company[] = [
  {
    id: "northstar-beauty",
    name: "北辰美妆",
    industry: "美妆 / 新零售",
    summary: "参与赛事命题、课程共建、学生权益与实习机会合作的品牌方。",
    resourceRelations: [
      { type: "赛事", title: "三创赛 · 美妆电商赛道", to: "/competitions/sanchuang-16" },
      { type: "权益", title: "校园体验权益" },
      { type: "课程", title: "品牌电商实战课", to: "/courses/brand-ecommerce" },
      { type: "活动", title: "品牌开放日" },
      { type: "岗位", title: "品牌增长实习生", to: "/opportunities/intern-1" },
    ],
  },
  {
    id: "cloud-retail",
    name: "云栖零售实验室",
    industry: "数字零售 / 数据服务",
    summary: "提供零售数据实践、企业课题和学生项目实践机会。",
    resourceRelations: [
      { type: "活动", title: "零售数据工作坊" },
      { type: "课程", title: "商业数据分析基础", to: "/courses/data-analytics" },
      { type: "岗位", title: "商业分析实习生", to: "/opportunities/intern-2" },
    ],
  },
  {
    id: "green-chain",
    name: "青禾供应链",
    industry: "供应链 / 可持续商业",
    summary: "围绕绿色供应链提供赛事合作、企业实践和岗位机会。",
    resourceRelations: [
      { type: "赛事", title: "绿色商业实践赛", to: "/competitions/green-business-2026" },
      { type: "岗位", title: "供应链项目助理", to: "/opportunities/intern-3" },
    ],
  },
];

export const opportunities: Opportunity[] = [
  {
    id: "intern-1",
    title: "品牌增长实习生",
    companyId: "northstar-beauty",
    city: "广州",
    mode: "实习",
    summary: "参与校园品牌项目、内容投放与活动复盘，适合有赛事/项目实践经历的学生。",
    skills: ["内容运营", "数据复盘", "项目执行"],
    status: "open",
  },
  {
    id: "intern-2",
    title: "商业分析实习生",
    companyId: "cloud-retail",
    city: "深圳",
    mode: "实习",
    summary: "协助零售数据整理、指标分析和项目周报，关注真实业务问题。",
    skills: ["数据分析", "Excel", "表达"],
    status: "open",
  },
  {
    id: "intern-3",
    title: "供应链项目助理",
    companyId: "green-chain",
    city: "佛山",
    mode: "项目实践",
    summary: "参与绿色供应链调研与企业项目协同。",
    skills: ["调研", "协作"],
    status: "open",
  },
  {
    id: "closed-1",
    title: "校园活动运营实习生",
    companyId: "northstar-beauty",
    city: "广州",
    mode: "实习",
    summary: "该机会已结束，保留详情用于状态演示。",
    skills: ["活动运营"],
    status: "closed",
  },
];

export const companyById = (id?: string) => companies.find(item => item.id === id);
export const competitionById = (id?: string) => competitions.find(item => item.id === id);
export const opportunityById = (id?: string) => opportunities.find(item => item.id === id);
