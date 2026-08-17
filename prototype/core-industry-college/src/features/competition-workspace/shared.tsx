import type { ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, SecondaryButton, StatusTag } from "../../components/ui";
import type { TaskRunStatus } from "../../state/model";
import { competitionById } from "../public-platform/data";
import { useWorkshopRuntime } from "./runtime";

export type WorkspaceAccessState = "noIdentity" | "pending" | "rejected" | "active" | "notStarted" | "ended" | "revoked" | "permissionDenied";

export function useCompetitionAccess(competitionId?: string): WorkspaceAccessState {
  const { identityFor, getRuntime } = useWorkshopRuntime();
  if (!competitionId) return "noIdentity";
  const identity = identityFor(competitionId);
  const runtime = getRuntime(competitionId);
  if (!identity) return "noIdentity";
  if (identity.identityStatus === "pending") return "pending";
  if (identity.identityStatus === "rejected") return "rejected";
  if (identity.identityStatus === "revoked") return "revoked";
  if (identity.identityStatus !== "active") return "noIdentity";
  if (runtime.permissionDenied) return "permissionDenied";
  if (runtime.lifecycle === "ended") return "ended";
  if (runtime.lifecycle === "notStarted") return "notStarted";
  return "active";
}

const accessCopy: Record<Exclude<WorkspaceAccessState, "active" | "notStarted">, { title: string; body: string; tone: "warning" | "danger" | "neutral" }> = {
  noIdentity: { title: "当前账号没有该赛事身份", body: "赛事公开信息仍可查看；赛事工作区需要对应赛事身份。", tone: "warning" },
  pending: { title: "报名正在审核", body: "报名已经回流 App，但审核完成前不会提前授予赛事工作区权限。", tone: "warning" },
  rejected: { title: "本次报名未通过审核", body: "赛事工作区未开放。可返回报名状态页查看当前结果，不在工作区内继续操作。", tone: "danger" },
  ended: { title: "赛事已经结束", body: "赛事期操作已经关闭；成绩、证书和参赛经历转入长期账号资产。", tone: "neutral" },
  revoked: { title: "赛事期权限已回收", body: "比赛结束后赛事身份可以失效，但赛后长期资产仍然保留。", tone: "neutral" },
  permissionDenied: { title: "当前赛事权限不足", body: "账号拥有赛事身份，但当前工作区权限不可用。请返回赛事状态页。", tone: "danger" },
};

export function WorkspaceBlocked({ competitionId, state, backTo }: { competitionId: string; state: Exclude<WorkspaceAccessState, "active" | "notStarted">; backTo?: string }) {
  const navigate = useNavigate();
  const copy = accessCopy[state];
  const assetHandoff = state === "ended" || state === "revoked";
  return <div className="space-y-4 px-4 py-6">
    <Card className={copy.tone === "danger" ? "border border-danger bg-danger-bg" : copy.tone === "warning" ? "border border-warning bg-warning-bg" : "border border-border-subtle"}>
      <StatusTag tone={copy.tone}>{state === "pending" ? "审核中" : state === "rejected" ? "已拒绝" : state === "permissionDenied" ? "无权限" : "赛事状态"}</StatusTag>
      <h2 className="mt-3 text-lg font-semibold text-text-primary">{copy.title}</h2>
      <p className="mt-2 text-sm leading-5 text-text-secondary">{copy.body}</p>
    </Card>
    {assetHandoff ? <div className="space-y-2">
      <Button className="w-full" onClick={() => navigate("/assets/experiences")}>查看参赛经历</Button>
      <SecondaryButton className="w-full" onClick={() => navigate("/assets/results")}>查看成绩 / 证书 handoff</SecondaryButton>
    </div> : <div className="space-y-2">
      <Button className="w-full" onClick={() => navigate(`/competitions/${competitionId}/registration`)}>查看报名状态</Button>
      <SecondaryButton className="w-full" onClick={() => navigate(backTo ?? `/competitions/${competitionId}`)}>返回赛事详情</SecondaryButton>
    </div>}
  </div>;
}

