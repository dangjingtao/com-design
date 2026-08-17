import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, Card, PageHeader, PublicShell, SecondaryButton, Section, StatusTag } from "../../components/ui";
import { materialLabels, resultById, skillById, taskById, workshopSkills, workshopTasks, workspaceData, type MaterialKey } from "./data";
import { completedResults, missingMaterials, nextReadyTask, taskAvailability, useWorkshopRuntime } from "./runtime";
import { CompetitionContextLine, RequireCompetitionAccess, TaskScenarioTools } from "./shared";

function taskStatusLabel(status: ReturnType<typeof taskAvailability>) {
  if (status === "locked") return ["待补材料", "warning"] as const;
  if (status === "queued") return ["排队中", "info"] as const;
  if (status === "running") return ["运行中", "info"] as const;
  if (status === "failed") return ["生成失败", "danger"] as const;
  if (status === "completed") return ["已完成", "success"] as const;
  return ["可开始", "neutral"] as const;
}

function taskDestination(competitionId: string, taskId: string, status: ReturnType<typeof taskAvailability>) {
  if (status === "queued" || status === "running" || status === "failed") return `/competitions/${competitionId}/workspace/workshop/tasks/${taskId}/progress`;
  if (status === "completed") {
    const task = taskById(taskId);
    return task ? `/competitions/${competitionId}/workspace/workshop/results/${task.resultId}` : `/competitions/${competitionId}/workspace/workshop/results`;
  }
  return `/competitions/${competitionId}/workspace/workshop/tasks/${taskId}/answer`;
}

function nextTaskAfter(runtime: ReturnType<ReturnType<typeof useWorkshopRuntime>["getRuntime"]>, taskId: string) {
  const index = workshopTasks.findIndex(task => task.id === taskId);
  const candidates = index >= 0 ? workshopTasks.slice(index + 1) : workshopTasks;
  return candidates.find(task => taskAvailability(runtime, task.id) === "ready") ?? nextReadyTask(runtime);
}

