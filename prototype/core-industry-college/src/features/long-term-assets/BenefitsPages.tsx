import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, Card, GhostButton, PageHeader, PublicShell, SecondaryButton, StatusTag } from "../../components/ui";
import { benefitById, benefits, type BenefitStatus } from "./data";
import { SourceLine } from "./shared";
import { useLongTermAssets } from "./store";

const benefitLabel: Record<BenefitStatus, string> = {
  eligible: "可领取",
  ineligible: "无资格",
  claimed: "待使用",
  used: "已使用",
  expired: "已失效",
};

const benefitTone = (status: BenefitStatus) => status === "eligible" ? "success" : status === "claimed" ? "info" : status === "ineligible" ? "warning" : "neutral";

export function BenefitsPage() {
  const { benefitStatuses } = useLongTermAssets();
  const [filter, setFilter] = useState<"all" | "available" | "history">("all");
  const visible = useMemo(() => benefits.filter(item => {
    const status = benefitStatuses[item.id] ?? item.initialStatus;
    return filter === "all" || (filter === "available" ? ["eligible","claimed"].includes(status) : ["used","expired"].includes(status));
  }), [benefitStatuses, filter]);
  return <PublicShell><PageHeader title="权益" subtitle="统一表达平台、赛事、企业与活动来源" /><div className="space-y-5 px-4 py-5"><Card className="border border-border-subtle"><p className="text-sm leading-5 text-text-secondary">权益是成长与活动的支撑能力，不是商城。每一项都说明来源、资格原因与有效状态。</p></Card><div className="flex gap-2">{(["all","available","history"] as const).map(value => <button key={value} onClick={() => setFilter(value)} className={`min-h-10 rounded-full px-3 text-sm font-medium ${filter === value ? "bg-primary-container text-text-brand" : "bg-surface text-text-secondary"}`}>{value === "all" ? "全部" : value === "available" ? "可用" : "历史"}</button>)}</div><div className="space-y-3">{visible.map(item => { const status = benefitStatuses[item.id] ?? item.initialStatus; return <Link to={`/benefits/${item.id}`} key={item.id} className="block"><Card interactive className="space-y-3"><SourceLine source={item.source} /><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-text-primary">{item.title}</h2><p className="mt-1 text-sm leading-5 text-text-secondary">{item.summary}</p></div><StatusTag tone={benefitTone(status)}>{benefitLabel[status]}</StatusTag></div>{item.expiresAt && <p className="text-xs text-text-tertiary">有效期至 {item.expiresAt}</p>}</Card></Link>; })}</div><Link to="/benefits/wallet" className="block min-h-touch rounded-control bg-primary-container px-4 py-3 text-center text-sm font-medium text-text-brand">查看我的权益记录</Link></div></PublicShell>;
}

export function BenefitDetailPage() {
  const navigate = useNavigate();
  const { benefitId } = useParams();
  const item = benefitById(benefitId);
  const { benefitStatuses, claimBenefit, useBenefit } = useLongTermAssets();
  if (!item) return <PublicShell showNavigation={false}><PageHeader title="权益不存在" backTo="/benefits" /></PublicShell>;
  const status = benefitStatuses[item.id] ?? item.initialStatus;
  return <PublicShell showNavigation={false}><PageHeader title="权益详情" backTo="/benefits" /><div className="space-y-6 px-4 py-5"><SourceLine source={item.source} /><div><div className="flex items-start justify-between gap-3"><h1 className="text-2xl font-semibold leading-8 text-text-primary">{item.title}</h1><StatusTag tone={benefitTone(status)}>{benefitLabel[status]}</StatusTag></div><p className="mt-3 text-sm leading-6 text-text-secondary">{item.summary}</p></div><Card><h2 className="font-semibold text-text-primary">为什么你能得到它</h2><p className="mt-2 text-sm leading-6 text-text-primary">{item.reason}</p>{item.expiresAt && <p className="mt-3 text-xs text-text-secondary">有效期至 {item.expiresAt}</p>}</Card>{status === "eligible" && <Button className="w-full" onClick={() => claimBenefit(item.id)}>领取权益</Button>}{status === "claimed" && <Button className="w-full" onClick={() => useBenefit(item.id)}>模拟兑换 / 核销</Button>}{status === "used" && <Card className="border border-success bg-success-bg"><p className="font-semibold text-success-text">已完成使用 / 核销</p><p className="mt-1 text-sm text-success-text">记录会保留在账号长期权益中。</p></Card>}{status === "ineligible" && <Card className="border border-warning bg-warning-bg"><p className="font-semibold text-warning-text">当前不满足资格</p><p className="mt-1 text-sm text-warning-text">不自动创造新任务或消费路径，只展示真实资格结果。</p></Card>}{status === "expired" && <Card><p className="font-semibold text-text-primary">权益已失效</p><p className="mt-1 text-sm text-text-secondary">历史来源与领取记录仍保留，但不能再次使用。</p></Card>}<GhostButton className="w-full" onClick={() => navigate("/benefits/wallet")}>查看我的权益记录</GhostButton></div></PublicShell>;
}

export function BenefitsWalletPage() {
  const navigate = useNavigate();
  const { benefitStatuses } = useLongTermAssets();
  const grouped = benefits.map(item => ({ item, status: benefitStatuses[item.id] ?? item.initialStatus }));
  return <PublicShell showNavigation={false}><PageHeader title="我的权益" backTo="/me" /><div className="space-y-6 px-4 py-5"><div><h2 className="text-base font-semibold text-text-primary">可使用</h2><div className="mt-3 space-y-3">{grouped.filter(entry => entry.status === "claimed").length ? grouped.filter(entry => entry.status === "claimed").map(({ item, status }) => <Link key={item.id} to={`/benefits/${item.id}`} className="block"><Card interactive><div className="flex items-center justify-between gap-3"><div><h3 className="font-semibold text-text-primary">{item.title}</h3><p className="mt-1 text-xs text-text-secondary">{item.source.label}</p></div><StatusTag tone="info">{benefitLabel[status]}</StatusTag></div></Card></Link>) : <Card><p className="text-sm text-text-secondary">当前没有待使用权益。</p></Card>}</div></div><div><h2 className="text-base font-semibold text-text-primary">历史记录</h2><div className="mt-3 space-y-3">{grouped.filter(entry => ["used","expired"].includes(entry.status)).map(({ item, status }) => <Card key={item.id}><div className="flex items-center justify-between gap-3"><div><h3 className="font-medium text-text-primary">{item.title}</h3><p className="mt-1 text-xs text-text-secondary">{item.source.label}</p></div><StatusTag tone="neutral">{benefitLabel[status]}</StatusTag></div></Card>)}</div></div><SecondaryButton className="w-full" onClick={() => navigate("/benefits")}>返回权益中心</SecondaryButton></div></PublicShell>;
}