export function RequireCompetitionAccess({ children, allowNotStarted = false }: { children: ReactNode; allowNotStarted?: boolean }) {
  const { competitionId } = useParams();
  const state = useCompetitionAccess(competitionId);
  if (!competitionId) return null;
  if (state === "active" || (allowNotStarted && state === "notStarted")) return <>{children}</>;
  if (state === "notStarted") return <div className="space-y-4 px-4 py-6"><Card className="border border-info bg-info-bg"><StatusTag tone="info">赛事未开始</StatusTag><h2 className="mt-3 text-lg font-semibold text-info-text">赛事期任务还没有开放</h2><p className="mt-2 text-sm leading-5 text-info-text">团队与资料可以提前查看，创赛工坊执行动作等赛事开始后再开放。</p></Card><SecondaryButton className="w-full" onClick={() => window.history.back()}>返回赛事工作区</SecondaryButton></div>;
  return <WorkspaceBlocked competitionId={competitionId} state={state} />;
}

export function WorkspaceScenarioTools({ competitionId }: { competitionId: string }) {
  const { identityFor, setIdentityScenario, getRuntime, setLifecycle, setPermissionDenied, resetCompetition } = useWorkshopRuntime();
  const identity = identityFor(competitionId);
  const runtime = getRuntime(competitionId);
  return <details className="rounded-container border border-border-subtle bg-surface p-3 text-xs text-text-secondary">
    <summary className="cursor-pointer font-medium text-text-brand">T03 生命周期状态</summary>
    <div className="mt-3 space-y-3">
      <div><p className="mb-2">赛事身份：{identity?.identityStatus ?? "none"}</p><div className="flex flex-wrap gap-1">{(["none","pending","rejected","active","revoked"] as const).map(value => <button key={value} className="min-h-touch rounded-control bg-surface-subtle px-2" onClick={() => setIdentityScenario(competitionId, value)}>{value}</button>)}</div></div>
      <div><p className="mb-2">赛事期：{runtime.lifecycle}</p><div className="flex flex-wrap gap-1">{(["notStarted","inProgress","ended"] as const).map(value => <button key={value} className="min-h-touch rounded-control bg-surface-subtle px-2" onClick={() => setLifecycle(competitionId, value)}>{value}</button>)}</div></div>
      <button className="min-h-touch rounded-control bg-surface-subtle px-2" onClick={() => setPermissionDenied(competitionId, !runtime.permissionDenied)}>permissionDenied: {String(runtime.permissionDenied)}</button>
      <button className="min-h-touch rounded-control px-2 text-text-brand" onClick={() => { setIdentityScenario(competitionId, "active"); resetCompetition(competitionId); }}>恢复 active 默认场景</button>
    </div>
  </details>;
}

export function TaskScenarioTools({ competitionId, taskId }: { competitionId: string; taskId: string }) {
  const { getRuntime, setTaskLocked, setTaskStatus } = useWorkshopRuntime();
  const runtime = getRuntime(competitionId);
  const taskRun = runtime.taskRuns[taskId];
  const set = (value: "locked" | TaskRunStatus) => {
    if (value === "locked") {
      setTaskStatus(competitionId, taskId, "ready");
      setTaskLocked(competitionId, taskId, true);
      return;
    }
    setTaskLocked(competitionId, taskId, false);
    setTaskStatus(competitionId, taskId, value);
  };
  return <details className="rounded-container border border-border-subtle bg-surface p-3 text-xs text-text-secondary">
    <summary className="cursor-pointer font-medium text-text-brand">Task Runtime 状态：{taskRun?.status ?? "ready"}</summary>
    <div className="mt-2 flex flex-wrap gap-1">{(["locked","ready","queued","running","failed","completed"] as const).map(value => <button key={value} onClick={() => set(value)} className="min-h-touch rounded-control bg-surface-subtle px-2">{value}</button>)}</div>
  </details>;
}

export function CompetitionContextLine({ competitionId }: { competitionId: string }) {
  const competition = competitionById(competitionId);
  const { identityFor } = useWorkshopRuntime();
  const identity = identityFor(competitionId);
  return <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary"><StatusTag tone="info">当前赛事</StatusTag><span>{competition?.name ?? competitionId}</span><span>·</span><span>身份 {identity?.identityStatus ?? "none"}</span></div>;
}
