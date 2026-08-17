import { useEffect, useState, type ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, PageHeader, PublicShell, SecondaryButton, Section, StatusTag } from "../../components/ui";
import { resultById, taskById } from "./data";
import { missingMaterials, taskAvailability, useWorkshopRuntime } from "./runtime";
import { CompetitionContextLine, RequireCompetitionAccess, TaskScenarioTools } from "./shared";

function taskBasePath(competitionId: string, taskId: string) {
  return `/competitions/${competitionId}/workspace/workshop/tasks/${taskId}`;
}

export function TaskAnswerPage() {
  const navigate = useNavigate();
  const { competitionId, taskId } = useParams();
  const { getRuntime, saveAnswer, setTaskStatus } = useWorkshopRuntime();
  const task = taskById(taskId);
  const runtime = competitionId ? getRuntime(competitionId) : undefined;
  const run = taskId && runtime ? runtime.taskRuns[taskId] : undefined;
  const [answer, setAnswer] = useState(run?.answer ?? "");
  useEffect(() => setAnswer(run?.answer ?? ""), [run?.answer, taskId]);
  if (!competitionId || !taskId || !task || !runtime) return null;
  const availability = taskAvailability(runtime,taskId);
  const missing = missingMaterials(runtime,taskId);
  const submit = () => { const clean = answer.trim(); if (!clean) return; saveAnswer(competitionId,taskId,clean); setTaskStatus(competitionId,taskId,"ready"); navigate(`${taskBasePath(competitionId,taskId)}/review`); };
  if (availability === "completed") return <PublicShell showNavigation={false}><PageHeader title="任务已完成" backTo={`/competitions/${competitionId}/workspace/workshop`} /><RequireCompetitionAccess><div className="space-y-4 px-4 py-6"><Card><StatusTag tone="success">已完成</StatusTag><h1 className="mt-3 font-semibold text-text-primary">{task.title}</h1><p className="mt-2 text-sm text-text-secondary">该 task 已经有对应成果，不会跳到其它技能成果。</p></Card><Button className="w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace/workshop/results/${task.resultId}`)}>查看正确成果</Button></div></RequireCompetitionAccess></PublicShell>;
  if (availability === "queued" || availability === "running" || availability === "failed") {
    return <PublicShell showNavigation={false}><PageHeader title="任务执行中" backTo={`/competitions/${competitionId}/workspace/workshop`} /><RequireCompetitionAccess><div className="space-y-4 px-4 py-6"><Card><StatusTag tone={availability === "failed" ? "danger" : "info"}>{availability}</StatusTag><h1 className="mt-3 font-semibold text-text-primary">{task.title}</h1></Card><Button className="w-full" onClick={() => navigate(`${taskBasePath(competitionId,taskId)}/progress`)}>继续查看运行状态</Button></div></RequireCompetitionAccess></PublicShell>;
  }
  return <PublicShell showNavigation={false}><PageHeader title="任务答题" subtitle={`${task.skillId.toUpperCase()} · 共享 Task Runtime`} backTo={`/competitions/${competitionId}/workspace/workshop/skills/${task.skillId}`} /><RequireCompetitionAccess><div className="space-y-6 px-4 py-5"><CompetitionContextLine competitionId={competitionId} /><Card><StatusTag tone={availability === "locked" ? "warning" : "info"}>{availability === "locked" ? "任务锁定" : "动态答题"}</StatusTag><h1 className="mt-3 text-lg font-semibold text-text-primary">{task.title}</h1><p className="mt-2 text-sm leading-5 text-text-secondary">{task.summary}</p></Card>{availability === "locked" ? <Card className="border border-warning bg-warning-bg"><p className="font-medium text-warning-text">当前缺少任务材料</p><p className="mt-2 text-sm text-warning-text">{missing.length ? missing.map(item => item.label).join("、") : "该任务当前被原型状态锁定"}</p><SecondaryButton className="mt-4 w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace/workshop/project`)}>查看项目材料</SecondaryButton></Card> : <Section title="回答"><div><label className="mb-2 block text-sm font-medium text-text-primary">{task.prompt}</label><textarea value={answer} onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setAnswer(event.target.value)} rows={7} className="w-full rounded-control border border-border bg-surface p-3 text-base leading-6 text-text-primary outline-none focus:border-primary" placeholder="写下团队当前真实情况…" /><p className="mt-2 text-sm leading-5 text-text-secondary">{task.helper}</p></div></Section>}<Button disabled={availability === "locked" || !answer.trim()} className="w-full" onClick={submit}>保存回答并检查生成内容</Button><TaskScenarioTools competitionId={competitionId} taskId={taskId} /></div></RequireCompetitionAccess></PublicShell>;
}

export function TaskReviewPage() {
  const navigate = useNavigate();
  const { competitionId, taskId } = useParams();
  const { getRuntime, startTask } = useWorkshopRuntime();
  if (!competitionId || !taskId) return null;
  const runtime = getRuntime(competitionId);
  const task = taskById(taskId);
  if (!task) return null;
  const run = runtime.taskRuns[taskId];
  const missing = missingMaterials(runtime,taskId);
  const ready = taskAvailability(runtime,taskId) !== "locked" && Boolean(run?.answer.trim());
  const confirm = () => { if (!ready) return; startTask(competitionId,taskId); navigate(`${taskBasePath(competitionId,taskId)}/progress`); };
  return <PublicShell showNavigation={false}><PageHeader title="生成确认" subtitle="确认当前 task，不跨技能" backTo={`${taskBasePath(competitionId,taskId)}/answer`} /><RequireCompetitionAccess><div className="space-y-6 px-4 py-5"><CompetitionContextLine competitionId={competitionId} /><Card><p className="text-xs font-medium text-text-brand">{task.skillId.toUpperCase()}</p><h1 className="mt-2 text-lg font-semibold text-text-primary">{task.title}</h1><p className="mt-3 text-sm leading-6 text-text-secondary">{run?.answer || "尚未填写回答"}</p></Card><Section title="生成检查"><Card><div className="space-y-3 text-sm"><div className="flex justify-between gap-3"><span className="text-text-secondary">预计算力</span><strong className="text-text-primary">{task.computeCost}</strong></div><div className="flex justify-between gap-3"><span className="text-text-secondary">任务材料</span><span className="text-right font-medium text-text-primary">{missing.length ? `缺少 ${missing.map(item => item.label).join("、")}` : "已满足"}</span></div><div className="flex justify-between gap-3"><span className="text-text-secondary">成果归属</span><span className="font-medium text-text-primary">当前赛事 / 当前 task</span></div></div></Card></Section>{!ready && <Card className="border border-warning bg-warning-bg"><p className="font-medium text-warning-text">还不能开始生成</p><p className="mt-2 text-sm text-warning-text">请返回补充回答或项目材料。</p></Card>}<div className="grid grid-cols-2 gap-2"><SecondaryButton onClick={() => navigate(`${taskBasePath(competitionId,taskId)}/answer`)}>返回修改</SecondaryButton><Button disabled={!ready} onClick={confirm}>确认并生成</Button></div><TaskScenarioTools competitionId={competitionId} taskId={taskId} /></div></RequireCompetitionAccess></PublicShell>;
}

export function TaskProgressPage() {
  const navigate = useNavigate();
  const { competitionId, taskId } = useParams();
  const { getRuntime, advanceTask, retryTask } = useWorkshopRuntime();
  if (!competitionId || !taskId) return null;
  const runtime = getRuntime(competitionId);
  const task = taskById(taskId);
  if (!task) return null;
  const status = runtime.taskRuns[taskId]?.status ?? "ready";
  const result = resultById(task.resultId);
  const tone = status === "failed" ? "danger" : status === "completed" ? "success" : "info";
  const label = status === "queued" ? "排队中" : status === "running" ? "运行中" : status === "failed" ? "生成失败" : status === "completed" ? "已完成" : "尚未开始";
  return <PublicShell showNavigation={false}><PageHeader title="任务进度" subtitle={`${task.skillId.toUpperCase()} · ${task.id}`} backTo={`/competitions/${competitionId}/workspace/workshop`} /><RequireCompetitionAccess><div className="space-y-6 px-4 py-5"><CompetitionContextLine competitionId={competitionId} /><Card className={status === "failed" ? "border border-danger bg-danger-bg" : "border border-border-subtle"}><StatusTag tone={tone}>{label}</StatusTag><h1 className="mt-3 text-lg font-semibold text-text-primary">{task.title}</h1><p className="mt-2 text-sm leading-5 text-text-secondary">{status === "queued" ? "任务已进入当前赛事队列，下一步开始执行。" : status === "running" ? "正在基于当前 task 的回答和材料生成成果。" : status === "failed" ? "本次运行失败，保留原回答，可直接重试。" : status === "completed" ? `已生成：${result?.title ?? "任务成果"}` : "请先回到答题页完成确认。"}</p></Card><div className="space-y-2">{status === "queued" && <Button className="w-full" onClick={() => advanceTask(competitionId,taskId)}>模拟进入运行</Button>}{status === "running" && <Button className="w-full" onClick={() => advanceTask(competitionId,taskId)}>模拟生成完成</Button>}{status === "failed" && <Button className="w-full" onClick={() => retryTask(competitionId,taskId)}>重新排队</Button>}{status === "completed" && <Button className="w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace/workshop/results/${task.resultId}`)}>查看本任务成果</Button>}{status === "ready" || status === "draft" ? <SecondaryButton className="w-full" onClick={() => navigate(`${taskBasePath(competitionId,taskId)}/answer`)}>返回任务答题</SecondaryButton> : null}</div><TaskScenarioTools competitionId={competitionId} taskId={taskId} /></div></RequireCompetitionAccess></PublicShell>;
}
