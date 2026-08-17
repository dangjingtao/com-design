export type CourseSource =
  | { type: "platform"; label: string }
  | { type: "competition"; label: string; competitionId: string }
  | { type: "company"; label: string; companyId: string };

export type Course = {
  id: string;
  title: string;
  summary: string;
  source: CourseSource;
  duration: string;
  lessons: string[];
  entitlement: "free" | "benefitRequired";
  unlockBenefitId?: string;
  certificateId?: string;
};

export type BenefitSource =
  | { type: "platform"; label: string }
  | { type: "competition"; label: string; competitionId: string }
  | { type: "company"; label: string; companyId: string }
  | { type: "activity"; label: string };

export type BenefitStatus = "eligible" | "ineligible" | "claimed" | "used" | "expired";

export type Benefit = {
  id: string;
  title: string;
  summary: string;
  source: BenefitSource;
  reason: string;
  expiresAt?: string;
  initialStatus: BenefitStatus;
  requiresCompetitionId?: string;
};

export type CertificateRecord = {
  id: string;
  title: string;
  issuer: string;
  sourceType: "competition" | "course";
  competitionId?: string;
  courseId?: string;
  resultId?: string;
  verificationCode: string;
  status: "claimable" | "claimed" | "pending" | "revoked";
  issuedAt?: string;
};

export type CompetitionResultRecord = {
  id: string;
  competitionId: string;
  resultId?: string;
  grade: string;
  status: "pending" | "trusted" | "archived";
  certificateId?: string;
};

export const courses: Course[] = [
  {
    id: "data-analytics",
    title: "商业数据分析基础",
    summary: "用真实业务指标完成从问题拆解、数据整理到复盘表达的基础训练。",
    source: { type: "platform", label: "平台公共课程" },
    duration: "6 课时",
    lessons: ["指标与问题", "数据整理", "漏斗分析", "复盘表达", "练习与考试", "成果确认"],
    entitlement: "free",
    certificateId: "cert-course-data-analytics",
  },
  {
    id: "brand-ecommerce",
    title: "品牌电商实战课",
    summary: "围绕三创赛美妆电商赛道，把用户洞察、内容运营和经营复盘串成一条实践链。",
    source: { type: "competition", label: "三创赛 · 美妆电商赛道", competitionId: "sanchuang-16" },
    duration: "8 课时",
    lessons: ["赛道导入", "用户洞察", "商品表达", "内容运营", "直播与转化", "数据复盘", "项目复盘", "课程考试"],
    entitlement: "free",
    certificateId: "cert-course-brand-ecommerce",
  },
  {
    id: "retail-project-lab",
    title: "零售项目协作课",
    summary: "企业案例驱动的轻量项目课，训练需求澄清、协作与阶段汇报。",
    source: { type: "company", label: "云栖零售实验室", companyId: "cloud-retail" },
    duration: "4 课时",
    lessons: ["项目拆解", "协作记录", "阶段汇报", "成果复盘"],
    entitlement: "benefitRequired",
    unlockBenefitId: "benefit-cloud-lab",
  },
];

export const benefits: Benefit[] = [
  {
    id: "benefit-campus-video",
    title: "校园视频会员月卡",
    summary: "平台合作权益，领取后在有效期内兑换使用。",
    source: { type: "platform", label: "核心产业学院" },
    reason: "完成账号资料后开放的通用学生权益。",
    expiresAt: "2026-09-30",
    initialStatus: "eligible",
  },
  {
    id: "benefit-beauty-sample",
    title: "北辰美妆校园体验权益",
    summary: "赛事合作品牌提供的校园体验资格。",
    source: { type: "company", label: "北辰美妆", companyId: "northstar-beauty" },
    reason: "当前账号具备三创赛相关学生身份，且符合合作活动资格。",
    expiresAt: "2026-08-31",
    initialStatus: "claimed",
    requiresCompetitionId: "sanchuang-16",
  },
  {
    id: "benefit-cloud-lab",
    title: "云栖零售项目课学习资格",
    summary: "企业共建项目课的学习兑换资格。",
    source: { type: "company", label: "云栖零售实验室", companyId: "cloud-retail" },
    reason: "由企业合作项目开放，领取后解锁对应项目课。",
    expiresAt: "2026-10-31",
    initialStatus: "eligible",
  },
  {
    id: "benefit-sanchuang-course",
    title: "赛道路演课学习资格",
    summary: "三创赛参赛期提供的赛事学习权益；领取记录长期保留。",
    source: { type: "competition", label: "第十六届三创赛", competitionId: "sanchuang-16" },
    reason: "由赛事身份授予，不等同赛事 workspace 权限。",
    expiresAt: "2026-10-15",
    initialStatus: "eligible",
    requiresCompetitionId: "sanchuang-16",
  },
  {
    id: "benefit-activity-ride",
    title: "青年创新日出行券",
    summary: "线下活动现场发放的出行权益。",
    source: { type: "activity", label: "青年创新日" },
    reason: "仅面向已完成活动签到的学生。",
    expiresAt: "2026-08-20",
    initialStatus: "ineligible",
  },
  {
    id: "benefit-history",
    title: "历史赛事资料兑换权益",
    summary: "历史权益保留状态，不再允许使用。",
    source: { type: "competition", label: "第十五届三创赛", competitionId: "sanchuang-15" },
    reason: "赛事与权益有效期均已结束。",
    expiresAt: "2025-09-01",
    initialStatus: "expired",
    requiresCompetitionId: "sanchuang-15",
  },
];

export const initialCertificates: CertificateRecord[] = [
  {
    id: "cert-sanchuang-15",
    title: "第十五届三创赛参赛与项目成果证书",
    issuer: "三创赛组委会",
    sourceType: "competition",
    competitionId: "sanchuang-15",
    resultId: "result-s5-score-precheck",
    verificationCode: "SC15-TOMZ-24001",
    status: "claimed",
    issuedAt: "2025-08-28",
  },
  {
    id: "cert-course-data-analytics",
    title: "商业数据分析基础课程证书",
    issuer: "核心产业学院",
    sourceType: "course",
    courseId: "data-analytics",
    verificationCode: "COURSE-DA-26001",
    status: "claimable",
  },
];

export const initialCompetitionResults: CompetitionResultRecord[] = [
  {
    id: "competition-result-sanchuang-15",
    competitionId: "sanchuang-15",
    resultId: "result-s5-score-precheck",
    grade: "校赛一等奖",
    status: "trusted",
    certificateId: "cert-sanchuang-15",
  },
  {
    id: "competition-result-sanchuang-16",
    competitionId: "sanchuang-16",
    resultId: "result-s1-product-score",
    grade: "赛事进行中 · 阶段成果",
    status: "pending",
  },
];

export const courseById = (id?: string) => courses.find(item => item.id === id);
export const benefitById = (id?: string) => benefits.find(item => item.id === id);
