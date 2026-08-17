import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, Card, GhostButton, PageHeader, PublicShell, SecondaryButton, StatusTag } from "../../components/ui";
import { benefitById, benefits, type BenefitStatus } from "./data";
import { SourceLine, useAccountAction, useAccountLoggedIn } from "./shared";
import { useLongTermAssets } from "./store";

const benefitLabel: Record<BenefitStatus, string> = {
  eligible: "可领取",
  ineligible: "无资格",
  claimed: "待使用",
  used: "已使用",
  expired: "已失效",
};

const benefitTone = (status: BenefitStatus) => status === "eligible" ? "success" : status === "claimed" ? "info" : status === "ineligible" ? "warning" : "neutral";

function useBenefitSourceContext() {
  const location = useLocation();
  const competitionId = new URLSearchParams(location.search).get("competition");
  const query = competitionId ? `?competition=${encodeURIComponent(competitionId)}` : "";
  return { competitionId, query, backTo: competitionId ? `/competitions/${competitionId}/workspace` : undefined };
}

export function BenefitsPage() {
  const loggedIn = useAccountLoggedIn();
  const { benefitStatusFor } = useLongTermAssets();
  const { competitionId, query, backTo } = useBenefitSourceContext();
  const [filter, setFilter] = useState<"all" | "available" | "history">("all");
  const visible = useMemo(() => benefits.filter(item => {
    if (competitionId && (item.source.type !== "competition" || item.source.competitionId !== competitionId)) return false;
    if (!loggedIn) return filter === "all";
    const status = benefitStatusFor(item.id);
    return filter === "all" || (filter === "available" ? ["eligible","claimed"].includes(status) : ["used","expired"].includes(status));
  }), [benefitStatusFor, competitionId, filter, loggedIn]);
  return <PublicShell><PageHeader title={competitionId ? "赛事权益" : "权益"} subtitle={competitionId ? "只展示当前赛事来源" : "统一表达平台、赛事、企业与活动来源"} backTo={backTo} /><div className="space-y-5 px-4 py-5"><Card className="border border-border-subtle"><p className="text-sm leading-5 text-text-secondary">权益是成长与活动的支撑能力，不是商城。每一项都说明来源与资格依据；账号状态登录后读取。</p></Card>{loggedIn && <div className="flex gap-2">{(["all","available","history"] as const).map(value => <button key={value} onClick={() => setFilter(value)} className={`min-h-touch rounded-control px-3 text-sm font-medium ${filter === value ? "bg-primary-container text-text-brand" : "bg-surface text-text-secondary"}`}>{value === "all" ? "全部" : value === "available" ? "可用" : "历史"}</button>)}</div>}<div className="space-y-3">{visible.length ? visible.map(item => { const status = loggedIn ? benefitStatusFor(item.id) : undefined; return <Link to={`/benefits/${item.id}${query}`} key={item.id} className="block"><Card interactive className="space-y-3"><SourceLine source={item.source} /><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-text-primary">{item.title}</h2><p className="mt-1 text-sm leading-5 text-text-secondary">{item.summary}</p></div>{status ? <StatusTag tone={benefitTone(status)}>{benefitLabel[status]}</StatusTag> : <StatusTag tone="neutral">登录查看资格</StatusTag>}</div>{item.expiresAt && <p className="text-xs text-text-tertiary">有效期至 {item.expiresAt}</p>}</Card></Link>; }) : <Card><p className="text-sm text-text-secondary">当前条件下没有可展示的权益。</p></Card>}</div>{loggedIn ? <Link to="/benefits/wallet" className="block min-h-touch rounded-control bg-primary-container px-4 py-3 text-center text-sm font-medium text-text-brand">查看我的权益记录</Link> : <Card><p className="text-sm text-text-secondary">登录后可查看领取、使用与历史权益记录。</p></Card>}</div></PublicShell>;
}

export function BenefitDetailPage() {
  const navigate = useNavigate();
  const loggedIn = useAccountLoggedIn();
  const accountAction = useAccountAction();
  const { benefitId } = useParams();
  const { query } = useBenefitSourceContext();
  const item = benefitById(benefitId);
  const { benefitStatusFor, claimBenefit, useBenefit } = useLongTermAssets();
  if (!item) return <PublicShell showNavigation={false}><PageHeader title="权益不存在" backTo={`/benefits${query}`} /></PublicShell>;
  const status = loggedIn ? benefitStatusFor(item.id) : undefined;
  const claim = () => accountAction(() => claimBenefit(item.id));
  const use = () => accountAction(() => useBenefit(item.id));
  return <PublicShell showNavigation={false}><PageHeader title="权益详情" backTo={`/benefits${query}`} /><div className="space-y-6 px-4 py-5"><SourceLine source={item.source} /><div><div className="flex items-start justify-between gap-3"><h1 className="text-2xl font-semibold leading-8 text-text-primary">{item.title}</h1>{status ? <StatusTag tone={benefitTone(status)}>{benefitLabel[status]}</StatusTag> : <StatusTag tone="neutral">登录查看资格</StatusTag>}</div><p className="mt-3 text-sm leading-6 text-text-secondary">{item.summary}</p></div><Card><h2 className="font-semibold text-text-primary">资格与来源</h2><p className="mt-2 text-sm leading-6 text-text-primary">{loggedIn ? item.reason : "登录后由长期账号状态与共享赛事身份判断当前资格。"}</p>{item.expiresAt && <p className="mt-3 text-xs text-text-secondary">有效期至 {item.expiresAt}</p>}</Card>{!loggedIn && <Button className="w-full" onClick={() => accountAction(() => undefined)}>登录后查看并领取</Button>}{status === "eligible" && <Button className="w-full" onClick={claim}>领取权益</Button>}{status === "claimed" && <Button className="w-full" onClick={use}>模拟兑换 / 核销</Button>}{status === "used" && <Card className="border border-success bg-success-bg"><p className="font-semibold text-success-text">已完成使用 / 核销</p><p className="mt-1 text-sm text-success-text">记录会保留在账号长期权益中。</p></Card>}{status === "ineligible" && <Card className="border border-warning bg-warning-bg"><p className="font-semibold text-warning-text">当前不满足资格</p><p className="mt-1 text-sm text-warning-text">赛事身份相关资格直接读取共享 identities[]；无有效身份时不能新领取。</p></Card>}{status === "expired" && <Card><p className="font-semibold text-text-primary">权益已失效</p><p className="mt-1 text-sm text-text-secondary">历史来源与领取记录仍保留，但不能再次使用。</p></Card>}{loggedIn && <GhostButton className="w-full" onClick={() => navigate("/benefits/wallet")}>查看我的权益记录</GhostButton>}</div></PublicShell>;
}

export function BenefitsWalletPage() {
  const navigate = useNavigate();
  const { benefitStatusFor } = useLongTermAssets();
  const grouped = benefits.map(item => ({ item, status: benefitStatusFor(item.id) }));
  return <PublicShell showNavigation={false}><PageHeader title="我的权益" backTo="/me" /><div className="space-y-6 px-4 py-5"><div><h2 className="text-base font-semibold text-text-primary">可使用</h2><div className="mt-3 space-y-3">{grouped.filter(entry => entry.status === "claimed").length ? grouped.filter(entry => entry.status === "claimed").map(({ item, status }) => <Link key={item.id} to={`/benefits/${item.id}`} className="block"><Card interactive><div className="flex items-center justify-between gap-3"><div><h3 className="font-semibold text-text-primary">{item.title}</h3><p className="mt-1 text-xs text-text-secondary">{item.source.label}</p></div><StatusTag tone="info">{benefitLabel[status]}</StatusTag></div></Card></Link>) : <Card><p className="text-sm text-text-secondary">当前没有待使用权益。</p></Card>}</div></div><div><h2 className="text-base font-semibold text-text-primary">历史记录</h2><div className="mt-3 space-y-3">{grouped.filter(entry => ["used","expired"].includes(entry.status)).map(({ item, status }) => <Card key={item.id}><div className="flex items-center justify-between gap-3"><div><h3 className="font-medium text-text-primary">{item.title}</h3><p className="mt-1 text-xs text-text-secondary">{item.source.label}</p></div><StatusTag tone="neutral">{benefitLabel[status]}</StatusTag></div></Card>)}</div></div><SecondaryButton className="w-full" onClick={() => navigate("/benefits")}>返回权益中心</SecondaryButton></div></PublicShell>;
}
