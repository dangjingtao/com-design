import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type RegistrationRole = "leader" | "member";
export type ReviewStatus = "draft" | "pending" | "rejected" | "approved" | "completed" | "closed";

export type AccountDraft = {
  school: string;
  track: string;
  teamName: string;
  username: string;
  phone: string;
  email: string;
};

export type TeamMember = {
  id: string;
  name: string;
  school: string;
  phone: string;
  email: string;
  studentId: string;
};

export type TeamDraft = {
  province: string;
  school: string;
  contact: string;
  contactPhone: string;
  firstParticipation: boolean;
  category: string;
  teamId: string;
  teamName: string;
  phone: string;
  email: string;
  crossSchool: boolean;
};

export type CommitmentDraft = {
  projectTitle: string;
  projectSummary: string;
  innovation: string;
  creativity: string;
  entrepreneurship: string;
  generated: boolean;
};

export type RegistrationPortalState = {
  role?: RegistrationRole;
  account: AccountDraft;
  quizPassed: boolean;
  members: TeamMember[];
  team: TeamDraft;
  reviewStatus: ReviewStatus;
  rejectionReason: string;
  commitment: CommitmentDraft;
  reportSubmitted: boolean;
  certificateReady: boolean;
};

type RegistrationPortalContextValue = RegistrationPortalState & {
  setRole: (role: RegistrationRole) => void;
  updateAccount: (patch: Partial<AccountDraft>) => void;
  passQuiz: () => void;
  updateTeam: (patch: Partial<TeamDraft>) => void;
  addMember: (member: TeamMember) => void;
  removeMember: (memberId: string) => void;
  submitReview: () => void;
  rejectReview: () => void;
  approveReview: () => void;
  updateCommitment: (patch: Partial<CommitmentDraft>) => void;
  generateCommitment: () => void;
  completeRegistration: () => void;
  submitReport: () => void;
  setCertificateReady: (ready: boolean) => void;
  closeRegistration: () => void;
  reset: () => void;
  loadScenario: (scenario: "leaderDraft" | "memberWaiting" | "pending" | "rejected" | "approved" | "completed" | "closed") => void;
};

const seedAccount: AccountDraft = {
  school: "广东技术师范大学",
  track: "美妆新零售实战赛",
  teamName: "号外号外爆卖爆卖",
  username: "linxiao",
  phone: "15360270209",
  email: "keyieye_2021@qq.com",
};

const seedTeam: TeamDraft = {
  province: "广东省",
  school: "广东技术师范大学",
  contact: "林钰贤",
  contactPhone: "15360275642",
  firstParticipation: true,
  category: "美妆新零售实战赛",
  teamId: "16192192",
  teamName: "号外号外爆卖爆卖",
  phone: "15360270209",
  email: "keyieye_2021@qq.com",
  crossSchool: false,
};

const seedMember: TeamMember = {
  id: "member-zhangsan",
  name: "张三",
  school: "广州大学",
  phone: "13800138000",
  email: "zhangsan@example.edu.cn",
  studentId: "20260001",
};

const seedCommitment: CommitmentDraft = {
  projectTitle: "校园美妆新零售增长实验",
  projectSummary: "围绕校园消费场景，通过内容、直播与数据复盘完成从用户洞察到经营验证的完整实践。",
  innovation: "把校园真实消费反馈和经营数据纳入每周迭代，以小样本高频复盘替代一次性策划。",
  creativity: "通过校内社群、内容账号和线下体验活动组合触达，把品牌试用、内容传播和赛事任务连接起来。",
  entrepreneurship: "形成可复用的选品、内容、转化和复盘流程，并明确成员分工、成本边界与阶段性经营目标。",
  generated: false,
};

function initialState(): RegistrationPortalState {
  return {
    account: seedAccount,
    quizPassed: false,
    members: [],
    team: seedTeam,
    reviewStatus: "draft",
    rejectionReason: "团队成员信息与报名材料不一致，请核对成员学校、邮箱后重新提交。",
    commitment: seedCommitment,
    reportSubmitted: false,
    certificateReady: false,
  };
}

const RegistrationPortalContext = createContext<RegistrationPortalContextValue | null>(null);

export function RegistrationPortalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<RegistrationPortalState>(() => initialState());

  const value = useMemo<RegistrationPortalContextValue>(() => ({
    ...state,
    setRole: role => setState(current => ({ ...current, role })),
    updateAccount: patch => setState(current => ({ ...current, account: { ...current.account, ...patch } })),
    passQuiz: () => setState(current => ({ ...current, quizPassed: true })),
    updateTeam: patch => setState(current => ({ ...current, team: { ...current.team, ...patch } })),
    addMember: member => setState(current => ({ ...current, members: current.members.some(item => item.id === member.id) ? current.members : [...current.members, member] })),
    removeMember: memberId => setState(current => ({ ...current, members: current.members.filter(item => item.id !== memberId) })),
    submitReview: () => setState(current => ({ ...current, reviewStatus: "pending" })),
    rejectReview: () => setState(current => ({ ...current, reviewStatus: "rejected" })),
    approveReview: () => setState(current => ({ ...current, reviewStatus: "approved" })),
    updateCommitment: patch => setState(current => ({ ...current, commitment: { ...current.commitment, ...patch } })),
    generateCommitment: () => setState(current => ({ ...current, commitment: { ...current.commitment, generated: true } })),
    completeRegistration: () => setState(current => ({ ...current, reviewStatus: "completed", certificateReady: true })),
    submitReport: () => setState(current => ({ ...current, reportSubmitted: true })),
    setCertificateReady: certificateReady => setState(current => ({ ...current, certificateReady })),
    closeRegistration: () => setState(current => ({ ...current, reviewStatus: "closed" })),
    reset: () => setState(initialState()),
    loadScenario: scenario => setState(current => {
      if (scenario === "leaderDraft") return { ...initialState(), role: "leader" };
      if (scenario === "memberWaiting") return { ...initialState(), role: "member", quizPassed: true };
      if (scenario === "pending") return { ...initialState(), role: "leader", quizPassed: true, members: [seedMember], reviewStatus: "pending" };
      if (scenario === "rejected") return { ...initialState(), role: "leader", quizPassed: true, members: [seedMember], reviewStatus: "rejected" };
      if (scenario === "approved") return { ...initialState(), role: "leader", quizPassed: true, members: [seedMember], reviewStatus: "approved" };
      if (scenario === "completed") return { ...initialState(), role: "leader", quizPassed: true, members: [seedMember], reviewStatus: "completed", commitment: { ...seedCommitment, generated: true }, reportSubmitted: true, certificateReady: true };
      return { ...current, reviewStatus: "closed" };
    }),
  }), [state]);

  return <RegistrationPortalContext.Provider value={value}>{children}</RegistrationPortalContext.Provider>;
}

export function useRegistrationPortal() {
  const value = useContext(RegistrationPortalContext);
  if (!value) throw new Error("RegistrationPortalProvider missing");
  return value;
}

export const demoMember = seedMember;
