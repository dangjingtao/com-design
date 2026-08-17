import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, Card, GhostButton, PageHeader, PublicShell, SecondaryButton, Section, StatusTag } from "../../components/ui";
import { courseById, courses } from "./data";
import { ProgressBar, SourceLine, useAccountAction, useAccountLoggedIn } from "./shared";
import { useLongTermAssets } from "./store";

const statusLabel = (status: "notStarted" | "inProgress" | "completed") => status === "completed" ? "已完成" : status === "inProgress" ? "学习中" : "未开始";

export function CoursesPage() {
  const loggedIn = useAccountLoggedIn();
  const { learningFor } = useLongTermAssets();
  const [filter, setFilter] = useState<"all" | "learning" | "completed">("all");
  const visible = useMemo(() => courses.filter(course => {
    if (!loggedIn) return true;
    const record = learningFor(course.id);
    return filter === "all" || (filter === "learning" ? record.status === "inProgress" : record.status === "completed");
  }), [filter, learningFor, loggedIn]);

  return <PublicShell><PageHeader title="课程" subtitle="支撑参赛与就业成长，学习结果长期保留" /><div className="space-y-5 px-4 py-5">
    {loggedIn && <div className="flex gap-2">{(["all","learning","completed"] as const).map(value => <button key={value} onClick={() => setFilter(value)} className={`min-h-touch rounded-control px-3 text-sm font-medium ${filter === value ? "bg-primary-container text-text-brand" : "bg-surface text-text-secondary"}`}>{value === "all" ? "全部" : value === "learning" ? "学习中" : "已完成"}</button>)}</div>}
    <div className="space-y-3">{visible.map(course => { const record = loggedIn ? learningFor(course.id) : undefined; return <Link key={course.id} to={`/courses/${course.id}`} className="block"><Card interactive className="space-y-3"><SourceLine source={course.source} /><div><h2 className="text-base font-semibold text-text-primary">{course.title}</h2><p className="mt-1 text-sm leading-5 text-text-secondary">{course.summary}</p></div><div className="flex items-center justify-between text-xs text-text-secondary"><span>{course.duration}</span>{record ? <StatusTag tone={record.status === "completed" ? "success" : record.status === "inProgress" ? "info" : "neutral"}>{statusLabel(record.status)}</StatusTag> : <StatusTag tone="neutral">登录查看进度</StatusTag>}</div>{record && <ProgressBar value={record.progress} />}</Card></Link>; })}</div>
  </div></PublicShell>;
}

export function CourseDetailPage() {
  const navigate = useNavigate();
  const loggedIn = useAccountLoggedIn();
  const accountAction = useAccountAction();
  const { courseId } = useParams();
  const course = courseById(courseId);
  const { learningFor, startCourse, benefitStatusFor } = useLongTermAssets();
  if (!course) return <PublicShell showNavigation={false}><PageHeader title="课程不存在" backTo="/courses" /></PublicShell>;
  const record = learningFor(course.id);
  const unlocked = course.entitlement === "free" || !course.unlockBenefitId || (loggedIn && ["claimed","used"].includes(benefitStatusFor(course.unlockBenefitId)));
  const begin = () => {
    if (record.status === "completed") {
      accountAction(() => navigate(`/courses/${course.id}/achievement`));
      return;
    }
    accountAction(() => {
      startCourse(course.id);
      navigate(`/courses/${course.id}/learn`);
    });
  };
  return <PublicShell showNavigation={false}><PageHeader title="课程详情" backTo="/courses" /><div className="space-y-6 px-4 py-5"><SourceLine source={course.source} /><div><h1 className="text-2xl font-semibold leading-8 text-text-primary">{course.title}</h1><p className="mt-3 text-sm leading-6 text-text-secondary">{course.summary}</p></div>{loggedIn ? <Card><div className="flex items-center justify-between"><span className="text-sm text-text-secondary">当前学习状态</span><StatusTag tone={record.status === "completed" ? "success" : record.status === "inProgress" ? "info" : "neutral"}>{statusLabel(record.status)}</StatusTag></div><div className="mt-3"><ProgressBar value={record.progress} /></div><p className="mt-2 text-xs text-text-secondary">进度 {record.progress}% · {course.duration}</p></Card> : <Card><p className="text-sm text-text-secondary">课程目录可公开浏览；登录后读取学习进度、考试和证书状态。</p></Card>}
    <Section title="课程目录"><Card>{course.lessons.map((lesson, index) => <div key={lesson} className="flex min-h-touch items-center gap-3 border-b border-border-subtle last:border-0"><span className="text-xs text-text-tertiary">{String(index + 1).padStart(2,"0")}</span><span className="text-sm text-text-primary">{lesson}</span></div>)}</Card></Section>
    {!unlocked ? <Card className="border border-warning bg-warning-bg"><p className="font-semibold text-warning-text">需要账号权益解锁</p><p className="mt-2 text-sm leading-5 text-warning-text">旧原型“需兑换课程”在详情页内完成资格说明，不另造商城。</p>{loggedIn ? <SecondaryButton className="mt-4 w-full" onClick={() => navigate(`/benefits/${course.unlockBenefitId}`)}>查看对应权益</SecondaryButton> : <Button className="mt-4 w-full" onClick={() => accountAction(() => undefined)}>登录后查看资格</Button>}</Card> : <Button className="w-full" onClick={begin}>{!loggedIn ? "登录后开始学习" : record.status === "notStarted" ? "开始学习" : record.status === "completed" ? "查看学习成果" : "继续学习"}</Button>}
  </div></PublicShell>;
}

