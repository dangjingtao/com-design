import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, Card, PageHeader, PublicShell, SecondaryButton, Section, StatusTag } from "../../components/ui";
import { usePublicPlatform } from "../public-platform/PublicPlatform";
import { competitionById, type Competition } from "../public-platform/data";
import { resourceById, workshopTasks, workspaceData, type WorkshopLifecycle } from "./data";
import { nextReadyTask, taskAvailability, useWorkshopRuntime } from "./runtime";
import { CompetitionContextLine, RequireCompetitionAccess, useCompetitionAccess, WorkspaceBlocked, WorkspaceScenarioTools } from "./shared";

const identityTone = (status: string) => status === "active" ? "success" as const : status === "pending" ? "warning" as const : status === "rejected" ? "danger" as const : "neutral" as const;
const registrationWindowLabel = (competition: Competition) => competition.status === "registrationOpen" ? "报名中" : competition.status === "upcoming" ? "尚未开放" : competition.status === "ended" ? "已关闭" : "报名已结束";
const lifecyclePresentation = (lifecycle: WorkshopLifecycle) => lifecycle === "ended" ? ["赛事已结束", "neutral"] as const : lifecycle === "notStarted" ? ["赛事未开始", "warning"] as const : ["赛事进行中", "info"] as const;

export function CompetitionLifecycleDetailPage() {
  const navigate = useNavigate();
  const { competitionId } = useParams();
  const { session } = usePublicPlatform();
  const { identityFor, getRuntime } = useWorkshopRuntime();
  if (!competitionId) return null;
  const competition = competitionById(competitionId);
  if (!competition) return <PublicShell showNavigation={false}><PageHeader title="赛事不存在" backTo="/competitions" /><div className="px-4 py-6"><Card><p className="text-text-secondary">未找到对应赛事。</p></Card></div></PublicShell>;
  const identity = identityFor(competitionId);
  const runtime = getRuntime(competitionId);
  const [lifecycleLabel, lifecycleTone] = lifecyclePresentation(runtime.lifecycle);
  const guest = !session.loggedIn;
  const canRegister = !guest && runtime.lifecycle !== "ended" && competition.status === "registrationOpen" && competition.eligibility !== "ineligible";
  const active = identity?.identityStatus === "active";
  const pendingOrRejected = identity?.identityStatus === "pending" || identity?.identityStatus === "rejected";
  const hasAssetHandoff = Boolean(identity) && (runtime.lifecycle === "ended" || identity?.identityStatus === "revoked");
  return <PublicShell showNavigation={false}><PageHeader title="赛事详情" subtitle="报名窗口与赛事阶段分开表达" backTo="/competitions" /><div className="space-y-6 px-4 py-5">
    <div><StatusTag tone={lifecycleTone}>{lifecycleLabel}</StatusTag><h1 className="mt-3 text-2xl font-semibold leading-8 text-text-primary">{competition.name}</h1><p className="mt-2 text-sm text-text-secondary">{competition.organizer}</p><p className="mt-4 text-base leading-6 text-text-secondary">{competition.summary}</p></div>
    <Section title="当前账号与赛事"><Card><div className="space-y-3 text-sm"><div className="flex justify-between gap-4"><span className="text-text-secondary">报名窗口</span><span className="font-medium text-text-primary">{competition.registrationEnds ?? registrationWindowLabel(competition)}</span></div><div className="flex justify-between gap-4"><span className="text-text-secondary">赛事阶段</span><span className="font-medium text-text-primary">{lifecycleLabel}</span></div><div className="flex justify-between gap-4"><span className="text-text-secondary">赛事身份</span><span className="font-medium text-text-primary">{guest ? "登录后查看" : identity?.identityStatus ?? "暂无"}</span></div><div className="flex justify-between gap-4"><span className="text-text-secondary">报名状态</span><span className="font-medium text-text-primary">{guest ? "登录后查看" : identity?.registrationStatus ?? "未报名"}</span></div></div></Card></Section>
    {competition.eligibility === "ineligible" && <Card className="border border-warning bg-warning-bg"><p className="font-medium text-warning-text">当前条件暂不满足报名资格</p><p className="mt-2 text-sm text-warning-text">T03 不自行定义完整资格规则。</p></Card>}
    {runtime.lifecycle === "ended" && <Card className="border border-border-subtle"><p className="font-medium text-text-primary">赛事期操作已经结束</p><p className="mt-2 text-sm text-text-secondary">详情页与 workspace / workshop 共用同一 competition lifecycle；拥有历史赛事身份的账号可从 workspace 转入长期资产。</p></Card>}
    <div className="space-y-2">{guest ? runtime.lifecycle === "ended" ? <Button className="w-full" disabled>赛事已结束</Button> : <Button className="w-full" onClick={() => navigate(`/auth/login?returnTo=/competitions/${competitionId}/registration`)}>登录后报名</Button> : runtime.lifecycle === "ended" ? hasAssetHandoff ? <Button className="w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace`)}>查看赛后出口</Button> : <Button className="w-full" disabled>赛事已结束</Button> : active ? <Button className="w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace`)}>进入赛事工作区</Button> : pendingOrRejected ? <Button className="w-full" onClick={() => navigate(`/competitions/${competitionId}/registration`)}>查看报名 / 审核状态</Button> : identity?.identityStatus === "revoked" ? <Button className="w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace`)}>查看赛后出口</Button> : canRegister ? <Button className="w-full" onClick={() => navigate(`/competitions/${competitionId}/registration`)}>进入报名</Button> : <Button className="w-full" disabled>{competition.status === "upcoming" ? "报名尚未开始" : "暂不可报名"}</Button>}<SecondaryButton className="w-full" onClick={() => guest ? navigate("/auth/login?returnTo=/competitions/mine") : navigate("/competitions/mine")}>查看我的赛事</SecondaryButton></div>
    {!guest && <WorkspaceScenarioTools competitionId={competitionId} />}
  </div></PublicShell>;
}

