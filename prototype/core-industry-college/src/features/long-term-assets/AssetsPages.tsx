import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, Card, GhostButton, PageHeader, PublicShell, SecondaryButton, Section, StatusTag } from "../../components/ui";
import { workspaceData, resultById } from "../competition-workspace/data";
import { completedResults, useWorkshopRuntime } from "../competition-workspace/runtime";
import { usePublicPlatform } from "../public-platform/PublicPlatform";
import { companyById, competitionById, opportunityById } from "../public-platform/data";
import { courses } from "./data";
import { FactCard, ProgressBar, TrustNote } from "./shared";
import { useLongTermAssets } from "./store";

function useExperienceFacts() {
  const { session, identities } = usePublicPlatform();
  const runtime = useWorkshopRuntime();
  if (!session.loggedIn) return [];
  return identities.map(identity => {
    const competition = competitionById(identity.competitionId);
    const workspace = workspaceData[identity.competitionId];
    const lifecycle = runtime.getRuntime(identity.competitionId).lifecycle;
    return { identity, competition, workspace, lifecycle };
  }).filter(item => item.competition && item.workspace);
}

function lifecycleLabel(lifecycle: "notStarted" | "inProgress" | "ended", identityStatus: string) {
  if (identityStatus === "revoked") return "赛事权限已回收";
  return lifecycle === "ended" ? "赛事已结束" : lifecycle === "inProgress" ? "赛事进行中" : "赛事未开始";
}

export function MyPage() {
  const navigate = useNavigate();
  const { applications, followedCompanies, session } = usePublicPlatform();
  const { learning, certificates, resume, profile } = useLongTermAssets();
  const experiences = useExperienceFacts();
  const completedLearning = learning.filter(item => item.status === "completed");
  if (!session.loggedIn) return <PublicShell><PageHeader title="我的" /><div className="space-y-4 px-4 py-6"><Card><h2 className="font-semibold text-text-primary">登录后查看长期账号资产</h2><p className="mt-2 text-sm text-text-secondary">赛事经历、课程成果、证书、投递和简历都归长期账号保存。</p></Card><Button className="w-full" onClick={() => navigate("/auth/login?returnTo=/me")}>登录</Button></div></PublicShell>;
  return <PublicShell><PageHeader title="我的" subtitle="长期账号资产，不随单场赛事结束" /><div className="space-y-7 px-4 py-5"><Card className="space-y-3"><div><p className="text-xs text-text-secondary">{profile.school} · {profile.major}</p><h1 className="mt-1 text-xl font-semibold text-text-primary">{profile.name}</h1><p className="mt-2 text-sm text-text-secondary">{profile.city} · {profile.email}</p></div><GhostButton className="w-full" onClick={() => navigate("/me/profile")}>编辑基础资料</GhostButton></Card>
    <Section title="这个账号已经沉淀了什么"><div className="space-y-3"><Link to="/assets/experiences" className="block"><FactCard title={`${experiences.length} 段赛事 / 项目经历`} meta="包含进行中与历史赛事，赛后仍可读"><p className="text-sm text-text-secondary">角色、项目摘要、结果与长期课程成果继续留在账号中。</p></FactCard></Link><Link to="/assets/learning" className="block"><FactCard title={`${completedLearning.length} 项已完成学习成果`} meta={`${learning.filter(item => item.status === "inProgress").length} 门课程学习中`}><p className="text-sm text-text-secondary">课程进度、考试结果和证书与来源赛事解耦长期保存。</p></FactCard></Link><Link to="/assets/certificates" className="block"><FactCard title={`${certificates.filter(item => item.status !== "revoked").length} 张证书记录`} meta="系统事实，可验真"><p className="text-sm text-text-secondary">证书事实不可由简历编辑器改写。</p></FactCard></Link></div></Section>
    <Section title="继续使用"><div className="space-y-3"><Card><div className="flex items-center justify-between gap-3"><div><h2 className="font-semibold text-text-primary">长期简历</h2><p className="mt-1 text-sm text-text-secondary">已选择 {resume.selectedFactKeys.length} 项可信事实用于履历表达。</p></div><SecondaryButton onClick={() => navigate("/me/resume")}>整理</SecondaryButton></div></Card><Card><div className="flex items-center justify-between gap-3"><div><h2 className="font-semibold text-text-primary">投递记录</h2><p className="mt-1 text-sm text-text-secondary">{applications.length ? `${applications.length} 份共享投递状态` : "还没有投递记录"}</p></div><GhostButton onClick={() => navigate("/applications")}>查看</GhostButton></div></Card></div></Section>
    <Section title="长期关系"><Card className="space-y-3"><div><p className="text-sm font-medium text-text-primary">关注企业 {followedCompanies.length}</p><div className="mt-2 flex flex-wrap gap-2">{followedCompanies.map(id => <Link key={id} to={`/companies/${id}`}><StatusTag tone="neutral">{companyById(id)?.name ?? id}</StatusTag></Link>)}</div></div><div className="border-t border-border-subtle pt-3"><Link className="text-sm font-medium text-text-brand" to="/benefits/wallet">查看我的权益记录 →</Link></div></Card></Section>
  </div></PublicShell>;
}

