import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, Card, PageHeader, PublicShell, SecondaryButton, Section, StatusTag } from "../../components/ui";
import { competitionById } from "../public-platform/data";
import { resourceById, workshopTasks, workspaceData } from "./data";
import { nextReadyTask, taskAvailability, useWorkshopRuntime } from "./runtime";
import { CompetitionContextLine, RequireCompetitionAccess, useCompetitionAccess, WorkspaceBlocked, WorkspaceScenarioTools } from "./shared";

const identityTone = (status: string) => status === "active" ? "success" as const : status === "pending" ? "warning" as const : status === "rejected" ? "danger" as const : "neutral" as const;

export function MyCompetitionsLifecyclePage() {
  const navigate = useNavigate();
  const { identities } = useWorkshopRuntime();
  return <PublicShell><PageHeader title="我的赛事" subtitle="一个账号可以关联多个赛事身份" backTo="/competitions" /><div className="space-y-3 px-4 py-5">
    {identities.length ? identities.map(identity => {
      const competition = competitionById(identity.competitionId);
      if (!competition) return null;
      return <Card key={identity.competitionId} interactive>
        <div className="flex items-start justify-between gap-3"><div><h2 className="text-base font-semibold text-text-primary">{competition.name}</h2><p className="mt-1 text-sm text-text-secondary">报名 {identity.registrationStatus} · 赛事 {identity.competitionStatus}</p></div><StatusTag tone={identityTone(identity.identityStatus)}>{identity.identityStatus}</StatusTag></div>
        {identity.identityStatus === "active" && <Button className="mt-4 w-full" onClick={() => navigate(`/competitions/${identity.competitionId}/workspace`)}>进入赛事工作区</Button>}
        {(identity.identityStatus === "pending" || identity.identityStatus === "rejected") && <SecondaryButton className="mt-4 w-full" onClick={() => navigate(`/competitions/${identity.competitionId}/registration`)}>查看报名状态</SecondaryButton>}
        {identity.identityStatus === "revoked" && <SecondaryButton className="mt-4 w-full" onClick={() => navigate(`/competitions/${identity.competitionId}/workspace`)}>查看赛后出口</SecondaryButton>}
      </Card>;
    }) : <Card className="py-8 text-center"><p className="font-semibold text-text-primary">你还没有赛事身份</p><p className="mt-2 text-sm text-text-secondary">公共赛事仍可正常浏览。</p><Button className="mt-4" onClick={() => navigate("/competitions")}>发现赛事</Button></Card>}
  </div></PublicShell>;
}

export function RegistrationLifecyclePage() {
  const navigate = useNavigate();
  const { competitionId } = useParams();
  const competition = competitionById(competitionId);
  const { identityFor, setIdentityScenario, setLifecycle } = useWorkshopRuntime();
  const identity = competitionId ? identityFor(competitionId) : undefined;
  const [external, setExternal] = useState(false);
  if (!competitionId || !competition) return null;

  const submit = () => { setIdentityScenario(competitionId, "pending"); setExternal(false); };
  const approve = () => { setIdentityScenario(competitionId, "active"); setLifecycle(competitionId, "inProgress"); navigate(`/competitions/${competitionId}/workspace`); };
  const reject = () => { setIdentityScenario(competitionId, "rejected"); setExternal(false); };

  const state = identity?.identityStatus === "active" ? "approved" : identity?.identityStatus === "pending" ? "pending" : identity?.identityStatus === "rejected" ? "rejected" : external ? "external" : "ready";
  return <PublicShell showNavigation={false}><PageHeader title="赛事报名" subtitle="响应式报名 handoff + App 状态回流" backTo={`/competitions/${competitionId}`} /><div className="space-y-5 px-4 py-6">
    <Card><StatusTag tone={state === "approved" ? "success" : state === "rejected" ? "danger" : state === "pending" ? "warning" : "info"}>{state}</StatusTag><h1 className="mt-3 text-lg font-semibold text-text-primary">{competition.name}</h1><p className="mt-2 text-sm leading-5 text-text-secondary">复杂表单仍由既有响应式报名层承接；App 只模拟跳入、回流、审核结果与赛事身份授予。</p></Card>
    {state === "ready" && <Button className="w-full" onClick={() => setExternal(true)}>进入响应式报名（模拟）</Button>}
    {state === "external" && <Card className="border border-info bg-info-bg"><p className="font-medium text-info-text">当前位于响应式报名层</p><p className="mt-2 text-sm leading-5 text-info-text">这里不重新实现队长/队员、团队成员与复杂报名表单。</p><Button className="mt-4 w-full" onClick={submit}>模拟提交并回流 App</Button></Card>}
    {state === "pending" && <><Card className="border border-warning bg-warning-bg"><p className="font-medium text-warning-text">报名已提交，等待学校审核真实性</p><p className="mt-2 text-sm text-warning-text">pending 身份不会提前获得 workspace 权限。</p></Card><div className="grid grid-cols-2 gap-2"><SecondaryButton onClick={reject}>模拟审核未通过</SecondaryButton><Button onClick={approve}>模拟审核通过</Button></div><SecondaryButton className="w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace`)}>验证 workspace 被阻止</SecondaryButton></>}
    {state === "rejected" && <><Card className="border border-danger bg-danger-bg"><p className="font-medium text-danger-text">报名审核未通过</p><p className="mt-2 text-sm text-danger-text">不授予赛事身份；返回公开赛事状态，不在 workspace 内继续。</p></Card><SecondaryButton className="w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace`)}>验证 workspace 被阻止</SecondaryButton><Button className="w-full" onClick={() => { setIdentityScenario(competitionId, "none"); setExternal(false); }}>恢复未报名状态</Button></>}
    {state === "approved" && <><Card className="border border-success bg-success-bg"><p className="font-medium text-success-text">审核通过，已获得赛事身份</p><p className="mt-2 text-sm text-success-text">赛事身份绑定到长期账号；当前可以进入该赛事 workspace。</p></Card><Button className="w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace`)}>进入赛事工作区</Button></>}
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
