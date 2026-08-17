import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, Card, GhostButton, PageHeader, PrototypeStateTools, PublicShell, SecondaryButton, Section, StateBlock, StatusTag } from "../../components/ui";
import { scenarios } from "../../mock/scenarios";
import { companies, companyById, competitions, competitionById, opportunities, opportunityById, type Competition, type Opportunity } from "./data";

type ApplicationRecord = { opportunityId: string; status: "submitted" | "statusUnknown" };
type PublicPlatformState = {
  applications: ApplicationRecord[];
  followedCompanies: string[];
  submitApplication: (opportunityId: string) => void;
  toggleFollow: (companyId: string) => void;
};

const PublicPlatformContext = createContext<PublicPlatformState | null>(null);

export function PublicPlatformProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [followedCompanies, setFollowedCompanies] = useState<string[]>(["northstar-beauty"]);
  const submitApplication = (opportunityId: string) => setApplications(records => records.some(record => record.opportunityId === opportunityId) ? records : [...records, { opportunityId, status: "submitted" }]);
  const toggleFollow = (companyId: string) => setFollowedCompanies(ids => ids.includes(companyId) ? ids.filter(id => id !== companyId) : [...ids, companyId]);
  return <PublicPlatformContext.Provider value={{ applications, followedCompanies, submitApplication, toggleFollow }}>{children}</PublicPlatformContext.Provider>;
}

function usePublicPlatform() {
  const value = useContext(PublicPlatformContext);
  if (!value) throw new Error("PublicPlatformProvider missing");
  return value;
}

function usePrototypeView() {
  const { search } = useLocation();
  const view = new URLSearchParams(search).get("view");
  return view === "loading" || view === "empty" || view === "error" ? view : "ready";
}

function useGuest() {
  const { search } = useLocation();
  return new URLSearchParams(search).get("guest") === "1";
}

const competitionStatus = (item: Competition) => item.status === "registrationOpen" ? ["报名中", "success"] as const : item.status === "inProgress" ? ["进行中", "info"] as const : item.status === "ended" ? ["已结束", "neutral"] as const : ["即将开放", "warning"] as const;

function CompetitionCard({ item }: { item: Competition }) {
  const [label, tone] = competitionStatus(item);
  return <Link to={`/competitions/${item.id}`} className="block"><Card interactive className="space-y-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="text-base font-semibold leading-6 text-text-primary">{item.name}</h3><p className="mt-1 text-sm text-text-secondary">{item.organizer}</p></div><StatusTag tone={tone}>{label}</StatusTag></div><p className="line-clamp-2 text-sm leading-5 text-text-secondary">{item.summary}</p><div className="flex flex-wrap gap-2">{item.tags.map(tag => <StatusTag key={tag} tone="neutral">{tag}</StatusTag>)}</div>{item.registrationEnds && <p className="text-xs text-text-tertiary">{item.registrationEnds}</p>}</Card></Link>;
}

function OpportunityCard({ item }: { item: Opportunity }) {
  const company = companyById(item.companyId);
  return <Link to={`/opportunities/${item.id}`} className="block"><Card interactive className="space-y-3"><div className="flex items-start justify-between gap-3"><div><h3 className="text-base font-semibold text-text-primary">{item.title}</h3><p className="mt-1 text-sm text-text-secondary">{company?.name} · {item.city}</p></div><StatusTag tone={item.status === "open" ? "success" : "neutral"}>{item.status === "open" ? item.mode : "已结束"}</StatusTag></div><p className="line-clamp-2 text-sm leading-5 text-text-secondary">{item.summary}</p><div className="flex flex-wrap gap-2">{item.skills.map(skill => <StatusTag key={skill} tone="neutral">{skill}</StatusTag>)}</div></Card></Link>;
}

function ViewGate({ children }: { children: ReactNode }) {
  const view = usePrototypeView();
  if (view !== "ready") return <div className="px-4 py-6"><StateBlock state={view} /></div>;
  return <>{children}</>;
}