export function AssetsHomePage() {
  const navigate = useNavigate();
  const experiences = useExperienceFacts();
  const { learning, certificates, competitionResults } = useLongTermAssets();
  return <PublicShell><PageHeader title="长期资产" subtitle="比赛会结束，账号和学生资产不会结束" /><div className="space-y-6 px-4 py-5"><TrustNote /><Section title="资产概览"><div className="grid grid-cols-2 gap-3"><Link to="/assets/experiences"><Card interactive><strong className="text-2xl text-text-primary">{experiences.length}</strong><p className="mt-1 text-sm text-text-secondary">赛事 / 项目经历</p></Card></Link><Link to="/assets/results"><Card interactive><strong className="text-2xl text-text-primary">{competitionResults.length}</strong><p className="mt-1 text-sm text-text-secondary">成绩 / 可信成果</p></Card></Link><Link to="/assets/learning"><Card interactive><strong className="text-2xl text-text-primary">{learning.filter(item => item.status !== "notStarted").length}</strong><p className="mt-1 text-sm text-text-secondary">学习成果</p></Card></Link><Link to="/assets/certificates"><Card interactive><strong className="text-2xl text-text-primary">{certificates.length}</strong><p className="mt-1 text-sm text-text-secondary">证书记录</p></Card></Link></div></Section><Section title="下一步"><Card><h2 className="font-semibold text-text-primary">把可信事实整理成自己的履历表达</h2><p className="mt-2 text-sm leading-5 text-text-secondary">系统事实保持只读；你可以选择哪些经历进入长期简历，并编辑面向岗位的表达。</p><SecondaryButton className="mt-4 w-full" onClick={() => navigate("/me/resume")}>整理长期简历</SecondaryButton></Card></Section></div></PublicShell>;
}

export function ExperiencesPage() {
  const experiences = useExperienceFacts();
  return <PublicShell showNavigation={false}><PageHeader title="赛事经历" backTo="/assets" /><div className="space-y-4 px-4 py-5">{experiences.length ? experiences.map(({ identity, competition, workspace, lifecycle }) => <Link key={identity.competitionId} to={`/assets/experiences/${identity.competitionId}`} className="block"><FactCard title={competition!.name} meta={`${workspace!.team.role} · ${workspace!.project.name}`} action={<StatusTag tone={lifecycle === "ended" || identity.identityStatus === "revoked" ? "neutral" : "info"}>{lifecycleLabel(lifecycle, identity.identityStatus)}</StatusTag>}><p className="text-sm leading-5 text-text-secondary">{workspace!.project.summary}</p></FactCard></Link>) : <Card><p className="text-sm text-text-secondary">当前账号还没有赛事经历。</p></Card>}</div></PublicShell>;
}

