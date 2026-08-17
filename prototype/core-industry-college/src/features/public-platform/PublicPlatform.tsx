import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, Card, GhostButton, PageHeader, PrototypeStateTools, PublicShell, SecondaryButton, Section, StateBlock, StatusTag } from "../../components/ui";
import { scenarios } from "../../mock/scenarios";
import type { CompetitionIdentityState } from "../../state/model";
import { companies, companyById, competitions, competitionById, opportunities, opportunityById, type Competition, type Opportunity } from "./data";

type ApplicationRecord = { opportunityId: string; status: "submitted" | "statusUnknown" };
type IdentityMode = "multi" | "none" | "runtime";
type SessionState = { loggedIn: boolean; profileComplete: boolean };
type ListViewState = {
  competitionKeyword: string;
  competitionStatus: string;
  opportunityKeyword: string;
  opportunityMode: string;
  companyKeyword: string;
};
type ListKey = "competitions" | "opportunities" | "companies";
export type IdentityScenario = "none" | "pending" | "rejected" | "active" | "revoked";

type PublicPlatformState = {
  session: SessionState;
  applications: ApplicationRecord[];
  followedCompanies: string[];
  identities: CompetitionIdentityState[];
  identityMode: IdentityMode;
  listView: ListViewState;
  listScroll: Record<ListKey, number>;
  setIdentityMode: (mode: "multi" | "none") => void;
  login: () => void;
  continueAsGuest: () => void;
  setCompetitionIdentityScenario: (competitionId: string, scenario: IdentityScenario) => void;
  upsertRegistrationPending: (competitionId: string) => void;
  submitApplication: (opportunityId: string) => void;
  setApplicationStatus: (opportunityId: string, status: ApplicationRecord["status"]) => void;
  toggleFollow: (companyId: string) => void;
  updateListView: (patch: Partial<ListViewState>) => void;
  setListScroll: (key: ListKey, value: number) => void;
};

const PublicPlatformContext = createContext<PublicPlatformState | null>(null);

function syncCompetitionStatus(identity: CompetitionIdentityState): CompetitionIdentityState {
  const competition = competitionById(identity.competitionId);
  return competition ? { ...identity, competitionStatus: competition.status } : identity;
}

function multiIdentitySeed() {
  return scenarios.multiCompetitionAccount.competitions.identities.map(syncCompetitionStatus);
}

const initialListView: ListViewState = {
  competitionKeyword: "",
  competitionStatus: "all",
  opportunityKeyword: "",
  opportunityMode: "all",
  companyKeyword: "",
};