export function MyCompetitionsLifecyclePage() {
  const navigate = useNavigate();
  const { session, identities } = usePublicPlatform();
  const { getRuntime } = useWorkshopRuntime();
  if (!session.loggedIn) return <PublicShell><PageHeader title="我的赛事" backTo="/competitions" /><div className="px-4 py-6"><Card className="py-8 text-center"><p className="font-semibold text-text-primary">登录后查看我的赛事</p><p className="mt-2 text-sm text-text-secondary">游客仍可继续浏览公开赛事，不读取账号赛事身份。</p><Button className="mt-4" onClick={() => navigate("/auth/login?returnTo=/competitions/mine")}>登录</Button></Card></div></PublicShell>;
  return <PublicShell><PageHeader title="我的赛事" subtitle="读取长期账号唯一赛事身份集合" backTo="/competitions" /><div className="space-y-3 px-4 py-5">
    {identities.length ? identities.map(identity => {
      const competition = competitionById(identity.competitionId);
      if (!competition) return null;
      const runtime = getRuntime(identity.competitionId);
      const [lifecycleLabel] = lifecyclePresentation(runtime.lifecycle);
      const ended = runtime.lifecycle === "ended";
      return <Card key={identity.competitionId} interactive>
        <div className="flex items-start justify-between gap-3"><div><h2 className="text-base font-semibold text-text-primary">{competition.name}</h2><p className="mt-1 text-sm text-text-secondary">报名 {identity.registrationStatus} · {lifecycleLabel}</p></div><StatusTag tone={identityTone(identity.identityStatus)}>{identity.identityStatus}</StatusTag></div>
        {ended && (identity.identityStatus === "active" || identity.identityStatus === "revoked") && <Button className="mt-4 w-full" onClick={() => navigate(`/competitions/${identity.competitionId}/workspace`)}>查看赛后出口</Button>}
        {ended && identity.identityStatus !== "active" && identity.identityStatus !== "revoked" && <SecondaryButton className="mt-4 w-full" onClick={() => navigate(`/competitions/${identity.competitionId}`)}>查看赛事详情</SecondaryButton>}
        {!ended && identity.identityStatus === "active" && <Button className="mt-4 w-full" onClick={() => navigate(`/competitions/${identity.competitionId}/workspace`)}>进入赛事工作区</Button>}
        {!ended && (identity.identityStatus === "pending" || identity.identityStatus === "rejected") && <SecondaryButton className="mt-4 w-full" onClick={() => navigate(`/competitions/${identity.competitionId}/registration`)}>查看报名状态</SecondaryButton>}
        {!ended && identity.identityStatus === "revoked" && <SecondaryButton className="mt-4 w-full" onClick={() => navigate(`/competitions/${identity.competitionId}/workspace`)}>查看赛后出口</SecondaryButton>}
      </Card>;
    }) : <Card className="py-8 text-center"><p className="font-semibold text-text-primary">你还没有赛事身份</p><p className="mt-2 text-sm text-text-secondary">公共赛事仍可正常浏览。</p><Button className="mt-4" onClick={() => navigate("/competitions")}>发现赛事</Button></Card>}
  </div></PublicShell>;
}