export function ExperienceDetailPage() {
  const { experienceId } = useParams();
  const experience = useExperienceFacts().find(item => item.identity.competitionId === experienceId);
  const { learningFor } = useLongTermAssets();
  if (!experience) return <PublicShell showNavigation={false}><PageHeader title="经历不存在" backTo="/assets/experiences" /></PublicShell>;
  const { identity, competition, workspace, lifecycle } = experience;
  const relatedCourses = courses.filter(course => course.source.type === "competition" && course.source.competitionId === experienceId);
  return <PublicShell showNavigation={false}><PageHeader title="参赛经历" backTo="/assets/experiences" /><div className="space-y-6 px-4 py-5"><div><StatusTag tone={lifecycle === "ended" || identity.identityStatus === "revoked" ? "neutral" : "info"}>{lifecycleLabel(lifecycle, identity.identityStatus)}</StatusTag><h1 className="mt-3 text-xl font-semibold leading-7 text-text-primary">{competition?.name}</h1></div><Card className="space-y-3"><div><p className="text-xs text-text-secondary">项目</p><p className="mt-1 font-semibold text-text-primary">{workspace?.project.name}</p><p className="mt-2 text-sm leading-5 text-text-secondary">{workspace?.project.summary}</p></div><div className="grid grid-cols-2 gap-3 border-t border-border-subtle pt-3 text-sm"><div><p className="text-text-tertiary">团队角色</p><p className="mt-1 font-medium text-text-primary">{workspace?.team.role}</p></div><div><p className="text-text-tertiary">赛道</p><p className="mt-1 font-medium text-text-primary">{workspace?.project.track}</p></div></div></Card><Section title="比赛结果与证书"><div className="grid grid-cols-2 gap-3"><Link to="/assets/results"><Card interactive><p className="font-medium text-text-primary">成绩 / 成果</p><p className="mt-1 text-xs text-text-secondary">查看系统结果事实</p></Card></Link><Link to="/assets/certificates"><Card interactive><p className="font-medium text-text-primary">证书</p><p className="mt-1 text-xs text-text-secondary">查看统一证书记录</p></Card></Link></div></Section>{relatedCourses.length > 0 && <Section title="赛事关联学习成果"><div className="space-y-3">{relatedCourses.map(course => { const record = learningFor(course.id); return <Link key={course.id} to={`/courses/${course.id}/achievement`} className="block"><Card interactive><div className="flex items-center justify-between gap-3"><div><p className="font-medium text-text-primary">{course.title}</p><p className="mt-1 text-xs text-text-secondary">进度 {record.progress}%</p></div><StatusTag tone={record.status === "completed" ? "success" : "info"}>{record.status === "completed" ? "已完成" : "学习中"}</StatusTag></div></Card></Link>; })}</div></Section>}{(lifecycle === "ended" || identity.identityStatus === "revoked") && <Card className="border border-border-subtle"><p className="font-semibold text-text-primary">赛事期权限保持关闭</p><p className="mt-2 text-sm leading-5 text-text-secondary">这里仅查看长期资产，不会因为打开历史经历重新激活该赛事 workspace。</p></Card>}</div></PublicShell>;
}

export function LearningAssetsPage() {
  const { learning, learningFor } = useLongTermAssets();
  const active = courses.filter(course => learningFor(course.id).status !== "notStarted");
  return <PublicShell showNavigation={false}><PageHeader title="学习成果" backTo="/assets" /><div className="space-y-4 px-4 py-5">{active.map(course => { const record = learningFor(course.id); return <Link key={course.id} to={`/courses/${course.id}/achievement`} className="block"><FactCard title={course.title} meta={course.source.label} action={<StatusTag tone={record.status === "completed" ? "success" : "info"}>{record.status === "completed" ? "已完成" : "学习中"}</StatusTag>}><ProgressBar value={record.progress} /><p className="text-xs text-text-secondary">考试：{record.assessment === "passed" ? "已通过" : record.assessment === "failed" ? "未通过" : "未参加"}</p></FactCard></Link>; })}{learning.length === 0 && <Card><p className="text-sm text-text-secondary">还没有学习记录。</p></Card>}</div></PublicShell>;
}