export function PublicPlatformProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const enteredAsGuest = new URLSearchParams(location.search).get("guest") === "1";
  const [session, setSession] = useState<SessionState>(() => ({ loggedIn: !enteredAsGuest, profileComplete: !enteredAsGuest }));
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [followedCompanies, setFollowedCompanies] = useState<string[]>(["northstar-beauty"]);
  const [identities, setIdentities] = useState<CompetitionIdentityState[]>(multiIdentitySeed);
  const [identityMode, setIdentityModeValue] = useState<IdentityMode>("multi");
  const [listView, setListView] = useState(initialListView);
  const [listScroll, setListScrollState] = useState<Record<ListKey, number>>({ competitions: 0, opportunities: 0, companies: 0 });

  useEffect(() => {
    if (new URLSearchParams(location.search).get("guest") === "1") setSession({ loggedIn: false, profileComplete: false });
  }, [location.search]);

  const setIdentityMode = useCallback((mode: "multi" | "none") => {
    setIdentityModeValue(mode);
    setIdentities(mode === "multi" ? multiIdentitySeed() : []);
  }, []);
  const login = useCallback(() => setSession({ loggedIn: true, profileComplete: true }), []);
  const continueAsGuest = useCallback(() => setSession({ loggedIn: false, profileComplete: false }), []);
  const setCompetitionIdentityScenario = useCallback((competitionId: string, scenario: IdentityScenario) => {
    setIdentities(current => {
      if (scenario === "none") return current.filter(identity => identity.competitionId !== competitionId);
      const competition = competitionById(competitionId);
      const existing = current.find(identity => identity.competitionId === competitionId);
      const next: CompetitionIdentityState = {
        competitionId,
        competitionStatus: competition?.status ?? existing?.competitionStatus ?? "registrationOpen",
        identityStatus: scenario === "active" ? "active" : scenario === "pending" ? "pending" : scenario === "rejected" ? "rejected" : "revoked",
        registrationStatus: scenario === "active" ? "approved" : scenario === "pending" ? "pending" : scenario === "rejected" ? "rejected" : "approved",
      };
      return existing ? current.map(identity => identity.competitionId === competitionId ? next : identity) : [...current, next];
    });
    setIdentityModeValue("runtime");
  }, []);
  const upsertRegistrationPending = useCallback((competitionId: string) => setCompetitionIdentityScenario(competitionId, "pending"), [setCompetitionIdentityScenario]);
  const submitApplication = useCallback((opportunityId: string) => {
    setApplications(records => records.some(record => record.opportunityId === opportunityId) ? records : [...records, { opportunityId, status: "submitted" }]);
  }, []);
  const setApplicationStatus = useCallback((opportunityId: string, status: ApplicationRecord["status"]) => setApplications(records => records.map(record => record.opportunityId === opportunityId ? { ...record, status } : record)), []);
  const toggleFollow = useCallback((companyId: string) => setFollowedCompanies(ids => ids.includes(companyId) ? ids.filter(id => id !== companyId) : [...ids, companyId]), []);
  const updateListView = useCallback((patch: Partial<ListViewState>) => setListView(current => ({ ...current, ...patch })), []);
  const setListScroll = useCallback((key: ListKey, value: number) => setListScrollState(current => ({ ...current, [key]: value })), []);

  const guardedSubmitApplication = useCallback((opportunityId: string) => { if (session.loggedIn) submitApplication(opportunityId); }, [session.loggedIn, submitApplication]);
  const guardedToggleFollow = useCallback((companyId: string) => { if (session.loggedIn) toggleFollow(companyId); }, [session.loggedIn, toggleFollow]);
  const guardedIdentityScenario = useCallback((competitionId: string, scenario: IdentityScenario) => { if (session.loggedIn) setCompetitionIdentityScenario(competitionId, scenario); }, [session.loggedIn, setCompetitionIdentityScenario]);

  const value = useMemo<PublicPlatformState>(() => ({
    session, applications, followedCompanies, identities, identityMode, listView, listScroll,
    setIdentityMode, login, continueAsGuest,
    setCompetitionIdentityScenario: guardedIdentityScenario,
    upsertRegistrationPending,
    submitApplication: guardedSubmitApplication,
    setApplicationStatus,
    toggleFollow: guardedToggleFollow,
    updateListView,
    setListScroll,
  }), [session, applications, followedCompanies, identities, identityMode, listView, listScroll, setIdentityMode, login, continueAsGuest, guardedIdentityScenario, upsertRegistrationPending, guardedSubmitApplication, setApplicationStatus, guardedToggleFollow, updateListView, setListScroll]);

  return <PublicPlatformContext.Provider value={value}>{children}</PublicPlatformContext.Provider>;
}

export function usePublicPlatform() {
  const value = useContext(PublicPlatformContext);
  if (!value) throw new Error("PublicPlatformProvider missing");
  return value;
}

function usePrototypeView() {
  const view = new URLSearchParams(useLocation().search).get("view");
  return view === "loading" || view === "empty" || view === "error" ? view : "ready";
}

function useListScroll(key: ListKey) {
  const { listScroll, setListScroll } = usePublicPlatform();
  useEffect(() => {
    const frame = requestAnimationFrame(() => window.scrollTo({ top: listScroll[key], behavior: "auto" }));
    return () => { cancelAnimationFrame(frame); setListScroll(key, window.scrollY); };
  }, [key, listScroll, setListScroll]);
}