export function HomePage() {
  const navigate = useNavigate();
  const guest = useGuest();
  const view = usePrototypeView();
  const activeIdentity = scenarios.multiCompetitionAccount.competitions.identities.find(identity => identity.identityStatus === "active");
  const activeCompetition = competitionById(activeIdentity?.competitionId);
  return <PublicShell><div className="px-4 pb-4 pt-6"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-text-brand">核心产业学院</p><h1 className="mt-1 text-2xl font-semibold leading-8 text-text-primary">今天，想去比赛还是找机会？</h1><p className="mt-2 text-sm leading-5 text-text-secondary">先看到值得行动的赛事与实习，再用课程、权益和可信成果支持成长。</p></div>{guest ? <StatusTag tone="neutral">未登录</StatusTag> : <StatusTag tone="success">已登录</StatusTag>}</div></div>
    {view !== "ready" ? <div className="px-4"><StateBlock state={view} /></div> : <div className="space-y-8 px-4">
      <Section title="现在可以做什么"><div className="grid grid-cols-2 gap-3"><button className="min-h-32 rounded-container bg-primary p-4 text-left text-white" onClick={() => navigate("/competitions")}><span className="text-sm font-medium opacity-90">参赛</span><strong className="mt-6 block text-lg">发现比赛</strong><span className="mt-1 block text-xs opacity-90">找值得投入的赛事</span></button><button className="min-h-32 rounded-container border border-border-subtle bg-surface p-4 text-left" onClick={() => navigate("/opportunities")}><span className="text-sm font-medium text-text-brand">就业 / 实习</span><strong className="mt-6 block text-lg text-text-primary">发现机会</strong><span className="mt-1 block text-xs text-text-secondary">岗位、实践与企业</span></button></div></Section>
      {!guest && activeCompetition && <Section title="我正在参加" action={<Link to="/competitions/mine" className="min-h-touch py-3 text-sm font-medium text-text-brand">我的赛事</Link>}><Card interactive><div className="flex items-start justify-between gap-3"><div><StatusTag tone="info">进行中</StatusTag><h3 className="mt-3 text-base font-semibold text-text-primary">{activeCompetition.name}</h3><p className="mt-1 text-sm text-text-secondary">赛事身份有效 · 可进入赛事工作区</p></div></div><Button className="mt-4 w-full" onClick={() => navigate(`/competitions/${activeCompetition.id}/workspace`)}>进入当前赛事</Button></Card></Section>}
      {guest && <Card className="border border-border-subtle"><h2 className="text-base font-semibold text-text-primary">不用赛事身份，也可以先逛平台</h2><p className="mt-2 text-sm leading-5 text-text-secondary">赛事、机会和企业公开信息均可浏览；报名、投递等账号动作再要求登录。</p><SecondaryButton className="mt-4" onClick={() => navigate("/auth/login?returnTo=/home")}>登录 / 注册</SecondaryButton></Card>}
      <Section title="推荐赛事" action={<Link to="/competitions" className="text-sm font-medium text-text-brand">查看全部</Link>}><div className="space-y-3">{competitions.slice(0,2).map(item => <CompetitionCard item={item} key={item.id} />)}</div></Section>
      <Section title="实习与项目机会" action={<Link to="/opportunities" className="text-sm font-medium text-text-brand">查看全部</Link>}><div className="space-y-3">{opportunities.filter(item => item.status === "open").slice(0,2).map(item => <OpportunityCard item={item} key={item.id} />)}</div></Section>
      <Section title="成长与资源"><div className="grid grid-cols-3 gap-2">{[["课程","/courses"],["权益","/benefits"],["可信成果","/assets"]].map(([label,to]) => <button key={to} onClick={() => navigate(to)} className="min-h-touch rounded-control bg-surface px-2 text-sm font-medium text-text-secondary active:bg-surface-pressed">{label}</button>)}</div></Section>
    </div>}<PrototypeStateTools /></PublicShell>;
}

export function CompetitionsPage() {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("all");
  const view = usePrototypeView();
  const filtered = useMemo(() => competitions.filter(item => (status === "all" || item.status === status) && `${item.name}${item.organizer}${item.tags.join("")}`.toLowerCase().includes(keyword.toLowerCase())), [keyword, status]);
  return <PublicShell><PageHeader title="赛事" subtitle="公开赛事发现，不要求先拥有赛事身份" /><div className="space-y-6 px-4 py-5"><div className="space-y-3"><input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="搜索赛事名称、主办方或关键词" className="min-h-touch w-full rounded-control border border-border bg-surface px-3 text-sm text-text-primary outline-none focus:border-primary" /><div className="flex gap-2 overflow-x-auto">{[["all","全部"],["registrationOpen","报名中"],["upcoming","即将开放"],["ended","已结束"]].map(([value,label]) => <button key={value} onClick={() => setStatus(value)} className={`min-h-10 shrink-0 rounded-full px-3 text-sm font-medium ${status === value ? "bg-primary-container text-text-brand" : "bg-surface text-text-secondary"}`}>{label}</button>)}</div></div>{view !== "ready" ? <StateBlock state={view} /> : filtered.length ? <div className="space-y-3">{filtered.map(item => <CompetitionCard key={item.id} item={item} />)}</div> : <StateBlock state="empty" />}</div><PrototypeStateTools /></PublicShell>;
}