export function RegistrationLifecyclePage() {
  const navigate = useNavigate();
  const { competitionId } = useParams();
  const competition = competitionById(competitionId);
  const { session } = usePublicPlatform();
  const { identityFor, setIdentityScenario, getRuntime, setLifecycle } = useWorkshopRuntime();
  const identity = competitionId ? identityFor(competitionId) : undefined;
  const [external, setExternal] = useState(false);
  if (!competitionId || !competition) return null;
  if (!session.loggedIn) return <PublicShell showNavigation={false}><PageHeader title="赛事报名" backTo={`/competitions/${competitionId}`} /><div className="px-4 py-6"><Card className="py-8 text-center"><p className="font-semibold text-text-primary">登录后继续报名</p><p className="mt-2 text-sm text-text-secondary">报名与赛事身份属于长期账号状态，游客不会读取或创建赛事身份。</p><Button className="mt-4" onClick={() => navigate(`/auth/login?returnTo=/competitions/${competitionId}/registration`)}>登录</Button></Card></div></PublicShell>;
  const runtime = getRuntime(competitionId);
  if (runtime.lifecycle === "ended") return <PublicShell showNavigation={false}><PageHeader title="赛事报名" backTo={`/competitions/${competitionId}`} /><div className="space-y-4 px-4 py-6"><Card className="border border-border-subtle"><StatusTag tone="neutral">赛事已结束</StatusTag><h1 className="mt-3 text-lg font-semibold text-text-primary">报名与审核操作已关闭</h1><p className="mt-2 text-sm text-text-secondary">这里与赛事详情、workspace、workshop 共用同一 lifecycle source。</p></Card><SecondaryButton className="w-full" onClick={() => navigate(`/competitions/${competitionId}`)}>返回赛事详情</SecondaryButton></div></PublicShell>;

  const submit = () => { setIdentityScenario(competitionId, "pending"); setExternal(false); };
  const approve = () => { setIdentityScenario(competitionId, "active"); setLifecycle(competitionId, "inProgress"); navigate(`/competitions/${competitionId}/workspace`); };
  const reject = () => { setIdentityScenario(competitionId, "rejected"); setExternal(false); };

  const state = identity?.identityStatus === "active" ? "approved" : identity?.identityStatus === "pending" ? "pending" : identity?.identityStatus === "rejected" ? "rejected" : external ? "external" : "ready";
  return <PublicShell showNavigation={false}><PageHeader title="赛事报名" subtitle="响应式报名 handoff + App 状态回流" backTo={`/competitions/${competitionId}`} /><div className="space-y-5 px-4 py-6">
    <Card><StatusTag tone={state === "approved" ? "success" : state === "rejected" ? "danger" : state === "pending" ? "warning" : "info"}>{state}</StatusTag><h1 className="mt-3 text-lg font-semibold text-text-primary">{competition.name}</h1><p className="mt-2 text-sm leading-5 text-text-secondary">复杂表单仍由既有响应式报名层承接；App 只模拟跳入、回流、审核结果与赛事身份授予。</p></Card>
    {state === "ready" && <Button className="w-full" onClick={() => setExternal(true)}>进入响应式报名（模拟）</Button>}
    {state === "external" && <Card className="border border-info bg-info-bg"><p className="font-medium text-info-text">当前位于响应式报名层</p><p className="mt-2 text-sm leading-5 text-info-text">这里不重新实现队长/队员、团队成员与复杂报名表单。</p><Button className="mt-4 w-full" onClick={submit}>模拟提交并回流 App</Button></Card>}
    {state === "pending" && <><Card className="border border-warning bg-warning-bg"><p className="font-medium text-warning-text">报名已提交，等待学校审核真实性</p><p className="mt-2 text-sm text-warning-text">pending 已写入公共账号 identities[]；审核前不会获得 workspace 权限。</p></Card><div className="grid grid-cols-2 gap-2"><SecondaryButton onClick={reject}>模拟审核未通过</SecondaryButton><Button onClick={approve}>模拟审核通过</Button></div><SecondaryButton className="w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace`)}>验证 workspace 被阻止</SecondaryButton></>}
    {state === "rejected" && <><Card className="border border-danger bg-danger-bg"><p className="font-medium text-danger-text">报名审核未通过</p><p className="mt-2 text-sm text-danger-text">共享账号身份已变为 rejected；不授予赛事工作区权限。</p></Card><SecondaryButton className="w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace`)}>验证 workspace 被阻止</SecondaryButton><Button className="w-full" onClick={() => { setIdentityScenario(competitionId, "none"); setExternal(false); }}>恢复未报名状态</Button></>}
    {state === "approved" && <><Card className="border border-success bg-success-bg"><p className="font-medium text-success-text">审核通过，已获得赛事身份</p><p className="mt-2 text-sm text-success-text">同一 active 身份会被首页、我的赛事和 workspace 共同读取。</p></Card><Button className="w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace`)}>进入赛事工作区</Button></>}
  </div></PublicShell>;
}

export function CompetitionWorkspacePage() {
  const navigate = useNavigate();
  const { competitionId } = useParams();
  if (!competitionId) return null;
  const competition = competitionById(competitionId);
  const data = workspaceData[competitionId];
  const access = useCompetitionAccess(competitionId);
  const { identityFor, getRuntime } = useWorkshopRuntime();
  const identity = identityFor(competitionId);
  const runtime = getRuntime(competitionId);

  if (access !== "active" && access !== "notStarted") return <PublicShell showNavigation={false}><PageHeader title="赛事工作区" subtitle="赛事身份与生命周期" backTo={`/competitions/${competitionId}`} /><WorkspaceBlocked competitionId={competitionId} state={access} /><div className="px-4 pb-6"><WorkspaceScenarioTools competitionId={competitionId} /></div></PublicShell>;
  if (!data) return <PublicShell showNavigation={false}><PageHeader title="赛事工作区" backTo={`/competitions/${competitionId}`} /><div className="px-4 py-6"><Card><p className="font-medium text-text-primary">该赛事尚未配置 T03 workspace 数据。</p></Card></div></PublicShell>;

  const activeRunTask = workshopTasks.find(task => ["queued", "running", "failed"].includes(runtime.taskRuns[task.id]?.status ?? ""));
  const nextTask = activeRunTask ?? nextReadyTask(runtime);
  const nextTaskStatus = nextTask ? taskAvailability(runtime, nextTask.id) : undefined;
  const notStarted = access === "notStarted";
  return <PublicShell showNavigation={false}><PageHeader title="赛事工作区" subtitle="当前打开赛事，不代表账号全部赛事" backTo="/competitions/mine" /><div className="space-y-7 px-4 py-5">
    <div><CompetitionContextLine competitionId={competitionId} /><h1 className="mt-3 text-xl font-semibold text-text-primary">{competition?.name}</h1><p className="mt-2 text-sm text-text-secondary">身份：{identity?.identityStatus} · 团队：{data.team.name}</p></div>
    {notStarted && <Card className="border border-info bg-info-bg"><StatusTag tone="info">赛事未开始</StatusTag><h2 className="mt-3 font-semibold text-info-text">先确认团队和资料，赛事任务暂不执行</h2><p className="mt-2 text-sm text-info-text">此状态来自共享 lifecycle state，不复制另一张 workspace 页面。</p></Card>}
    <Section title="当前最重要的下一步"><Card className="border border-border-subtle"><StatusTag tone={notStarted ? "info" : "warning"}>{notStarted ? "等待赛事开始" : "下一任务"}</StatusTag><h2 className="mt-3 text-lg font-semibold text-text-primary">{notStarted ? "确认团队与赛事资料已准备" : nextTask?.title ?? "当前没有待执行任务"}</h2><p className="mt-2 text-sm leading-5 text-text-secondary">{notStarted ? "团队与资料入口保持可用；创赛工坊执行动作将在赛事开始后开放。" : nextTask?.summary ?? "可以查看已经生成的成果。"}</p>{!notStarted && nextTask && <Button className="mt-4 w-full" onClick={() => navigate(nextTaskStatus === "queued" || nextTaskStatus === "running" || nextTaskStatus === "failed" ? `/competitions/${competitionId}/workspace/workshop/tasks/${nextTask.id}/progress` : `/competitions/${competitionId}/workspace/workshop/tasks/${nextTask.id}/answer`)}>{activeRunTask ? "继续当前任务" : "继续下一步"}</Button>}</Card></Section>
    <Section title="当前项目 / 团队"><div className="space-y-2"><button className="flex min-h-touch w-full items-center justify-between rounded-control bg-surface px-3 text-left" onClick={() => navigate(`/competitions/${competitionId}/workspace/workshop/project`)}><span><strong className="block text-sm text-text-primary">{data.project.name}</strong><span className="text-xs text-text-secondary">{data.project.currentStage}</span></span><span>›</span></button><button className="flex min-h-touch w-full items-center justify-between rounded-control bg-surface px-3 text-left" onClick={() => navigate(`/competitions/${competitionId}/workspace/team`)}><span><strong className="block text-sm text-text-primary">{data.team.name}</strong><span className="text-xs text-text-secondary">{data.team.members.length} 名成员 · 当前角色 {data.team.role}</span></span><span>›</span></button></div></Section>
    <Section title="赛事能力"><div className="space-y-2"><button disabled={notStarted} className="flex min-h-touch w-full items-center justify-between rounded-control bg-primary-container px-3 text-left disabled:opacity-50" onClick={() => navigate(`/competitions/${competitionId}/workspace/workshop`)}><span><strong className="block text-sm text-text-brand">创赛工坊</strong><span className="text-xs text-text-secondary">围绕当前三创赛项目继续陪跑</span></span><span>›</span></button><button className="flex min-h-touch w-full items-center justify-between rounded-control bg-surface px-3 text-left" onClick={() => navigate(`/competitions/${competitionId}/workspace/resources`)}><span><strong className="block text-sm text-text-primary">赛事资料</strong><span className="text-xs text-text-secondary">规则、模板与赛道资料</span></span><span>›</span></button><button className="flex min-h-touch w-full items-center justify-between rounded-control bg-surface px-3 text-left" onClick={() => navigate(`/benefits?competition=${competitionId}`)}><span><strong className="block text-sm text-text-primary">赛事权益</strong><span className="text-xs text-text-secondary">T04 handoff，不在本卡深层实现</span></span><span>›</span></button></div></Section>
    <WorkspaceScenarioTools competitionId={competitionId} />
  </div></PublicShell>;
}

export function CompetitionTeamPage() {
  const { competitionId } = useParams();
  if (!competitionId) return null;
  const data = workspaceData[competitionId];
  return <PublicShell showNavigation={false}><PageHeader title="我的团队" subtitle="当前赛事团队" backTo={`/competitions/${competitionId}/workspace`} /><RequireCompetitionAccess allowNotStarted><div className="space-y-6 px-4 py-5"><CompetitionContextLine competitionId={competitionId} />{data ? <><Card><h1 className="text-lg font-semibold text-text-primary">{data.team.name}</h1><p className="mt-2 text-sm text-text-secondary">团队 ID {data.team.id} · 我的角色 {data.team.role}</p></Card><Section title="成员"><div className="space-y-2">{data.team.members.map(member => <Card key={member.name}><div className="flex items-start justify-between gap-3"><div><p className="font-medium text-text-primary">{member.name}</p><p className="mt-1 text-sm text-text-secondary">{member.school}</p></div><StatusTag tone="neutral">{member.role}</StatusTag></div></Card>)}</div></Section></> : <Card><p className="text-text-secondary">暂无团队数据。</p></Card>}</div></RequireCompetitionAccess></PublicShell>;
}

export function CompetitionResourcesPage() {
  const { competitionId } = useParams();
  if (!competitionId) return null;
  const data = workspaceData[competitionId];
  return <PublicShell showNavigation={false}><PageHeader title="赛事资料" subtitle="只属于当前赛事上下文" backTo={`/competitions/${competitionId}/workspace`} /><RequireCompetitionAccess allowNotStarted><div className="space-y-5 px-4 py-5"><CompetitionContextLine competitionId={competitionId} />{data?.resources.map(resource => <Link className="block" key={resource.id} to={`/competitions/${competitionId}/workspace/resources/${resource.id}`}><Card interactive><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-text-primary">{resource.title}</h2><p className="mt-2 text-sm text-text-secondary">{resource.description}</p><p className="mt-2 text-xs text-text-tertiary">更新于 {resource.updatedAt}</p></div><StatusTag tone="neutral">{resource.category}</StatusTag></div></Card></Link>)}</div></RequireCompetitionAccess></PublicShell>;
}

export function CompetitionResourceDetailPage() {
  const { competitionId, resourceId } = useParams();
  if (!competitionId) return null;
  const resource = resourceById(competitionId, resourceId);
  return <PublicShell showNavigation={false}><PageHeader title="资料详情" backTo={`/competitions/${competitionId}/workspace/resources`} /><RequireCompetitionAccess allowNotStarted><div className="space-y-5 px-4 py-5"><CompetitionContextLine competitionId={competitionId} />{resource ? <Card><StatusTag tone="neutral">{resource.category}</StatusTag><h1 className="mt-3 text-lg font-semibold text-text-primary">{resource.title}</h1><p className="mt-3 text-sm leading-6 text-text-secondary">{resource.description}</p><p className="mt-4 text-xs text-text-tertiary">更新于 {resource.updatedAt}</p><Button className="mt-5 w-full" onClick={() => alert("原型：已触发资料保存动作")}>保存资料（原型）</Button></Card> : <Card><p className="text-text-secondary">资料不存在或已失效。</p></Card>}</div></RequireCompetitionAccess></PublicShell>;
}
