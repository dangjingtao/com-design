import type { ReactNode } from "react";
import { Card, StatusTag } from "../../components/ui";
import type { BenefitSource, CourseSource } from "./data";

export function SourceLine({ source }: { source: CourseSource | BenefitSource }) {
  const tone = source.type === "competition" ? "info" : source.type === "company" ? "warning" : source.type === "activity" ? "neutral" : "success";
  const label = source.type === "competition" ? "赛事来源" : source.type === "company" ? "企业来源" : source.type === "activity" ? "活动来源" : "平台来源";
  return <div className="flex flex-wrap items-center gap-2"><StatusTag tone={tone}>{label}</StatusTag><span className="text-xs text-text-secondary">{source.label}</span></div>;
}

export function ProgressBar({ value }: { value: number }) {
  return <div className="h-2 overflow-hidden rounded-full bg-surface-subtle"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>;
}

export function FactCard({ title, meta, children, action }: { title: string; meta?: ReactNode; children?: ReactNode; action?: ReactNode }) {
  return <Card interactive className="space-y-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="text-base font-semibold leading-6 text-text-primary">{title}</h3>{meta && <div className="mt-1 text-xs text-text-secondary">{meta}</div>}</div>{action}</div>{children}</Card>;
}

export function TrustNote() {
  return <Card className="border border-info bg-info-bg"><p className="text-sm font-semibold text-info-text">可信事实与简历表达分开保存</p><p className="mt-1 text-xs leading-5 text-info-text">赛事、成绩、证书和课程记录来自系统事实；简历只选择这些事实并编辑展示文案，不会反向改写原始记录。</p></Card>;
}
