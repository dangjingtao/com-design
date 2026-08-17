import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { CompetitionIdentityState, TaskRunStatus } from "../../state/model";
import { competitionById } from "../public-platform/data";
import { scenarios } from "../../mock/scenarios";
import { materialLabels, resultById, taskById, workshopTasks, type MaterialKey, type WorkshopLifecycle } from "./data";

export type CompetitionWorkshopRuntime = {
  lifecycle: WorkshopLifecycle;
  permissionDenied: boolean;
  materials: Record<MaterialKey, boolean>;
  taskRuns: Record<string, { status: TaskRunStatus; answer: string }>;
  forcedLockedTaskIds: string[];
  acceptedResultIds: string[];
};

type RuntimeStore = Record<string, CompetitionWorkshopRuntime>;
type IdentityScenario = "none" | "pending" | "rejected" | "active" | "revoked";

type WorkshopRuntimeContextValue = {
  identities: CompetitionIdentityState[];
  identityFor: (competitionId: string) => CompetitionIdentityState | undefined;
  setIdentityScenario: (competitionId: string, scenario: IdentityScenario) => void;
  getRuntime: (competitionId: string) => CompetitionWorkshopRuntime;
  setLifecycle: (competitionId: string, lifecycle: WorkshopLifecycle) => void;
  setPermissionDenied: (competitionId: string, denied: boolean) => void;
  setMaterial: (competitionId: string, material: MaterialKey, available: boolean) => void;
  saveAnswer: (competitionId: string, taskId: string, answer: string) => void;
  setTaskStatus: (competitionId: string, taskId: string, status: TaskRunStatus) => void;
  setTaskLocked: (competitionId: string, taskId: string, locked: boolean) => void;
  startTask: (competitionId: string, taskId: string) => void;
  advanceTask: (competitionId: string, taskId: string) => void;
  retryTask: (competitionId: string, taskId: string) => void;
  acceptResult: (competitionId: string, resultId: string) => void;
  resetCompetition: (competitionId: string) => void;
};

function makeTaskRuns() {
  return Object.fromEntries(workshopTasks.map(task => [task.id, { status: "ready" as TaskRunStatus, answer: "" }]));
}

function makeActiveRuntime(): CompetitionWorkshopRuntime {
  const taskRuns = makeTaskRuns();
  taskRuns["s1-product-score"] = {
    status: "completed",
    answer: "主推岭南植物精粹护肤组合，目标用户是 18–24 岁校园女性；希望验证成分叙事能否转成真实购买理由。",
  };
  return {
    lifecycle: "inProgress",
    permissionDenied: false,
    materials: {
      projectBrief: true,
      competitorScreens: true,
      operationData: false,
      brandAssets: false,
      pitchDraft: false,
    },
    taskRuns,
    forcedLockedTaskIds: [],
    acceptedResultIds: ["result-s1-product-score"],
  };
}

function makeEndedRuntime(): CompetitionWorkshopRuntime {
  const taskRuns = makeTaskRuns();
  for (const task of workshopTasks) taskRuns[task.id] = { status: "completed", answer: "历史赛事任务记录" };
  return {
    lifecycle: "ended",
    permissionDenied: false,
    materials: {
      projectBrief: true,
      competitorScreens: true,
      operationData: true,
      brandAssets: true,
      pitchDraft: true,
    },
    taskRuns,
    forcedLockedTaskIds: [],
    acceptedResultIds: workshopTasks.map(task => task.resultId),
  };
}

function initialRuntime(competitionId: string) {
  return competitionId === "sanchuang-15" ? makeEndedRuntime() : makeActiveRuntime();
}

function updateRuntime(store: RuntimeStore, competitionId: string, updater: (runtime: CompetitionWorkshopRuntime) => CompetitionWorkshopRuntime) {
  const current = store[competitionId] ?? initialRuntime(competitionId);
  return { ...store, [competitionId]: updater(current) };
}

const WorkshopRuntimeContext = createContext<WorkshopRuntimeContextValue | null>(null);