export function ResultsPage() {
  const experiences = useExperienceFacts();
  const { competitionResults } = useLongTermAssets();
  const runtime = useWorkshopRuntime();
  const workshopFacts = useMemo(() => experiences.flatMap(experience => completedResults(runtime.getRuntime(experience.identity.competitionId)).map(result => ({ competitionId: experience.identity.competitionId, result }))), [experiences, runtime]);
  return <PublicShell showNavigation={false}><PageHeader title="成绩与可信成果" backTo="/assets" /><div className="space-y-6 px-4 py-5"><TrustNote /><Section title="赛事结果事实"><div className="space-y-3">{competitionResults.map(record => { const competition = competitionById(record.competitionId); const template = resultById(record.resultId); return <Link key={record.id} to={`/assets/results/${record.id}`} className="block"><FactCard title={record.grade} meta={`${competition?.name ?? record.competitionId}${template ? ` · ${template.title}` : ""}`} action={<StatusTag tone={record.status === "trusted" ? "success" : record.status === "pending" ? "warning" : "neutral"}>{record.status === "trusted" ? "可信" : record.status === "pending" ? "处理中" : "已归档"}</StatusTag>} /></Link>; })}</div></Section><Section title="赛事工坊项目成果"><div className="space-y-3">{workshopFacts.slice(0,8).map(({ competitionId, result }) => <Card key={`${competitionId}:${result.id}`}><p className="text-xs text-text-secondary">{competitionById(competitionId)?.name}</p><h3 className="mt-1 font-semibold text-text-primary">{result.title}</h3><p className="mt-2 text-sm leading-5 text-text-secondary">{result.summary}</p><p className="mt-3 text-xs text-text-brand">来源 ID：{result.id}</p></Card>)}</div></Section></div></PublicShell>;
}

export function ResultDetailPage() {
  const { resultId } = useParams();
  const { competitionResults } = useLongTermAssets();
  const record = competitionResults.find(item => item.id === resultId);
  if (!record) return <PublicShell showNavigation={false}><PageHeader title="结果不存在" backTo="/assets/results" /></PublicShell>;
  const competition = competitionById(record.competitionId);
  const template = resultById(record.resultId);
  return <PublicShell showNavigation={false}><PageHeader title="结果详情" backTo="/assets/results" /><div className="space-y-5 px-4 py-5"><Card className="space-y-3"><div className="flex items-start justify-between gap-3"><div><p className="text-xs text-text-secondary">{competition?.name}</p><h1 className="mt-1 text-xl font-semibold text-text-primary">{record.grade}</h1></div><StatusTag tone={record.status === "trusted" ? "success" : "warning"}>{record.status === "trusted" ? "系统可信事实" : "处理中"}</StatusTag></div>{template && <><p className="text-sm leading-5 text-text-secondary">关联项目成果：{template.title}</p><p className="text-sm leading-5 text-text-secondary">{template.summary}</p></>}</Card>{record.certificateId && <Link to={`/assets/certificates/${record.certificateId}`} className="block"><Card interactive><p className="font-medium text-text-primary">查看关联证书 →</p></Card></Link>}<TrustNote /></div></PublicShell>;
}

export function CertificatesPage() {
  const { certificates } = useLongTermAssets();
  return <PublicShell showNavigation={false}><PageHeader title="我的证书" backTo="/assets" /><div className="space-y-4 px-4 py-5">{certificates.map(item => <Link key={item.id} to={`/assets/certificates/${item.id}`} className="block"><FactCard title={item.title} meta={`${item.issuer} · ${item.sourceType === "competition" ? "赛事" : "课程"}来源`} action={<StatusTag tone={item.status === "claimed" ? "success" : item.status === "claimable" ? "info" : item.status === "pending" ? "warning" : "danger"}>{item.status === "claimed" ? "已领取" : item.status === "claimable" ? "可领取" : item.status === "pending" ? "待发放" : "已撤销"}</StatusTag>} /></Link>)}</div></PublicShell>;
}