function useGuest() {
  return !usePublicPlatform().session.loggedIn;
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

function AccountScenarioSwitch() {
  const { identityMode, setIdentityMode } = usePublicPlatform();
  const label = identityMode === "multi" ? "多赛事身份" : identityMode === "none" ? "无赛事身份" : "报名回流身份";
  return <button className="min-h-touch rounded-control bg-surface-subtle px-3 text-xs font-medium text-text-secondary" onClick={() => setIdentityMode(identityMode === "none" ? "multi" : "none")}>原型账号：{label}</button>;
}

export function HomePage() {
  const navigate = useNavigate();
  const guest = useGuest();
  const view = usePrototypeView();
  const { identities } = usePublicPlatform();
  const activeIdentity = identities.find(identity => identity.identityStatus === "active");
  const activeCompetition = competitionById(activeIdentity?.competitionId);
  return <PublicShell><div className="px-4 pb-4 pt-6"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-text-brand">核心产业学院</p><h1 className="mt-1 text-2xl font-semibold leading-8 text-text-primary">今天，想去比赛还是找机会？</h1><p className="mt-2 text-sm leading-5 text-text-secondary">先看到值得行动的赛事与实习，再用课程、权益和可信成果支持成长。</p></div>{guest ? <StatusTag tone="neutral">未登录</StatusTag> : <StatusTag tone="success">已登录</StatusTag>}</div>{!guest && <div className="mt-4"><AccountScenarioSwitch /></div>}</div>
    {view !== "ready" ? <div className="px-4"><StateBlock state={view} /></div> : <div className="space-y-8 px-4">
      <Section title="现在可以做什么"><div className="grid grid-cols-2 gap-3"><button className="min-h-32 rounded-container bg-primary p-4 text-left text-on-primary" onClick={() => navigate("/competitions")}><span className="text-sm font-medium opacity-90">参赛</span><strong className="mt-6 block text-lg">发现比赛</strong><span className="mt-1 block text-xs opacity-90">找值得投入的赛事</span></button><button className="min-h-32 rounded-container border border-border-subtle bg-surface p-4 text-left" onClick={() => navigate("/opportunities")}><span className="text-sm font-medium text-text-brand">就业 / 实习</span><strong className="mt-6 block text-lg text-text-primary">发现机会</strong><span className="mt-1 block text-xs text-text-secondary">岗位、实践与企业</span></button></div></Section>
      {!guest && activeCompetition && <Section title="我正在参加" action={<Link to="/competitions/mine" className="min-h-touch py-3 text-sm font-medium text-text-brand">我的赛事</Link>}><Card interactive><StatusTag tone="info">已获得赛事身份</StatusTag><h3 className="mt-3 text-base font-semibold text-text-primary">{activeCompetition.name}</h3><p className="mt-1 text-sm text-text-secondary">赛事身份有效 · 可进入赛事工作区</p><Button className="mt-4 w-full" onClick={() => navigate(`/competitions/${activeCompetition.id}/workspace`)}>进入当前赛事</Button></Card></Section>}
      {!guest && !activeCompetition && <Card className="border border-border-subtle"><h2 className="text-base font-semibold text-text-primary">你还没有可用赛事工作区</h2><p className="mt-2 text-sm leading-5 text-text-secondary">这不会影响公共平台使用。你仍可以浏览赛事、机会和企业；已提交报名也会出现在“我的赛事”。</p><SecondaryButton className="mt-4" onClick={() => navigate("/competitions")}>发现赛事</SecondaryButton></Card>}
      {guest && <Card className="border border-border-subtle"><h2 className="text-base font-semibold text-text-primary">不用赛事身份，也可以先逛平台</h2><p className="mt-2 text-sm leading-5 text-text-secondary">赛事、机会和企业公开信息均可浏览；报名、投递等账号动作再要求登录。</p><SecondaryButton className="mt-4" onClick={() => navigate("/auth/login?returnTo=/home")}>登录 / 注册</SecondaryButton></Card>}
      <Section title="推荐赛事" action={<Link to="/competitions" className="text-sm font-medium text-text-brand">查看全部</Link>}><div className="space-y-3">{competitions.slice(0,2).map(item => <CompetitionCard item={item} key={item.id} />)}</div></Section>
      <Section title="实习与项目机会" action={<Link to="/opportunities" className="text-sm font-medium text-text-brand">查看全部</Link>}><div className="space-y-3">{opportunities.filter(item => item.status === "open").slice(0,2).map(item => <OpportunityCard item={item} key={item.id} />)}</div></Section>
      <Section title="成长与资源"><div className="grid grid-cols-3 gap-2">{[["课程","/courses"],["权益","/benefits"],["可信成果","/assets"]].map(([label,to]) => <button key={to} onClick={() => navigate(to)} className="min-h-touch rounded-control bg-surface px-2 text-sm font-medium text-text-secondary active:bg-surface-pressed">{label}</button>)}</div></Section>
    </div>}<PrototypeStateTools /></PublicShell>;
}

export function CompetitionsPage() {
  useListScroll("competitions");
  const { listView, updateListView } = usePublicPlatform();
  const view = usePrototypeView();
  const filtered = useMemo(() => competitions.filter(item => (listView.competitionStatus === "all" || item.status === listView.competitionStatus) && `${item.name}${item.organizer}${item.tags.join("")}`.toLowerCase().includes(listView.competitionKeyword.toLowerCase())), [listView.competitionKeyword, listView.competitionStatus]);
  return <PublicShell><PageHeader title="赛事" subtitle="公开赛事发现，不要求先拥有赛事身份" /><div className="space-y-6 px-4 py-5"><div className="space-y-3"><input value={listView.competitionKeyword} onChange={event => updateListView({ competitionKeyword: event.target.value })} placeholder="搜索赛事名称、主办方或关键词" className="min-h-touch w-full rounded-control border border-border bg-surface px-3 text-sm text-text-primary outline-none focus:border-primary" /><div className="flex gap-2 overflow-x-auto">{[["all","全部"],["registrationOpen","报名中"],["inProgress","进行中"],["upcoming","即将开放"],["ended","已结束"]].map(([value,label]) => <button key={value} onClick={() => updateListView({ competitionStatus: value })} className={`min-h-touch shrink-0 rounded-control px-3 text-sm font-medium ${listView.competitionStatus === value ? "bg-primary-container text-text-brand" : "bg-surface text-text-secondary"}`}>{label}</button>)}</div></div>{view !== "ready" ? <StateBlock state={view} /> : filtered.length ? <div className="space-y-3">{filtered.map(item => <CompetitionCard key={item.id} item={item} />)}</div> : <StateBlock state="empty" />}</div><PrototypeStateTools /></PublicShell>;
}

export function OpportunitiesPage() {
  useListScroll("opportunities");
  const { listView, updateListView } = usePublicPlatform();
  const view = usePrototypeView();
  const filtered = useMemo(() => opportunities.filter(item => (listView.opportunityMode === "all" || item.mode === listView.opportunityMode) && `${item.title}${companyById(item.companyId)?.name}${item.city}`.toLowerCase().includes(listView.opportunityKeyword.toLowerCase())), [listView.opportunityKeyword, listView.opportunityMode]);
  return <PublicShell><PageHeader title="机会" subtitle="实习、校招与企业项目实践" /><div className="space-y-5 px-4 py-5"><input value={listView.opportunityKeyword} onChange={event => updateListView({ opportunityKeyword: event.target.value })} placeholder="搜索岗位、企业或城市" className="min-h-touch w-full rounded-control border border-border bg-surface px-3 text-sm outline-none focus:border-primary" /><div className="flex gap-2 overflow-x-auto">{["all","实习","校招","项目实践"].map(value => <button key={value} onClick={() => updateListView({ opportunityMode: value })} className={`min-h-touch shrink-0 rounded-control px-3 text-sm font-medium ${listView.opportunityMode === value ? "bg-primary-container text-text-brand" : "bg-surface text-text-secondary"}`}>{value === "all" ? "全部" : value}</button>)}</div>{view !== "ready" ? <StateBlock state={view} /> : filtered.length ? <div className="space-y-3">{filtered.map(item => <OpportunityCard key={item.id} item={item} />)}</div> : <StateBlock state="empty" />}<Link to="/companies" className="block min-h-touch rounded-control bg-surface px-4 py-3 text-center text-sm font-medium text-text-brand">浏览合作企业</Link></div><PrototypeStateTools /></PublicShell>;
}

export function OpportunityDetailPage() {
  const navigate = useNavigate();
  const guest = useGuest();
  const { opportunityId } = useParams();
  const item = opportunityById(opportunityId);
  const { applications, submitApplication } = usePublicPlatform();
  const [resumeCheck, setResumeCheck] = useState(false);
  if (!item) return <PublicShell showNavigation={false}><PageHeader title="机会不存在" backTo="/opportunities" /><div className="px-4 py-6"><StateBlock state="error" /></div></PublicShell>;
  const company = companyById(item.companyId);
  const applied = applications.some(record => record.opportunityId === item.id);
  const apply = () => { submitApplication(item.id); navigate("/applications"); };
  return <PublicShell showNavigation={false}><PageHeader title="机会详情" backTo="/opportunities" /><ViewGate><div className="space-y-6 px-4 py-5"><div><StatusTag tone={item.status === "open" ? "success" : "neutral"}>{item.status === "open" ? item.mode : "已结束"}</StatusTag><h1 className="mt-3 text-2xl font-semibold text-text-primary">{item.title}</h1><button className="mt-2 min-h-touch text-left text-sm font-medium text-text-brand" onClick={() => navigate(`/companies/${item.companyId}?from=${encodeURIComponent(`/opportunities/${item.id}`)}`)}>{company?.name} · 查看企业</button><p className="mt-3 text-base leading-6 text-text-secondary">{item.summary}</p></div><Section title="岗位信息"><Card><p className="text-sm text-text-secondary">工作地点</p><p className="mt-1 font-medium text-text-primary">{item.city}</p><div className="mt-4 flex flex-wrap gap-2">{item.skills.map(skill => <StatusTag key={skill} tone="neutral">{skill}</StatusTag>)}</div></Card></Section>{resumeCheck && item.status === "open" && !applied && <Card className="border border-info bg-info-bg"><h2 className="font-semibold text-info-text">投递前检查长期简历</h2><p className="mt-2 text-sm leading-5 text-info-text">使用长期账号中的可信经历与学生自己维护的简历表达。</p><div className="mt-4 flex gap-2"><SecondaryButton className="flex-1" onClick={() => navigate(`/me/resume?returnTo=${encodeURIComponent(`/opportunities/${item.id}`)}`)}>查看长期简历</SecondaryButton><Button className="flex-1" onClick={apply}>确认投递</Button></div></Card>}<div>{item.status === "closed" ? <Button className="w-full" disabled>机会已结束</Button> : applied ? <Button className="w-full" disabled>已投递</Button> : guest ? <Button className="w-full" onClick={() => navigate(`/auth/login?returnTo=${encodeURIComponent(`/opportunities/${item.id}`)}`)}>登录后投递</Button> : <Button className="w-full" onClick={() => setResumeCheck(true)}>使用长期简历投递</Button>}</div></div></ViewGate><PrototypeStateTools /></PublicShell>;
}

export function CompaniesPage() {
  useListScroll("companies");
  const { listView, updateListView } = usePublicPlatform();
  const view = usePrototypeView();
  const filtered = companies.filter(item => `${item.name}${item.industry}${item.summary}`.toLowerCase().includes(listView.companyKeyword.toLowerCase()));
  return <PublicShell><PageHeader title="企业" subtitle="资源、品牌与机会合作方" backTo="/opportunities" /><div className="space-y-4 px-4 py-5"><input value={listView.companyKeyword} onChange={event => updateListView({ companyKeyword: event.target.value })} placeholder="搜索企业或行业" className="min-h-touch w-full rounded-control border border-border bg-surface px-3 text-sm outline-none focus:border-primary" />{view !== "ready" ? <StateBlock state={view} /> : filtered.length ? filtered.map(item => <Link key={item.id} to={`/companies/${item.id}`} className="block"><Card interactive><h2 className="text-base font-semibold text-text-primary">{item.name}</h2><p className="mt-1 text-sm text-text-brand">{item.industry}</p><p className="mt-3 text-sm leading-5 text-text-secondary">{item.summary}</p><p className="mt-3 text-xs text-text-tertiary">关联 {item.resourceRelations.length} 项赛事 / 权益 / 课程 / 活动 / 岗位资源</p></Card></Link>) : <StateBlock state="empty" />}</div><PrototypeStateTools /></PublicShell>;
}

export function CompanyDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { companyId } = useParams();
  const item = companyById(companyId);
  const { session, followedCompanies, toggleFollow } = usePublicPlatform();
  if (!item) return <PublicShell showNavigation={false}><PageHeader title="企业不存在" backTo="/companies" /><div className="px-4 py-6"><StateBlock state="error" /></div></PublicShell>;
  const followed = followedCompanies.includes(item.id);
  const from = new URLSearchParams(location.search).get("from");
  const follow = () => session.loggedIn ? toggleFollow(item.id) : navigate(`/auth/login?returnTo=${encodeURIComponent(`/companies/${item.id}${location.search}`)}`);
  return <PublicShell showNavigation={false}><PageHeader title="企业详情" backTo={from || "/companies"} /><ViewGate><div className="space-y-6 px-4 py-5"><div><StatusTag tone="info">合作企业</StatusTag><h1 className="mt-3 text-2xl font-semibold text-text-primary">{item.name}</h1><p className="mt-1 text-sm text-text-brand">{item.industry}</p><p className="mt-4 text-base leading-6 text-text-secondary">{item.summary}</p><SecondaryButton className="mt-4" onClick={follow}>{session.loggedIn ? followed ? "已关注" : "关注企业" : "登录后关注"}</SecondaryButton></div><Section title="与平台的资源关系"><div className="space-y-2">{item.resourceRelations.map((relation,index) => relation.to ? <button key={`${relation.type}-${index}`} className="flex min-h-touch w-full items-center justify-between rounded-control bg-surface px-3 py-2 text-left active:bg-surface-pressed" onClick={() => navigate(relation.to!)}><span><StatusTag tone="neutral">{relation.type}</StatusTag><span className="ml-2 text-sm font-medium text-text-primary">{relation.title}</span></span><span className="text-text-tertiary">›</span></button> : <div key={`${relation.type}-${index}`} className="flex min-h-touch w-full items-center justify-between rounded-control bg-surface px-3 py-2"><span><StatusTag tone="neutral">{relation.type}</StatusTag><span className="ml-2 text-sm font-medium text-text-primary">{relation.title}</span></span><span className="text-xs text-text-tertiary">线下 / 待接入</span></div>)}</div></Section><Section title="当前机会"><div className="space-y-3">{opportunities.filter(opportunity => opportunity.companyId === item.id).map(opportunity => <OpportunityCard key={opportunity.id} item={opportunity} />)}</div></Section></div></ViewGate><PrototypeStateTools /></PublicShell>;
}