export function WorkshopRuntimeProvider({ children }: { children: ReactNode }) {
  const [identities, setIdentities] = useState<CompetitionIdentityState[]>(() => scenarios.multiCompetitionAccount.competitions.identities.map(identity => ({ ...identity })));
  const [store, setStore] = useState<RuntimeStore>(() => ({
    "sanchuang-16": makeActiveRuntime(),
    "sanchuang-15": makeEndedRuntime(),
  }));

  const value = useMemo<WorkshopRuntimeContextValue>(() => ({
    identities,
    identityFor: competitionId => identities.find(identity => identity.competitionId === competitionId),
    setIdentityScenario: (competitionId, scenario) => setIdentities(current => {
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
    }),
    getRuntime: competitionId => store[competitionId] ?? initialRuntime(competitionId),
    setLifecycle: (competitionId, lifecycle) => setStore(current => updateRuntime(current, competitionId, runtime => ({ ...runtime, lifecycle }))),
    setPermissionDenied: (competitionId, permissionDenied) => setStore(current => updateRuntime(current, competitionId, runtime => ({ ...runtime, permissionDenied }))),
    setMaterial: (competitionId, material, available) => setStore(current => updateRuntime(current, competitionId, runtime => ({ ...runtime, materials: { ...runtime.materials, [material]: available } }))),
    saveAnswer: (competitionId, taskId, answer) => setStore(current => updateRuntime(current, competitionId, runtime => ({
      ...runtime,
      taskRuns: { ...runtime.taskRuns, [taskId]: { ...(runtime.taskRuns[taskId] ?? { status: "ready" as TaskRunStatus }), answer } },
    }))),
    setTaskStatus: (competitionId, taskId, status) => setStore(current => updateRuntime(current, competitionId, runtime => ({
      ...runtime,
      taskRuns: { ...runtime.taskRuns, [taskId]: { ...(runtime.taskRuns[taskId] ?? { answer: "" }), status } },
    }))),
    setTaskLocked: (competitionId, taskId, locked) => setStore(current => updateRuntime(current, competitionId, runtime => ({
      ...runtime,
      forcedLockedTaskIds: locked
        ? Array.from(new Set([...runtime.forcedLockedTaskIds, taskId]))
        : runtime.forcedLockedTaskIds.filter(id => id !== taskId),
    }))),
    startTask: (competitionId, taskId) => setStore(current => updateRuntime(current, competitionId, runtime => ({
      ...runtime,
      forcedLockedTaskIds: runtime.forcedLockedTaskIds.filter(id => id !== taskId),
      taskRuns: { ...runtime.taskRuns, [taskId]: { ...(runtime.taskRuns[taskId] ?? { answer: "" }), status: "queued" } },
    }))),
    advanceTask: (competitionId, taskId) => setStore(current => updateRuntime(current, competitionId, runtime => {
      const taskRun = runtime.taskRuns[taskId] ?? { status: "ready" as TaskRunStatus, answer: "" };
      const next: TaskRunStatus = taskRun.status === "queued" ? "running" : taskRun.status === "running" ? "completed" : taskRun.status;
      return { ...runtime, taskRuns: { ...runtime.taskRuns, [taskId]: { ...taskRun, status: next } } };
    })),
    retryTask: (competitionId, taskId) => setStore(current => updateRuntime(current, competitionId, runtime => ({
      ...runtime,
      taskRuns: { ...runtime.taskRuns, [taskId]: { ...(runtime.taskRuns[taskId] ?? { answer: "" }), status: "queued" } },
    }))),
    acceptResult: (competitionId, resultId) => setStore(current => updateRuntime(current, competitionId, runtime => ({
      ...runtime,
      acceptedResultIds: runtime.acceptedResultIds.includes(resultId) ? runtime.acceptedResultIds : [...runtime.acceptedResultIds, resultId],
    }))),
    resetCompetition: competitionId => setStore(current => ({ ...current, [competitionId]: initialRuntime(competitionId) })),
  }), [identities, store]);

  return <WorkshopRuntimeContext.Provider value={value}>{children}</WorkshopRuntimeContext.Provider>;
}

export function useWorkshopRuntime() {
  const value = useContext(WorkshopRuntimeContext);
  if (!value) throw new Error("WorkshopRuntimeProvider missing");
  return value;
}

export function taskAvailability(runtime: CompetitionWorkshopRuntime, taskId: string) {
  const task = taskById(taskId);
  if (!task) return "locked" as const;
  if (runtime.forcedLockedTaskIds.includes(taskId)) return "locked" as const;
  const missing = task.requiredMaterials.filter(material => !runtime.materials[material]);
  if (missing.length > 0) return "locked" as const;
  return runtime.taskRuns[taskId]?.status ?? "ready";
}

export function missingMaterials(runtime: CompetitionWorkshopRuntime, taskId: string) {
  const task = taskById(taskId);
  if (!task) return [];
  return task.requiredMaterials.filter(material => !runtime.materials[material]).map(material => ({ key: material, label: materialLabels[material] }));
}

export function completedResults(runtime: CompetitionWorkshopRuntime) {
  return workshopTasks
    .filter(task => runtime.taskRuns[task.id]?.status === "completed")
    .map(task => resultById(task.resultId))
    .filter((result): result is NonNullable<typeof result> => Boolean(result));
}

export function nextReadyTask(runtime: CompetitionWorkshopRuntime) {
  return workshopTasks.find(task => taskAvailability(runtime, task.id) === "ready");
}