export function WorkshopHomePage() {
  const navigate = useNavigate();
  const { competitionId } = useParams();
  const { getRuntime } = useWorkshopRuntime();
  if (!competitionId) return null;
  const data = workspaceData[competitionId];
  const runtime = getRuntime(competitionId);
  const activeRunTask = workshopTasks.find(task => ["queued", "running", "failed"].includes(runtime.taskRuns[task.id]?.status ?? ""));
  const nextTask = activeRunTask ?? nextReadyTask(runtime);
  const nextStatus = nextTask ? taskAvailability(runtime, nextTask.id) : undefined;
  const allMissing = workshopTasks.flatMap(task => missingMaterials(runtime, task.id)).filter((item, index, list) => list.findIndex(other => other.key === item.key) === index);
  const results = completedResults(runtime);
  const lastResult = results.length ? results[results.length - 1] : undefined;

  return <PublicShell showNavigation={false}><PageHeader title="创赛工坊" subtitle="三创赛赛事陪跑" backTo={`/competitions/${competitionId}/workspace`} /><RequireCompetitionAccess><div className="space-y-7 px-4 py-5">
    <CompetitionContextLine competitionId={competitionId} />
    <Section title="我现在最该做什么？"><Card className="border border-border-subtle"><StatusTag tone={activeRunTask ? "info" : nextTask ? "warning" : "success"}>{activeRunTask ? "继续执行" : nextTask ? "下一任务" : "本轮已完成"}</StatusTag><h1 className="mt-3 text-xl font-semibold leading-7 text-text-primary">{nextTask?.title ?? "查看本轮成果，并准备赛后沉淀"}</h1><p className="mt-2 text-sm leading-5 text-text-secondary">{nextTask?.summary ?? "当前没有新的可执行任务。赛事成果会在比赛结束后 handoff 到长期资产。"}</p>{nextTask && nextStatus && <Button className="mt-4 w-full" onClick={() => navigate(taskDestination(competitionId, nextTask.id, nextStatus))}>{activeRunTask ? "继续当前任务" : "开始下一任务"}</Button>}</Card></Section>
    {data && <Section title="当前项目 / 阶段"><Card><h2 className="font-semibold text-text-primary">{data.project.name}</h2><p className="mt-1 text-sm text-text-brand">{data.project.currentStage}</p><p className="mt-3 text-sm leading-5 text-text-secondary">{data.project.summary}</p><SecondaryButton className="mt-4 w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace/workshop/project`)}>查看项目与材料</SecondaryButton></Card></Section>}
    <Section title="还缺什么材料"><Card>{allMissing.length ? <div className="space-y-2">{allMissing.map(item => <div key={item.key} className="flex items-center justify-between gap-3"><span className="text-sm text-text-primary">{item.label}</span><StatusTag tone="warning">未补齐</StatusTag></div>)}<SecondaryButton className="mt-3 w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace/workshop/project`)}>去补材料</SecondaryButton></div> : <div><StatusTag tone="success">材料齐备</StatusTag><p className="mt-2 text-sm text-text-secondary">当前任务没有材料阻塞。</p></div>}</Card></Section>
    <Section title="上一次结果"><Card>{lastResult ? <><StatusTag tone="success">已生成</StatusTag><h2 className="mt-3 font-semibold text-text-primary">{lastResult.title}</h2><p className="mt-2 text-sm leading-5 text-text-secondary">{lastResult.summary}</p><SecondaryButton className="mt-4 w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace/workshop/results/${lastResult.id}`)}>查看结果</SecondaryButton></> : <p className="text-sm text-text-secondary">还没有生成成果。</p>}</Card></Section>
    <Section title="工坊支撑"><div className="space-y-2">{[["技能矩阵",`/competitions/${competitionId}/workspace/workshop/skills`],["算力明细",`/competitions/${competitionId}/workspace/workshop/compute`],["历史成果",`/competitions/${competitionId}/workspace/workshop/results`]].map(([label,to]) => <button key={to} className="flex min-h-touch w-full items-center justify-between rounded-control bg-surface px-3 text-left text-sm font-medium text-text-primary active:bg-surface-pressed" onClick={() => navigate(to)}>{label}<span className="text-text-tertiary">›</span></button>)}</div></Section>
  </div></RequireCompetitionAccess></PublicShell>;
}

export function WorkshopProjectPage() {
  const { competitionId } = useParams();
  const { getRuntime, setMaterial } = useWorkshopRuntime();
  if (!competitionId) return null;
  const runtime = getRuntime(competitionId);
  const data = workspaceData[competitionId];
  const materialKeys = Object.keys(materialLabels) as MaterialKey[];
  return <PublicShell showNavigation={false}><PageHeader title="当前项目" subtitle="项目与任务材料" backTo={`/competitions/${competitionId}/workspace/workshop`} /><RequireCompetitionAccess><div className="space-y-6 px-4 py-5"><CompetitionContextLine competitionId={competitionId} />{data && <Card><h1 className="text-lg font-semibold text-text-primary">{data.project.name}</h1><p className="mt-1 text-sm text-text-brand">{data.project.track} · {data.project.currentStage}</p><p className="mt-3 text-sm leading-6 text-text-secondary">{data.project.summary}</p><p className="mt-3 text-xs text-text-tertiary">指导老师：{data.project.mentor}</p></Card>}<Section title="任务材料"><div className="space-y-2">{materialKeys.map(key => <Card key={key}><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-medium text-text-primary">{materialLabels[key]}</p><p className="mt-1 text-xs text-text-secondary">{runtime.materials[key] ? "已进入当前赛事项目材料" : "缺失时，对应 Task Runtime 会锁定"}</p></div><StatusTag tone={runtime.materials[key] ? "success" : "warning"}>{runtime.materials[key] ? "已具备" : "缺失"}</StatusTag></div><SecondaryButton className="mt-3 w-full" onClick={() => setMaterial(competitionId, key, !runtime.materials[key])}>{runtime.materials[key] ? "模拟移除材料" : "模拟补齐材料"}</SecondaryButton></Card>)}</div></Section></div></RequireCompetitionAccess></PublicShell>;
}

export function WorkshopComputePage() {
  const { competitionId } = useParams();
  const { getRuntime } = useWorkshopRuntime();
  if (!competitionId) return null;
  const runtime = getRuntime(competitionId);
  const completed = workshopTasks.filter(task => runtime.taskRuns[task.id]?.status === "completed");
  const used = completed.reduce((sum, task) => sum + task.computeCost, 0);
  const total = 120;
  return <PublicShell showNavigation={false}><PageHeader title="算力明细" backTo={`/competitions/${competitionId}/workspace/workshop`} /><RequireCompetitionAccess><div className="space-y-6 px-4 py-5"><CompetitionContextLine competitionId={competitionId} /><Card><p className="text-sm text-text-secondary">本赛事项目可用算力</p><p className="mt-2 text-2xl font-semibold text-text-primary">{Math.max(0, total-used)}</p><p className="mt-1 text-xs text-text-tertiary">总额 {total} · 已使用 {used}</p></Card><Section title="任务消耗"><div className="space-y-2">{workshopTasks.map(task => <Card key={task.id}><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-medium text-text-primary">{task.title}</p><p className="mt-1 text-xs text-text-secondary">{task.id}</p></div><span className="text-sm font-semibold text-text-primary">{runtime.taskRuns[task.id]?.status === "completed" ? `-${task.computeCost}` : `${task.computeCost} 预估`}</span></div></Card>)}</div></Section></div></RequireCompetitionAccess></PublicShell>;
}

export function WorkshopSkillsPage() {
  const { competitionId } = useParams();
  const { getRuntime } = useWorkshopRuntime();
  if (!competitionId) return null;
  const runtime = getRuntime(competitionId);
  return <PublicShell showNavigation={false}><PageHeader title="技能矩阵" subtitle="S1–S6 共用 Task Runtime" backTo={`/competitions/${competitionId}/workspace/workshop`} /><RequireCompetitionAccess><div className="space-y-4 px-4 py-5"><CompetitionContextLine competitionId={competitionId} />{workshopSkills.map(skill => { const taskStates = skill.taskIds.map(id => taskAvailability(runtime,id)); const done = taskStates.every(state => state === "completed"); return <Link key={skill.id} className="block" to={`/competitions/${competitionId}/workspace/workshop/skills/${skill.id}`}><Card interactive><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-medium text-text-brand">{skill.code}</p><h2 className="mt-1 font-semibold text-text-primary">{skill.name}</h2><p className="mt-2 text-sm leading-5 text-text-secondary">{skill.summary}</p></div><StatusTag tone={done ? "success" : "neutral"}>{done ? "已完成" : `${skill.taskIds.length} 个任务`}</StatusTag></div><div className="mt-3 flex flex-wrap gap-2">{skill.capabilities.map(capability => <StatusTag key={capability} tone="neutral">{capability}</StatusTag>)}</div></Card></Link>; })}</div></RequireCompetitionAccess></PublicShell>;
}

export function WorkshopSkillPage() {
  const navigate = useNavigate();
  const { competitionId, skillId } = useParams();
  const { getRuntime } = useWorkshopRuntime();
  if (!competitionId) return null;
  const runtime = getRuntime(competitionId);
  const skill = skillById(skillId);
  if (!skill) return <PublicShell showNavigation={false}><PageHeader title="技能不存在" backTo={`/competitions/${competitionId}/workspace/workshop/skills`} /></PublicShell>;
  return <PublicShell showNavigation={false}><PageHeader title={`${skill.code} ${skill.name}`} backTo={`/competitions/${competitionId}/workspace/workshop/skills`} /><RequireCompetitionAccess><div className="space-y-6 px-4 py-5"><CompetitionContextLine competitionId={competitionId} /><Card><h1 className="text-lg font-semibold text-text-primary">{skill.name}</h1><p className="mt-2 text-sm leading-5 text-text-secondary">{skill.summary}</p><div className="mt-3 flex flex-wrap gap-2">{skill.capabilities.map(item => <StatusTag key={item} tone="neutral">{item}</StatusTag>)}</div></Card><Section title="任务"><div className="space-y-3">{skill.taskIds.map(taskId => { const task = taskById(taskId); if (!task) return null; const status = taskAvailability(runtime,taskId); const [label,tone] = taskStatusLabel(status); const missing = missingMaterials(runtime,taskId); return <Card key={taskId}><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-text-primary">{task.title}</h2><p className="mt-2 text-sm leading-5 text-text-secondary">{task.summary}</p></div><StatusTag tone={tone}>{label}</StatusTag></div>{missing.length > 0 && <p className="mt-3 text-xs text-warning-text">缺少：{missing.map(item => item.label).join("、")}</p>}<Button disabled={status === "locked"} className="mt-4 w-full" onClick={() => navigate(taskDestination(competitionId,task.id,status))}>{status === "completed" ? "查看成果" : status === "queued" || status === "running" || status === "failed" ? "继续任务" : "开始任务"}</Button></Card>; })}</div></Section></div></RequireCompetitionAccess></PublicShell>;
}

export function WorkshopResultsPage() {
  const { competitionId } = useParams();
  const { getRuntime } = useWorkshopRuntime();
  if (!competitionId) return null;
  const runtime = getRuntime(competitionId);
  const results = completedResults(runtime);
  return <PublicShell showNavigation={false}><PageHeader title="工坊成果" backTo={`/competitions/${competitionId}/workspace/workshop`} /><RequireCompetitionAccess><div className="space-y-4 px-4 py-5"><CompetitionContextLine competitionId={competitionId} />{results.length ? results.map(result => <Link className="block" key={result.id} to={`/competitions/${competitionId}/workspace/workshop/results/${result.id}`}><Card interactive><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-text-primary">{result.title}</h2><p className="mt-2 text-sm leading-5 text-text-secondary">{result.summary}</p></div><StatusTag tone={runtime.acceptedResultIds.includes(result.id) ? "success" : "neutral"}>{runtime.acceptedResultIds.includes(result.id) ? "已采纳" : "已生成"}</StatusTag></div></Card></Link>) : <Card className="py-8 text-center"><p className="font-semibold text-text-primary">还没有成果</p><p className="mt-2 text-sm text-text-secondary">从下一任务开始执行，完成后成果会出现在这里。</p></Card>}</div></RequireCompetitionAccess></PublicShell>;
}

export function WorkshopResultDetailPage() {
  const navigate = useNavigate();
  const { competitionId, resultId } = useParams();
  const { getRuntime, acceptResult } = useWorkshopRuntime();
  if (!competitionId) return null;
  const runtime = getRuntime(competitionId);
  const result = resultById(resultId);
  const task = result ? taskById(result.taskId) : undefined;
  const completed = task ? runtime.taskRuns[task.id]?.status === "completed" : false;
  if (!result || !task || !completed) return <PublicShell showNavigation={false}><PageHeader title="成果详情" backTo={`/competitions/${competitionId}/workspace/workshop/results`} /><RequireCompetitionAccess><div className="px-4 py-6"><Card className="border border-warning bg-warning-bg"><p className="font-medium text-warning-text">该成果尚未生成</p><p className="mt-2 text-sm text-warning-text">成果严格绑定当前 task，不复用其它技能的错误结果。</p></Card></div></RequireCompetitionAccess></PublicShell>;
  const accepted = runtime.acceptedResultIds.includes(result.id);
  const nextTask = nextTaskAfter(runtime, task.id);
  return <PublicShell showNavigation={false}><PageHeader title="成果详情" backTo={`/competitions/${competitionId}/workspace/workshop/results`} /><RequireCompetitionAccess><div className="space-y-6 px-4 py-5"><CompetitionContextLine competitionId={competitionId} /><Card><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-medium text-text-brand">{task.skillId.toUpperCase()} · {task.title}</p><h1 className="mt-2 text-xl font-semibold leading-7 text-text-primary">{result.title}</h1></div><StatusTag tone={accepted ? "success" : "info"}>{accepted ? "已采纳" : "已生成"}</StatusTag></div><p className="mt-4 text-sm leading-6 text-text-secondary">{result.summary}</p></Card><Section title="关键结论"><div className="space-y-2">{result.highlights.map(item => <Card key={item}><p className="text-sm leading-5 text-text-primary">{item}</p></Card>)}</div></Section><Card className="border border-info bg-info-bg"><p className="font-medium text-info-text">下一步建议</p><p className="mt-2 text-sm leading-5 text-info-text">{result.nextSuggestion}</p></Card><div className="space-y-2">{!accepted && <SecondaryButton className="w-full" onClick={() => acceptResult(competitionId,result.id)}>采纳到当前赛事成果</SecondaryButton>}{nextTask ? <Button className="w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace/workshop/tasks/${nextTask.id}/answer`)}>继续下一步：{nextTask.title}</Button> : <Button className="w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace/workshop`)}>返回工坊</Button>}</div><TaskScenarioTools competitionId={competitionId} taskId={task.id} /></div></RequireCompetitionAccess></PublicShell>;
}