export function CertificateDetailPage() {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  const { certificates, claimCertificate } = useLongTermAssets();
  const item = certificates.find(value => value.id === certificateId);
  if (!item) return <PublicShell showNavigation={false}><PageHeader title="证书不存在" backTo="/assets/certificates" /></PublicShell>;
  const sourceTitle = item.sourceType === "competition" ? competitionById(item.competitionId)?.name : courses.find(course => course.id === item.courseId)?.title;
  return <PublicShell showNavigation={false}><PageHeader title="证书详情" backTo="/assets/certificates" /><div className="space-y-5 px-4 py-5"><Card className="space-y-4"><div><p className="text-xs text-text-secondary">{item.issuer}</p><h1 className="mt-1 text-xl font-semibold leading-7 text-text-primary">{item.title}</h1></div><div className="grid grid-cols-2 gap-3 text-sm"><div><p className="text-text-tertiary">来源</p><p className="mt-1 text-text-primary">{sourceTitle ?? "—"}</p></div><div><p className="text-text-tertiary">状态</p><p className="mt-1 text-text-primary">{item.status}</p></div></div><div className="border-t border-border-subtle pt-3"><p className="text-xs text-text-tertiary">验真码</p><p className="mt-1 font-mono text-sm text-text-primary">{item.verificationCode}</p></div></Card>{item.status === "claimable" && <Button className="w-full" onClick={() => claimCertificate(item.id)}>领取证书</Button>}<SecondaryButton className="w-full" onClick={() => navigate(`/assets/verification?code=${encodeURIComponent(item.verificationCode)}`)}>快速验真</SecondaryButton><TrustNote /></div></PublicShell>;
}

export function VerificationPage() {
  const { certificates } = useLongTermAssets();
  const routeLocation = useLocation();
  const params = new URLSearchParams(routeLocation.search);
  const [code, setCode] = useState(params.get("code") ?? "");
  const [checked, setChecked] = useState(false);
  const match = checked ? certificates.find(item => item.verificationCode.toLowerCase() === code.trim().toLowerCase() && item.status !== "revoked") : undefined;
  return <PublicShell showNavigation={false}><PageHeader title="快速验真" backTo="/assets" /><div className="space-y-5 px-4 py-5"><Card><label className="text-sm font-medium text-text-primary">证书验真码</label><input value={code} onChange={event => { setCode(event.target.value); setChecked(false); }} className="mt-3 min-h-touch w-full rounded-control border border-border bg-surface px-3 text-sm outline-none focus:border-primary" placeholder="输入证书验真码" /><Button className="mt-3 w-full" disabled={!code.trim()} onClick={() => setChecked(true)}>验证</Button></Card>{checked && (match ? <Card className="border border-success bg-success-bg"><p className="font-semibold text-success-text">验证通过</p><p className="mt-2 text-sm text-success-text">{match.title} · {match.issuer}</p></Card> : <Card className="border border-danger bg-danger-bg"><p className="font-semibold text-danger-text">未找到有效记录</p><p className="mt-2 text-sm text-danger-text">请检查验真码，或确认该证书是否已撤销。</p></Card>)}</div></PublicShell>;
}

export function ApplicationsAssetSummary() {
  const { applications } = usePublicPlatform();
  return <div className="space-y-3">{applications.map(record => <Card key={record.opportunityId}><p className="font-medium text-text-primary">{opportunityById(record.opportunityId)?.title ?? record.opportunityId}</p><p className="mt-1 text-xs text-text-secondary">共享状态：{record.status}</p></Card>)}</div>;
}