export function ApplicationsPage() {
  const navigate = useNavigate();
  const view = usePrototypeView();
  const { session, applications, setApplicationStatus } = usePublicPlatform();
  if (!session.loggedIn) return <PublicShell><PageHeader title="投递记录" backTo="/opportunities" /><div className="px-4 py-6"><Card className="py-8 text-center"><p className="font-semibold text-text-primary">登录后查看投递记录</p><Button className="mt-4" onClick={() => navigate("/auth/login?returnTo=%2Fapplications")}>登录</Button></Card></div></PublicShell>;
  return <PublicShell><PageHeader title="投递记录" backTo="/opportunities" /><div className="space-y-3 px-4 py-5">{view !== "ready" ? <StateBlock state={view} /> : applications.length ? applications.map(record => { const item = opportunityById(record.opportunityId); const company = companyById(item?.companyId); if (!item) return null; return <Card key={record.opportunityId}><Link to={`/opportunities/${record.opportunityId}`} className="block"><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-text-primary">{item.title}</h2><p className="mt-1 text-sm text-text-secondary">{company?.name}</p></div><StatusTag tone={record.status === "submitted" ? "success" : "warning"}>{record.status === "submitted" ? "已投递" : "状态待回流"}</StatusTag></div></Link><details className="mt-3 border-t border-border-subtle pt-3 text-xs text-text-secondary"><summary className="cursor-pointer">原型投递状态</summary><div className="mt-2 flex gap-2"><button className="min-h-touch rounded-control px-2 text-text-brand" onClick={() => setApplicationStatus(record.opportunityId,"submitted")}>submitted</button><button className="min-h-touch rounded-control px-2 text-text-brand" onClick={() => setApplicationStatus(record.opportunityId,"statusUnknown")}>statusUnknown</button></div></details></Card>; }) : <Card className="py-8 text-center"><p className="font-semibold text-text-primary">还没有投递记录</p><p className="mt-2 text-sm text-text-secondary">先去看看适合你的实习与项目机会。</p><Button className="mt-4" onClick={() => navigate("/opportunities")}>去找机会</Button></Card>}</div><PrototypeStateTools /></PublicShell>;
}

export function LoginBoundaryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, continueAsGuest } = usePublicPlatform();
  const returnTo = new URLSearchParams(location.search).get("returnTo") || "/home";
  const signIn = () => { login(); navigate(returnTo); };
  const browseAsGuest = () => { continueAsGuest(); navigate("/home"); };
  return <PublicShell showNavigation={false}><PageHeader title="登录" /><div className="space-y-5 px-4 py-8"><Card><h1 className="text-lg font-semibold text-text-primary">登录后继续</h1><p className="mt-2 text-sm leading-5 text-text-secondary">公开赛事、机会和企业可以直接浏览；报名、投递及长期账号内容需要登录。</p></Card><Button className="w-full" onClick={signIn}>使用原型账号登录</Button><GhostButton className="w-full" onClick={browseAsGuest}>以游客身份继续浏览</GhostButton></div></PublicShell>;
}