export function CompetitionDetailPage() {
  const navigate = useNavigate();
  const guest = useGuest();
  const { competitionId } = useParams();
  const item = competitionById(competitionId);
  if (!item) return <PublicShell showNavigation={false}><PageHeader title="赛事不存在" backTo="/competitions" /><div className="px-4 py-6"><StateBlock state="error" /></div></PublicShell>;
  const [label, tone] = competitionStatus(item);
  const identity = scenarios.multiCompetitionAccount.competitions.identities.find(value => value.competitionId === item.id);
  const canEnterWorkspace = identity?.identityStatus === "active" && item.workspaceAvailable;
  const canRegister = item.status === "registrationOpen" && item.eligibility !== "ineligible";
  return <PublicShell showNavigation={false}><PageHeader title="赛事详情" subtitle="公共赛事信息" backTo="/competitions" /><ViewGate><div className="space-y-6 px-4 py-5"><div><StatusTag tone={tone}>{label}</StatusTag><h1 className="mt-3 text-2xl font-semibold leading-8 text-text-primary">{item.name}</h1><p className="mt-2 text-sm text-text-secondary">{item.organizer}</p><p className="mt-4 text-base leading-6 text-text-secondary">{item.summary}</p></div><Section title="赛事信息"><Card><div className="space-y-3 text-sm"><div className="flex justify-between gap-4"><span className="text-text-secondary">报名状态</span><span className="font-medium text-text-primary">{item.registrationEnds ?? label}</span></div><div className="flex justify-between gap-4"><span className="text-text-secondary">赛事身份</span><span className="font-medium text-text-primary">{identity ? identity.identityStatus : "当前账号暂无"}</span></div><div className="flex justify-between gap-4"><span className="text-text-secondary">赛事工作区</span><span className="font-medium text-text-primary">{canEnterWorkspace ? "可进入" : "需有效赛事身份"}</span></div></div></Card></Section>{item.eligibility === "ineligible" && <Card className="border border-warning bg-warning-bg"><p className="font-medium text-warning-text">当前条件暂不满足报名资格</p><p className="mt-1 text-sm text-warning-text">这里只展示资格状态，不在 T02 自行定义完整资格规则。</p></Card>}{item.status === "ended" && <Card className="border border-border-subtle"><p className="font-medium text-text-primary">赛事已结束</p><p className="mt-1 text-sm text-text-secondary">公开信息仍可查看；赛事期权限与赛后长期资产由对应后续卡处理。</p></Card>}<div className="space-y-2">{canEnterWorkspace ? <Button className="w-full" onClick={() => navigate(`/competitions/${item.id}/workspace`)}>进入赛事工作区</Button> : canRegister ? <Button className="w-full" onClick={() => guest ? navigate(`/auth/login?returnTo=/competitions/${item.id}/registration`) : navigate(`/competitions/${item.id}/registration`)}>进入报名</Button> : <Button className="w-full" disabled>{item.status === "upcoming" ? "报名尚未开始" : item.status === "ended" ? "赛事已结束" : "暂不可报名"}</Button>}<SecondaryButton className="w-full" onClick={() => navigate("/competitions/mine")}>查看我的赛事</SecondaryButton></div></div></ViewGate><PrototypeStateTools /></PublicShell>;
}

