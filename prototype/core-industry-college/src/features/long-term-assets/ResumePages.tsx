import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Card, PageHeader, PublicShell, SecondaryButton, Section, StatusTag } from "../../components/ui";
import { workspaceData } from "../competition-workspace/data";
import { usePublicPlatform } from "../public-platform/PublicPlatform";
import { competitionById } from "../public-platform/data";
import { courses } from "./data";
import { TrustNote } from "./shared";
import { useLongTermAssets } from "./store";

export function ResumePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = new URLSearchParams(location.search).get("returnTo");
  const { identities } = usePublicPlatform();
  const { resume, profile, learningFor, certificates, toggleResumeFact } = useLongTermAssets();

  const facts = useMemo(() => {
    const experienceFacts = identities.map(identity => {
      const workspace = workspaceData[identity.competitionId];
      const competition = competitionById(identity.competitionId);
      if (!workspace || !competition) return null;
      return { key: `experience:${identity.competitionId}`, type: "赛事经历", title: `${competition.name} · ${workspace.team.role}`, detail: workspace.project.name, trusted: true };
    }).filter((item): item is NonNullable<typeof item> => Boolean(item));
    const learningFacts = courses.filter(course => learningFor(course.id).status === "completed").map(course => ({ key: `learning:${course.id}`, type: "学习成果", title: course.title, detail: `考试 ${learningFor(course.id).assessment === "passed" ? "已通过" : "待确认"}`, trusted: true }));
    const certificateFacts = certificates.filter(item => item.status === "claimed").map(item => ({ key: `certificate:${item.id}`, type: "证书", title: item.title, detail: item.issuer, trusted: true }));
    return [...experienceFacts, ...learningFacts, ...certificateFacts];
  }, [identities, learningFor, certificates]);

  const ready = Boolean(profile.name && profile.school && resume.strengths.trim() && resume.education.trim() && resume.selectedFactKeys.length > 0);
  return <PublicShell showNavigation={false}><PageHeader title="长期简历" backTo={returnTo ?? "/me"} /><div className="space-y-6 px-4 py-5"><div className="flex items-center justify-between gap-3"><div><p className="text-sm text-text-secondary">面向机会投递的长期履历表达</p><h1 className="mt-1 text-xl font-semibold text-text-primary">{profile.name}</h1></div><StatusTag tone={ready ? "success" : "warning"}>{ready ? "可投递" : "待完善"}</StatusTag></div><TrustNote />
    <Section title="基础资料" action={<Link className="text-sm font-medium text-text-brand" to="/me/profile">编辑</Link>}><Card><p className="font-medium text-text-primary">{profile.school} · {profile.major}</p><p className="mt-2 text-sm text-text-secondary">{profile.city} · {profile.email}</p></Card></Section>
    <Section title="个人优势" action={<Link className="text-sm font-medium text-text-brand" to={`/me/resume/strengths${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}>编辑表达</Link>}><Card><p className="text-sm leading-6 text-text-primary">{resume.strengths || "尚未填写"}</p></Card></Section>
    <Section title="教育经历" action={<Link className="text-sm font-medium text-text-brand" to={`/me/resume/education${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}>编辑表达</Link>}><Card><p className="text-sm leading-6 text-text-primary">{resume.education || "尚未填写"}</p></Card></Section>
    <Section title="选择进入简历的可信经历"><div className="space-y-3">{facts.map(fact => { const selected = resume.selectedFactKeys.includes(fact.key); return <button key={fact.key} onClick={() => toggleResumeFact(fact.key)} className={`w-full rounded-container border p-3 text-left ${selected ? "border-primary bg-primary-container" : "border-border-subtle bg-surface"}`}><div className="flex items-start justify-between gap-3"><div><div className="flex flex-wrap gap-2"><StatusTag tone="success">系统事实</StatusTag><StatusTag tone="neutral">{fact.type}</StatusTag></div><p className="mt-2 font-semibold text-text-primary">{fact.title}</p><p className="mt-1 text-sm text-text-secondary">{fact.detail}</p></div><span className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs ${selected ? "border-primary bg-primary text-on-primary" : "border-border text-text-tertiary"}`}>{selected ? "✓" : ""}</span></div></button>; })}</div></Section>
    <Card className="border border-border-subtle"><p className="text-xs text-text-secondary">最近整理：{resume.updatedAt}</p><p className="mt-2 text-sm text-text-primary">已选择 {resume.selectedFactKeys.length} 项系统事实。修改这里的选择不会改动赛事、成绩或证书原始记录。</p></Card>
    {returnTo ? <Button className="w-full" disabled={!ready} onClick={() => navigate(returnTo)}>返回机会继续投递</Button> : <SecondaryButton className="w-full" onClick={() => navigate("/opportunities")}>用这份简历寻找机会</SecondaryButton>}
  </div></PublicShell>;
}

export function ResumeStrengthsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { resume, updateStrengths } = useLongTermAssets();
  const [value, setValue] = useState(resume.strengths);
  const returnTo = new URLSearchParams(location.search).get("returnTo");
  const save = () => { updateStrengths(value.trim()); navigate(`/me/resume${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`); };
  return <PublicShell showNavigation={false}><PageHeader title="个人优势" backTo={`/me/resume${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`} /><div className="space-y-5 px-4 py-5"><Card><p className="text-sm leading-5 text-text-secondary">这里编辑的是简历表达，不会修改系统记录里的赛事结果或课程成绩。</p></Card><textarea value={value} onChange={event => setValue(event.target.value)} rows={8} className="w-full rounded-control border border-border bg-surface p-3 text-sm leading-6 text-text-primary outline-none focus:border-primary" /><Button className="w-full" disabled={!value.trim()} onClick={save}>保存表达</Button></div></PublicShell>;
}

export function ResumeEducationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { resume, updateEducation } = useLongTermAssets();
  const [value, setValue] = useState(resume.education);
  const returnTo = new URLSearchParams(location.search).get("returnTo");
  const save = () => { updateEducation(value.trim()); navigate(`/me/resume${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`); };
  return <PublicShell showNavigation={false}><PageHeader title="教育经历" backTo={`/me/resume${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`} /><div className="space-y-5 px-4 py-5"><Card><p className="text-sm leading-5 text-text-secondary">教育经历是学生维护的简历表达；赛事与课程可信事实仍由各自来源保存。</p></Card><textarea value={value} onChange={event => setValue(event.target.value)} rows={6} className="w-full rounded-control border border-border bg-surface p-3 text-sm leading-6 text-text-primary outline-none focus:border-primary" /><Button className="w-full" disabled={!value.trim()} onClick={save}>保存</Button></div></PublicShell>;
}

export function ProfilePage() {
  const navigate = useNavigate();
  const { profile, updateProfile } = useLongTermAssets();
  const [draft, setDraft] = useState(profile);
  const fields: { key: keyof typeof draft; label: string }[] = [
    { key: "name", label: "姓名" },
    { key: "school", label: "学校" },
    { key: "major", label: "专业" },
    { key: "city", label: "所在城市" },
    { key: "email", label: "邮箱" },
  ];
  return <PublicShell showNavigation={false}><PageHeader title="个人资料" backTo="/me" /><div className="space-y-4 px-4 py-5"><Card><p className="text-sm leading-5 text-text-secondary">基础资料属于长期账号，不绑定某一场赛事。赛事身份仍由公共账号身份集合单独管理。</p></Card>{fields.map(field => <label key={field.key} className="block"><span className="text-sm font-medium text-text-primary">{field.label}</span><input value={draft[field.key]} onChange={event => setDraft(current => ({ ...current, [field.key]: event.target.value }))} className="mt-2 min-h-touch w-full rounded-control border border-border bg-surface px-3 text-sm outline-none focus:border-primary" /></label>)}<Button className="w-full" onClick={() => { updateProfile(draft); navigate("/me"); }}>保存资料</Button></div></PublicShell>;
}