export function CourseLearnPage() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const course = courseById(courseId);
  const { learningFor, advanceCourse, completeCourse } = useLongTermAssets();
  if (!course) return null;
  const record = learningFor(course.id);
  const nextIndex = Math.min(course.lessons.length - 1, Math.floor((record.progress / 100) * course.lessons.length));
  return <PublicShell showNavigation={false}><PageHeader title="课程学习" backTo={`/courses/${course.id}`} /><div className="space-y-6 px-4 py-5"><div><SourceLine source={course.source} /><h1 className="mt-3 text-lg font-semibold text-text-primary">{course.title}</h1></div><Card className="space-y-3"><div className="flex items-center justify-between"><span className="text-sm font-medium text-text-primary">学习进度</span><span className="text-sm text-text-brand">{record.progress}%</span></div><ProgressBar value={record.progress} /><p className="text-xs text-text-secondary">当前：{course.lessons[nextIndex]}</p></Card><Section title="本节内容"><Card><h2 className="font-semibold text-text-primary">{course.lessons[nextIndex]}</h2><p className="mt-2 text-sm leading-6 text-text-secondary">完成一节后，进度写回同一份长期学习记录。</p></Card></Section><div className="grid grid-cols-2 gap-3">{record.progress < 100 ? <><SecondaryButton onClick={() => advanceCourse(course.id)}>完成本节</SecondaryButton><Button onClick={() => { completeCourse(course.id); navigate(`/courses/${course.id}/assessment`); }}>完成课程并考试</Button></> : <Button className="col-span-2" onClick={() => navigate(`/courses/${course.id}/assessment`)}>进入课程考试</Button>}</div></div></PublicShell>;
}

export function CourseAssessmentPage() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const course = courseById(courseId);
  const { learningFor, submitAssessment } = useLongTermAssets();
  const [answer, setAnswer] = useState<"" | "a" | "b">("");
  if (!course) return null;
  const record = learningFor(course.id);
  const submit = () => { const passed = answer === "b"; submitAssessment(course.id, passed); };
  return <PublicShell showNavigation={false}><PageHeader title="课程考试" backTo={`/courses/${course.id}/learn`} /><div className="space-y-5 px-4 py-5"><Card><p className="text-sm font-medium text-text-primary">示例题：一次业务复盘最先应该确认什么？</p><div className="mt-4 space-y-2">{[["a","先扩大投放"],["b","先确认目标、口径与真实数据"]].map(([value,label]) => <button key={value} onClick={() => setAnswer(value as "a" | "b")} className={`min-h-touch w-full rounded-control border px-3 text-left text-sm ${answer === value ? "border-primary bg-primary-container text-text-brand" : "border-border bg-surface text-text-primary"}`}>{label}</button>)}</div></Card>{record.assessment !== "idle" && <Card className={record.assessment === "passed" ? "border border-success bg-success-bg" : "border border-danger bg-danger-bg"}><p className={record.assessment === "passed" ? "font-semibold text-success-text" : "font-semibold text-danger-text"}>{record.assessment === "passed" ? "考试通过，课程成果已写入长期学习记录" : "本次未通过，可重新作答"}</p></Card>}{record.assessment === "passed" ? <Button className="w-full" onClick={() => navigate(`/courses/${course.id}/achievement`)}>查看成绩与证书</Button> : <Button className="w-full" disabled={!answer} onClick={submit}>提交答案</Button>}</div></PublicShell>;
}

export function CourseAchievementPage() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const course = courseById(courseId);
  const { learningFor, certificates, claimCertificate } = useLongTermAssets();
  if (!course) return null;
  const record = learningFor(course.id);
  const certificate = certificates.find(item => item.courseId === course.id);
  return <PublicShell showNavigation={false}><PageHeader title="课程成果" backTo={`/courses/${course.id}`} /><div className="space-y-5 px-4 py-5"><Card className="space-y-3"><div className="flex items-center justify-between"><h2 className="font-semibold text-text-primary">学习结果</h2><StatusTag tone={record.assessment === "passed" ? "success" : "warning"}>{record.assessment === "passed" ? "已通过" : "待完成"}</StatusTag></div><p className="text-sm text-text-secondary">课程进度 {record.progress}% · 考试 {record.assessment === "passed" ? "通过" : record.assessment === "failed" ? "未通过" : "未参加"}</p></Card>{certificate ? <Card className="space-y-3"><div className="flex items-start justify-between gap-3"><div><p className="text-xs text-text-secondary">课程证书</p><h2 className="mt-1 font-semibold text-text-primary">{certificate.title}</h2></div><StatusTag tone={certificate.status === "claimed" ? "success" : "info"}>{certificate.status === "claimed" ? "已领取" : "可领取"}</StatusTag></div>{certificate.status === "claimable" && <Button className="w-full" onClick={() => claimCertificate(certificate.id)}>领取证书</Button>}<GhostButton className="w-full" onClick={() => navigate(`/assets/certificates/${certificate.id}`)}>查看长期证书记录</GhostButton></Card> : <Card><p className="text-sm text-text-secondary">完成课程并通过考试后，证书会进入统一证书记录。</p></Card>}<SecondaryButton className="w-full" onClick={() => navigate("/assets/learning")}>查看我的学习成果</SecondaryButton></div></PublicShell>;
}