export function MyCompetitionsPage() {
  const navigate = useNavigate();
  const identities = scenarios.multiCompetitionAccount.competitions.identities;
  return <PublicShell><PageHeader title="我的赛事" subtitle="读取长期账号关联的全部赛事身份" backTo="/competitions" /><ViewGate><div className="space-y-3 px-4 py-5">{identities.map(identity => { const item = competitionById(identity.competitionId); if (!item) return null; return <Card key={identity.competitionId} interactive><div className="flex items-start justify-between gap-3"><div><h2 className="text-base font-semibold text-text-primary">{item.name}</h2><p className="mt-1 text-sm text-text-secondary">身份：{identity.identityStatus} · 报名：{identity.registrationStatus}</p></div><StatusTag tone={identity.identityStatus === "active" ? "success" : identity.identityStatus === "pending" ? "warning" : "neutral"}>{identity.competitionStatus === "inProgress" ? "进行中" : identity.competitionStatus === "ended" ? "已结束" : "报名阶段"}</StatusTag></div>{identity.identityStatus === "active" && <Button className="mt-4 w-full" onClick={() => navigate(`/competitions/${identity.competitionId}/workspace`)}>进入赛事工作区</Button>}{identity.identityStatus === "pending" && <SecondaryButton className="mt-4 w-full" onClick={() => navigate(`/competitions/${identity.competitionId}/registration`)}>查看报名状态</SecondaryButton>}{identity.identityStatus === "revoked" && <SecondaryButton className="mt-4 w-full" onClick={() => navigate(`/competitions/${identity.competitionId}`)}>查看赛事公开信息</SecondaryButton>}</Card>; })}</div></ViewGate><PrototypeStateTools /></PublicShell>;
}

export function RegistrationHandoffPage() {
  const navigate = useNavigate();
  const { competitionId } = useParams();
  const item = competitionById(competitionId);
  const [state, setState] = useState<"ready" | "external" | "pending">("ready");
  if (!item) return null;
  return <PublicShell showNavigation={false}><PageHeader title="赛事报名" subtitle="T01 registration handoff" backTo={`/competitions/${item.id}`} /><div className="space-y-5 px-4 py-6"><Card><StatusTag tone={state === "pending" ? "warning" : "info"}>{state === "ready" ? "准备进入报名" : state === "external" ? "响应式报名层" : "报名已提交"}</StatusTag><h1 className="mt-3 text-lg font-semibold text-text-primary">{item.name}</h1><p className="mt-2 text-sm leading-5 text-text-secondary">复杂报名表单不在 T02 重做。这里保留 App 账号锚点、跳入、取消和结果回流接口。</p></Card>{state === "ready" && <Button className="w-full" onClick={() => setState("external")}>进入响应式报名（原型模拟）</Button>}{state === "external" && <Card className="border border-info bg-info-bg"><p className="font-medium text-info-text">已进入外部响应式报名层</p><p className="mt-2 text-sm text-info-text">T02 不自行决定队长/队员、成员、承诺书等 D02 范围。</p><Button className="mt-4 w-full" onClick={() => setState("pending")}>模拟提交并回流 App</Button></Card>}{state === "pending" && <><Card className="border border-warning bg-warning-bg"><p className="font-medium text-warning-text">报名已提交，等待学校审核真实性</p><p className="mt-2 text-sm text-warning-text">赛事身份仍为 pending，不提前进入赛事专属能力。</p></Card><Button className="w-full" onClick={() => navigate("/competitions/mine")}>查看我的赛事状态</Button></>}</div></PublicShell>;
}

export function OpportunitiesPage() {
  const [keyword, setKeyword] = useState("");
  const [mode, setMode] = useState("all");
  const view = usePrototypeView();
  const filtered = opportunities.filter(item => (mode === "all" || item.mode === mode) && `${item.title}${companyById(item.companyId)?.name}${item.city}`.toLowerCase().includes(keyword.toLowerCase()));
  return <PublicShell><PageHeader title="机会" subtitle="实习、校招与企业项目实践" /><div className="space-y-5 px-4 py-5"><input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="搜索岗位、企业或城市" className="min-h-touch w-full rounded-control border border-border bg-surface px-3 text-sm outline-none focus:border-primary" /><div className="flex gap-2 overflow-x-auto">{["all","实习","校招","项目实践"].map(value => <button key={value} onClick={() => setMode(value)} className={`min-h-10 shrink-0 rounded-full px-3 text-sm font-medium ${mode === value ? "bg-primary-container text-text-brand" : "bg-surface text-text-secondary"}`}>{value === "all" ? "全部" : value}</button>)}</div>{view !== "ready" ? <StateBlock state={view} /> : filtered.length ? <div className="space-y-3">{filtered.map(item => <OpportunityCard key={item.id} item={item} />)}</div> : <StateBlock state="empty" />}<Link to="/companies" className="block min-h-touch rounded-control bg-surface px-4 py-3 text-center text-sm font-medium text-text-brand">浏览合作企业</Link></div><PrototypeStateTools /></PublicShell>;
}

export function OpportunityDetailPage() {
  const navigate = useNavigate();
  const guest = useGuest();
  const { opportunityId } = useParams();
  const item = opportunityById(opportunityId);
  const { applications, submitApplication } = usePublicPlatform();
  const [resumeCheck, setResumeCheck] = useState(false);
  if (!item) return null;
  const company = companyById(item.companyId);
  const applied = applications.some(record => record.opportunityId === item.id);
  const apply = () => { submitApplication(item.id); navigate("/applications"); };
  return <PublicShell showNavigation={false}><PageHeader title="机会详情" backTo="/opportunities" /><ViewGate><div className="space-y-6 px-4 py-5"><div><StatusTag tone={item.status === "open" ? "success" : "neutral"}>{item.status === "open" ? item.mode : "已结束"}</StatusTag><h1 className="mt-3 text-2xl font-semibold text-text-primary">{item.title}</h1><button className="mt-2 min-h-touch text-left text-sm font-medium text-text-brand" onClick={() => navigate(`/companies/${item.companyId}?from=/opportunities/${item.id}`)}>{company?.name} · 查看企业</button><p className="mt-3 text-base leading-6 text-text-secondary">{item.summary}</p></div><Section title="岗位信息"><Card><p className="text-sm text-text-secondary">工作地点</p><p className="mt-1 font-medium text-text-primary">{item.city}</p><div className="mt-4 flex flex-wrap gap-2">{item.skills.map(skill => <StatusTag key={skill} tone="neutral">{skill}</StatusTag>)}</div></Card></Section>{resumeCheck && item.status === "open" && !applied && <Card className="border border-info bg-info-bg"><h2 className="font-semibold text-info-text">投递前检查长期简历</h2><p className="mt-2 text-sm leading-5 text-info-text">T02 只验证接口：使用长期平台简历投递；简历深层编辑由 T04 实现。</p><div className="mt-4 flex gap-2"><SecondaryButton className="flex-1" onClick={() => navigate(`/me/resume?returnTo=/opportunities/${item.id}`)}>查看长期简历</SecondaryButton><Button className="flex-1" onClick={apply}>确认投递</Button></div></Card>}<div>{item.status === "closed" ? <Button className="w-full" disabled>机会已结束</Button> : applied ? <Button className="w-full" disabled>已投递</Button> : guest ? <Button className="w-full" onClick={() => navigate(`/auth/login?returnTo=/opportunities/${item.id}`)}>登录后投递</Button> : <Button className="w-full" onClick={() => setResumeCheck(true)}>使用长期简历投递</Button>}</div></div></ViewGate><PrototypeStateTools /></PublicShell>;
}

export function CompaniesPage() {
  const [keyword, setKeyword] = useState("");
  const filtered = companies.filter(item => `${item.name}${item.industry}${item.summary}`.toLowerCase().includes(keyword.toLowerCase()));
  return <PublicShell><PageHeader title="企业" subtitle="资源、品牌与机会合作方" backTo="/opportunities" /><div className="space-y-4 px-4 py-5"><input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="搜索企业或行业" className="min-h-touch w-full rounded-control border border-border bg-surface px-3 text-sm outline-none focus:border-primary" />{filtered.length ? filtered.map(item => <Link key={item.id} to={`/companies/${item.id}`} className="block"><Card interactive><h2 className="text-base font-semibold text-text-primary">{item.name}</h2><p className="mt-1 text-sm text-text-brand">{item.industry}</p><p className="mt-3 text-sm leading-5 text-text-secondary">{item.summary}</p><p className="mt-3 text-xs text-text-tertiary">关联 {item.resourceRelations.length} 项赛事 / 权益 / 课程 / 活动 / 岗位资源</p></Card></Link>) : <StateBlock state="empty" />}</div></PublicShell>;
}

export function CompanyDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { companyId } = useParams();
  const item = companyById(companyId);
  const { followedCompanies, toggleFollow } = usePublicPlatform();
  if (!item) return null;
  const followed = followedCompanies.includes(item.id);
  const from = new URLSearchParams(location.search).get("from");
  return <PublicShell showNavigation={false}><PageHeader title="企业详情" backTo={from || "/companies"} /><ViewGate><div className="space-y-6 px-4 py-5"><div><StatusTag tone="info">合作企业</StatusTag><h1 className="mt-3 text-2xl font-semibold text-text-primary">{item.name}</h1><p className="mt-1 text-sm text-text-brand">{item.industry}</p><p className="mt-4 text-base leading-6 text-text-secondary">{item.summary}</p><SecondaryButton className="mt-4" onClick={() => toggleFollow(item.id)}>{followed ? "已关注" : "关注企业"}</SecondaryButton></div><Section title="与平台的资源关系"><div className="space-y-2">{item.resourceRelations.map((relation, index) => <button key={`${relation.type}-${index}`} className="flex min-h-touch w-full items-center justify-between rounded-control bg-surface px-3 py-2 text-left active:bg-surface-pressed" onClick={() => relation.to && navigate(relation.to)}><span><StatusTag tone="neutral">{relation.type}</StatusTag><span className="ml-2 text-sm font-medium text-text-primary">{relation.title}</span></span><span className="text-text-tertiary">{relation.to ? "›" : ""}</span></button>)}</div></Section><Section title="当前机会"><div className="space-y-3">{opportunities.filter(opportunity => opportunity.companyId === item.id).map(opportunity => <OpportunityCard key={opportunity.id} item={opportunity} />)}</div></Section></div></ViewGate></PublicShell>;
}

export function ApplicationsPage() {
  const { applications } = usePublicPlatform();
  return <PublicShell><PageHeader title="投递记录" subtitle="T02 仅保证 submitted / statusUnknown" backTo="/opportunities" /><div className="space-y-3 px-4 py-5">{applications.length ? applications.map(record => { const item = opportunityById(record.opportunityId); const company = companyById(item?.companyId); if (!item) return null; return <Link key={record.opportunityId} to={`/opportunities/${record.opportunityId}`} className="block"><Card interactive><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-text-primary">{item.title}</h2><p className="mt-1 text-sm text-text-secondary">{company?.name}</p></div><StatusTag tone={record.status === "submitted" ? "success" : "warning"}>{record.status === "submitted" ? "已投递" : "状态待回流"}</StatusTag></div></Card></Link>; }) : <Card className="py-8 text-center"><p className="font-semibold text-text-primary">还没有投递记录</p><p className="mt-2 text-sm text-text-secondary">先去看看适合你的实习与项目机会。</p><Button className="mt-4" onClick={() => location.assign("/opportunities")}>去找机会</Button></Card>}</div></PublicShell>;
}

export function ResumeBoundaryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = new URLSearchParams(location.search).get("returnTo") || "/opportunities";
  return <PublicShell showNavigation={false}><PageHeader title="长期简历" subtitle="T04 接口边界" backTo={returnTo} /><div className="space-y-5 px-4 py-6"><Card><StatusTag tone="success">可用于投递</StatusTag><h1 className="mt-3 text-lg font-semibold text-text-primary">长期平台简历</h1><p className="mt-2 text-sm leading-5 text-text-secondary">基础资料、赛事经历、课程成果等长期资产的深层维护由 T04 实现。T02 只保证投递流程能回来继续。</p></Card><Button className="w-full" onClick={() => navigate(returnTo)}>返回机会，继续投递</Button></div></PublicShell>;
}

export function WorkspaceBoundaryPage() {
  const navigate = useNavigate();
  const { competitionId } = useParams();
  const item = competitionById(competitionId);
  return <PublicShell showNavigation={false}><PageHeader title="赛事工作区" subtitle="公共平台与赛事上下文边界" backTo="/competitions/mine" /><div className="space-y-5 px-4 py-6"><Card><StatusTag tone="success">已进入赛事上下文</StatusTag><h1 className="mt-3 text-lg font-semibold text-text-primary">{item?.name ?? "赛事"}</h1><p className="mt-2 text-sm leading-5 text-text-secondary">T02 到此完成 handoff。团队、项目、赛事资料与创赛工坊内部由 T03 实现，本页不提前展开。</p></Card><SecondaryButton className="w-full" onClick={() => navigate(`/competitions/${competitionId}`)}>返回公开赛事详情</SecondaryButton></div></PublicShell>;
}

export function LoginBoundaryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = new URLSearchParams(location.search).get("returnTo") || "/home";
  return <PublicShell showNavigation={false}><PageHeader title="登录" /><div className="space-y-5 px-4 py-8"><Card><h1 className="text-lg font-semibold text-text-primary">登录后继续</h1><p className="mt-2 text-sm leading-5 text-text-secondary">公开赛事、机会和企业可以直接浏览；报名、投递及“我的赛事”需要长期 App 账号。</p></Card><Button className="w-full" onClick={() => navigate(returnTo)}>使用原型账号登录</Button><GhostButton className="w-full" onClick={() => navigate("/home?guest=1")}>以游客身份继续浏览</GhostButton></div></PublicShell>;
}
