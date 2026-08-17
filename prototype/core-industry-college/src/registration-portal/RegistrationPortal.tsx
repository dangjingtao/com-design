import { useState, type ReactNode } from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Button, SecondaryButton, StatusTag } from "../components/ui";
import { demoMember, RegistrationPortalProvider, useRegistrationPortal, type RegistrationRole, type ReviewStatus } from "./model";

const portalBase = "/registration-portal";

const navItems = [
  { label: "团队信息", to: `${portalBase}/team` },
  { label: "承诺书", to: `${portalBase}/commitment` },
  { label: "团队业绩报告", to: `${portalBase}/report` },
  { label: "证书下载", to: `${portalBase}/certificates` },
] as const;

function PortalFrame({ title, children, showNav = false, actions }: { title: string; children: ReactNode; showNav?: boolean; actions?: ReactNode }) {
  const location = useLocation();
  return <div className="min-h-screen bg-background text-foreground">
    <div className="border-b border-warning/20 bg-warning-bg px-4 py-2 text-center text-sm font-medium text-warning-text">
      🔔 团队注册报名时间：2025年10月20日—2026年1月20日 · 中保真流程原型
    </div>
    <header className="border-b border-border-subtle bg-surface">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-4 py-4 lg:px-8">
        <Link to={`${portalBase}/start`} className="flex min-w-0 items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-container bg-primary-container text-xl font-bold text-text-brand">三</div>
          <div className="min-w-0"><p className="truncate text-sm font-semibold text-text-primary sm:text-base">全国大学生电子商务“创新、创意及创业”挑战赛</p><p className="mt-0.5 text-xs text-text-secondary">报名门户 · 响应式中保真原型</p></div>
        </Link>
        <div className="hidden items-center gap-2 md:flex"><Link to={`${portalBase}/start`} className="rounded-control px-3 py-2 text-sm text-text-secondary hover:bg-surface-subtle">报名首页</Link><span className="text-xs text-text-tertiary">独立原型路由</span></div>
      </div>
    </header>
    <div className={`mx-auto grid w-full max-w-[1440px] gap-6 px-4 py-6 lg:px-8 ${showNav ? "lg:grid-cols-[220px_minmax(0,1fr)]" : ""}`}>
      {showNav && <aside className="hidden lg:block"><div className="sticky top-6 overflow-hidden rounded-container border border-border-subtle bg-surface">{navItems.map(item => { const active = location.pathname.startsWith(item.to); return <Link key={item.to} to={item.to} className={`block min-h-touch border-b border-border-subtle px-5 py-4 text-sm font-medium last:border-b-0 ${active ? "border-l-4 border-l-primary bg-primary-container text-text-brand" : "text-text-secondary hover:bg-surface-subtle"}`}>{item.label}</Link>; })}</div></aside>}
      <main className="min-w-0">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-semibold text-text-primary sm:text-[28px]">{title}</h1><p className="mt-1 text-sm text-text-secondary">PC 优先宽布局，窄屏自动收成单列，不进入手机端主导航。</p></div>{actions}</div>
        {showNav && <div className="mb-5 flex gap-2 overflow-x-auto lg:hidden">{navItems.map(item => { const active = location.pathname.startsWith(item.to); return <Link key={item.to} to={item.to} className={`whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium ${active ? "bg-primary-container text-text-brand" : "bg-surface text-text-secondary"}`}>{item.label}</Link>; })}</div>}
        {children}
      </main>
    </div>
    <ScenarioDock />
  </div>;
}

function Panel({ title, children, action, className = "" }: { title?: string; children: ReactNode; action?: ReactNode; className?: string }) {
  return <section className={`overflow-hidden rounded-container border border-border-subtle bg-surface ${className}`}>
    {(title || action) && <div className="flex min-h-14 items-center justify-between gap-3 border-b border-border-subtle px-4 py-3 sm:px-6"><h2 className="text-base font-semibold text-text-primary sm:text-lg">{title}</h2>{action}</div>}
    <div className="p-4 sm:p-6">{children}</div>
  </section>;
}

function Field({ label, value, onChange, placeholder, type = "text", required = false, disabled = false }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string; required?: boolean; disabled?: boolean }) {
  return <label className="grid gap-2 sm:grid-cols-[132px_minmax(0,1fr)] sm:items-center"><span className="text-sm text-text-secondary">{required && <span className="mr-1 text-danger">*</span>}{label}</span><input className="h-11 w-full rounded-control border border-border bg-surface px-3 text-sm text-text-primary outline-none focus:border-primary disabled:bg-surface-subtle disabled:text-text-tertiary" value={value} type={type} disabled={disabled} placeholder={placeholder} onChange={event => onChange(event.target.value)} /></label>;
}

function TextAreaField({ label, value, onChange, placeholder, required = false, rows = 4 }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; required?: boolean; rows?: number }) {
  return <label className="grid gap-2 sm:grid-cols-[132px_minmax(0,1fr)] sm:items-start"><span className="pt-2 text-sm text-text-secondary">{required && <span className="mr-1 text-danger">*</span>}{label}</span><textarea className="w-full rounded-control border border-border bg-surface px-3 py-2 text-sm leading-6 text-text-primary outline-none focus:border-primary" value={value} rows={rows} placeholder={placeholder} onChange={event => onChange(event.target.value)} /></label>;
}

function StepStrip({ current }: { current: number }) {
  const labels = ["身份", "账号注册", "注册答题", "团队报名", "审核", "承诺书", "完成"];
  return <div className="mb-6 overflow-x-auto rounded-container border border-border-subtle bg-surface px-3 py-3"><div className="flex min-w-[690px] items-center">{labels.map((label, index) => <div key={label} className="flex flex-1 items-center"><div className="flex items-center gap-2"><span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-semibold ${index < current ? "bg-success text-white" : index === current ? "bg-primary text-on-primary" : "bg-surface-subtle text-text-tertiary"}`}>{index < current ? "✓" : index + 1}</span><span className={`text-xs font-medium ${index <= current ? "text-text-primary" : "text-text-tertiary"}`}>{label}</span></div>{index < labels.length - 1 && <div className={`mx-2 h-px flex-1 ${index < current ? "bg-success" : "bg-border-subtle"}`} />}</div>)}</div></div>;
}

function statusTone(status: ReviewStatus) {
  return status === "approved" || status === "completed" ? "success" as const : status === "pending" ? "warning" as const : status === "rejected" ? "danger" as const : "neutral" as const;
}

function statusLabel(status: ReviewStatus) {
  return status === "pending" ? "合规未审" : status === "rejected" ? "审核未通过" : status === "approved" ? "审核通过" : status === "completed" ? "报名完成" : status === "closed" ? "报名已截止" : "待提交";
}

function StartPage() {
  const navigate = useNavigate();
  const { setRole, reset } = useRegistrationPortal();
  const choose = (role: RegistrationRole) => { reset(); setRole(role); navigate(`${portalBase}/account`); };
  return <PortalFrame title="三创赛报名"><StepStrip current={0} /><div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
    <Panel><div className="max-w-2xl"><StatusTag tone="info">第十六届全国大学生三创赛</StatusTag><h2 className="mt-4 text-2xl font-semibold text-text-primary">选择报名身份</h2><p className="mt-3 text-sm leading-6 text-text-secondary">完整保留旧业务中的队长 / 队员分支，但不继承旧 Mockplus 的错误跳转。个人注册完成后，队长继续创建团队并提交学校审核；队员进入等待队长绑定状态。</p><div className="mt-6 grid gap-3 sm:grid-cols-2"><button onClick={() => choose("leader")} className="rounded-container border border-primary bg-primary-container p-5 text-left transition hover:-translate-y-0.5"><p className="text-lg font-semibold text-text-brand">我是队长</p><p className="mt-2 text-sm leading-5 text-text-secondary">注册账号 → 答题 → 创建团队 → 添加成员 → 提交审核 → 承诺书</p></button><button onClick={() => choose("member")} className="rounded-container border border-border p-5 text-left transition hover:-translate-y-0.5 hover:border-primary"><p className="text-lg font-semibold text-text-primary">我是队员</p><p className="mt-2 text-sm leading-5 text-text-secondary">注册账号 → 答题 → 注册成功 → 等待队长通过邮箱绑定</p></button></div></div></Panel>
    <Panel title="流程说明"><ol className="space-y-4 text-sm text-text-secondary"><li><b className="text-text-primary">1. 账号注册</b><p className="mt-1 leading-5">学校、登录名、手机号、邮箱和密码；队长额外选择赛道并填写团队名称。</p></li><li><b className="text-text-primary">2. 注册答题</b><p className="mt-1 leading-5">保留旧流程中的赛事规则答题节点，答题完成后进入不同角色后续流程。</p></li><li><b className="text-text-primary">3. 团队报名</b><p className="mt-1 leading-5">队长完善团队信息、绑定已注册队员、保存并提交审核。</p></li><li><b className="text-text-primary">4. 审核与承诺书</b><p className="mt-1 leading-5">覆盖待审核、驳回、通过、编辑截止以及承诺书生成/下载。</p></li></ol></Panel>
  </div></PortalFrame>;
}

function AccountPage() {
  const navigate = useNavigate();
  const { role, account, updateAccount } = useRegistrationPortal();
  if (!role) return <Navigate to={`${portalBase}/start`} replace />;
  return <PortalFrame title={role === "leader" ? "三创队长注册" : "三创队员注册"}><StepStrip current={1} /><Panel title="账号基本信息"><div className="mx-auto max-w-3xl space-y-4">
    <Field label="学校" value={account.school} required onChange={school => updateAccount({ school })} placeholder="输入学校名称搜索" />
    {role === "leader" && <><Field label="赛道" value={account.track} required onChange={track => updateAccount({ track })} /><Field label="团队名称" value={account.teamName} required onChange={teamName => updateAccount({ teamName })} placeholder="请输入团队名称" /></>}
    <Field label="登录名" value={account.username} required onChange={username => updateAccount({ username })} placeholder="请输入登录名" />
    <Field label="联系电话" value={account.phone} required onChange={phone => updateAccount({ phone })} placeholder="请输入联系电话" />
    <Field label="邮箱" value={account.email} required onChange={email => updateAccount({ email })} placeholder="请输入邮箱号" />
    <Field label="密码" value="12345678" type="password" required onChange={() => undefined} placeholder="请输入密码" />
    <Field label="确认密码" value="12345678" type="password" required onChange={() => undefined} placeholder="请输入确认密码" />
    <label className="flex items-start gap-2 rounded-control bg-surface-subtle p-3 text-sm text-text-secondary"><input type="checkbox" defaultChecked className="mt-1" /><span>我已阅读并同意《三创赛竞赛规则》</span></label>
    <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end"><SecondaryButton onClick={() => navigate(`${portalBase}/start`)}>返回选择身份</SecondaryButton><Button onClick={() => navigate(`${portalBase}/quiz`)}>注册并进入答题</Button></div>
  </div></Panel></PortalFrame>;
}

function QuizPage() {
  const navigate = useNavigate();
  const { role, passQuiz } = useRegistrationPortal();
  const [answer, setAnswer] = useState("");
  if (!role) return <Navigate to={`${portalBase}/start`} replace />;
  const submit = () => { passQuiz(); navigate(role === "leader" ? `${portalBase}/registration-success` : `${portalBase}/member-waiting`); };
  return <PortalFrame title="三创注册答题"><StepStrip current={2} /><Panel><div className="mx-auto max-w-3xl"><div className="flex items-center justify-between"><div><p className="text-sm text-text-secondary">试卷进度</p><p className="mt-1 text-lg font-semibold text-text-primary">赛事规则确认 · 1 / 3</p></div><StatusTag tone="info">33%</StatusTag></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-subtle"><div className="h-full w-1/3 rounded-full bg-primary" /></div><div className="mt-8"><h2 className="text-base font-semibold text-text-primary">1. 团队提交报名材料后，在学校审核完成前应该如何处理？</h2><div className="mt-4 grid gap-3">{["继续修改赛事身份并进入工作区","等待审核结果，必要时按反馈修正材料","重新注册一个新的三创账号"].map((item, index) => <button key={item} onClick={() => setAnswer(String(index))} className={`min-h-touch rounded-control border px-4 py-3 text-left text-sm ${answer === String(index) ? "border-primary bg-primary-container text-text-brand" : "border-border bg-surface text-text-primary"}`}>{String.fromCharCode(65 + index)}. {item}</button>)}</div></div><div className="mt-8 flex justify-end"><Button disabled={!answer} onClick={submit}>提交答题</Button></div></div></Panel></PortalFrame>;
}

function RegistrationSuccessPage() {
  const navigate = useNavigate();
  return <PortalFrame title="注册成功"><StepStrip current={3} /><Panel><div className="mx-auto max-w-xl py-8 text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success-bg text-2xl text-success-text">✓</div><h2 className="mt-4 text-xl font-semibold text-text-primary">队长账号注册成功</h2><p className="mt-2 text-sm leading-6 text-text-secondary">下一步完善团队信息、添加已完成注册的队员，并提交学校审核。注册成功不等于赛事报名完成。</p><Button className="mt-6" onClick={() => navigate(`${portalBase}/team`)}>进入团队报名</Button></div></Panel></PortalFrame>;
}

function MemberWaitingPage() {
  const navigate = useNavigate();
  const { account } = useRegistrationPortal();
  return <PortalFrame title="队员注册成功"><StepStrip current={3} /><Panel><div className="mx-auto max-w-xl py-8 text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success-bg text-2xl text-success-text">✓</div><h2 className="mt-4 text-xl font-semibold text-text-primary">注册成功，请等待队长绑定团队信息</h2><p className="mt-2 text-sm leading-6 text-text-secondary">队长可通过你注册使用的邮箱 <b className="text-text-primary">{account.email}</b> 搜索并添加成员。绑定前不会产生赛事团队权限。</p><div className="mt-6 rounded-container bg-surface-subtle p-4 text-left text-sm text-text-secondary"><p>角色：队员</p><p className="mt-1">学校：{account.school}</p><p className="mt-1">当前状态：等待队长绑定</p></div><SecondaryButton className="mt-6" onClick={() => navigate(`${portalBase}/start`)}>返回报名首页</SecondaryButton></div></Panel></PortalFrame>;
}

function TeamPage() {
  const navigate = useNavigate();
  const { team, updateTeam, members, reviewStatus, submitReview } = useRegistrationPortal();
  if (reviewStatus === "closed") return <Navigate to={`${portalBase}/closed`} replace />;
  const readOnly = reviewStatus === "pending" || reviewStatus === "approved" || reviewStatus === "completed";
  const submit = () => { submitReview(); navigate(`${portalBase}/review`); };
  return <PortalFrame title="团队信息" showNav><StepStrip current={3} /><div className="space-y-5">
    {readOnly && <div className="rounded-control border border-warning/30 bg-warning-bg px-4 py-3 text-sm text-warning-text">队伍编辑时间已截止或已进入审核流程，如有疑问请联系管理员。</div>}
    <Panel title="团队基本信息" action={<div className="flex gap-2"><StatusTag tone={statusTone(reviewStatus)}>{statusLabel(reviewStatus)}</StatusTag>{reviewStatus !== "completed" && <StatusTag tone="neutral">合规{reviewStatus === "approved" ? "已审" : "未审"}</StatusTag>}</div>}>
      <div className="mb-6 rounded-container border border-primary/20 bg-primary-container/40 p-4 sm:p-5"><div className="grid gap-5 md:grid-cols-2"><div><p className="text-lg font-semibold text-text-primary">{team.province}</p><p className="mt-2 text-sm text-text-secondary">联系人：{team.contact}</p></div><div><p className="text-lg font-semibold text-text-primary">{team.school}</p><p className="mt-2 text-sm text-text-secondary">联系电话：{team.contactPhone}</p></div></div></div>
      <div className="space-y-4"><label className="grid gap-2 sm:grid-cols-[132px_minmax(0,1fr)] sm:items-center"><span className="text-sm text-text-secondary">作品是否首次参赛</span><button disabled={readOnly} onClick={() => updateTeam({ firstParticipation: !team.firstParticipation })} className={`relative h-7 w-12 rounded-full transition ${team.firstParticipation ? "bg-warning" : "bg-border"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${team.firstParticipation ? "left-6" : "left-1"}`} /></button></label><Field label="比赛类别" value={team.category} required disabled={readOnly} onChange={category => updateTeam({ category })} /><Field label="团队ID" value={team.teamId} disabled onChange={() => undefined} /><Field label="团队名称" value={team.teamName} disabled={readOnly} onChange={teamName => updateTeam({ teamName })} /><Field label="联系电话" value={team.phone} required disabled={readOnly} onChange={phone => updateTeam({ phone })} /><Field label="邮箱" value={team.email} required disabled={readOnly} onChange={email => updateTeam({ email })} /><label className="grid gap-2 sm:grid-cols-[132px_minmax(0,1fr)] sm:items-center"><span className="text-sm text-text-secondary">是否跨校团队</span><button disabled={readOnly} onClick={() => updateTeam({ crossSchool: !team.crossSchool })} className={`relative h-7 w-12 rounded-full transition ${team.crossSchool ? "bg-primary" : "bg-border"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${team.crossSchool ? "left-6" : "left-1"}`} /></button></label></div>
    </Panel>
    <Panel title="团队成员信息" action={!readOnly && <Button onClick={() => navigate(`${portalBase}/members`)}>添加成员</Button>}><div className="overflow-x-auto"><table className="min-w-[760px] w-full border-collapse text-sm"><thead><tr className="bg-surface-subtle text-left text-text-secondary">{["排序","姓名","学校/公司","手机号码","邮箱","学号","操作"].map(item => <th key={item} className="border border-border-subtle px-3 py-3 font-medium">{item}</th>)}</tr></thead><tbody>{members.length ? members.map((member, index) => <tr key={member.id}><td className="border border-border-subtle px-3 py-3">{index + 1}</td><td className="border border-border-subtle px-3 py-3 font-medium text-text-primary">{member.name}</td><td className="border border-border-subtle px-3 py-3">{member.school}</td><td className="border border-border-subtle px-3 py-3">{member.phone}</td><td className="border border-border-subtle px-3 py-3">{member.email}</td><td className="border border-border-subtle px-3 py-3">{member.studentId}</td><td className="border border-border-subtle px-3 py-3"><button disabled={readOnly} className="text-danger disabled:text-text-tertiary">移除</button></td></tr>) : <tr><td colSpan={7} className="border border-border-subtle px-3 py-8 text-center text-text-tertiary">暂无数据，请先添加已完成注册的队员</td></tr>}</tbody></table></div></Panel>
    <Panel title="队伍成员申请表" action={!readOnly && <SecondaryButton>保存减员申请表</SecondaryButton>}><div className="flex flex-wrap gap-3"><button className="rounded-control border border-dashed border-primary px-4 py-3 text-sm font-medium text-text-brand">⇧ 上传减员申请表</button><button className="rounded-control px-4 py-3 text-sm font-medium text-text-brand">⇩ 减员申请表模板下载</button></div></Panel>
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end"><SecondaryButton onClick={() => navigate(`${portalBase}/start`)}>保存草稿并退出</SecondaryButton>{reviewStatus === "rejected" ? <Button onClick={submit}>修正后重新提交审核</Button> : reviewStatus === "draft" ? <Button disabled={!members.length} onClick={submit}>提交审核</Button> : reviewStatus === "approved" ? <Button onClick={() => navigate(`${portalBase}/commitment`)}>填写承诺书</Button> : <Button onClick={() => navigate(`${portalBase}/review`)}>查看审核状态</Button>}</div>
  </div></PortalFrame>;
}

function AddMembersPage() {
  const navigate = useNavigate();
  const { members, addMember, removeMember } = useRegistrationPortal();
  const [query, setQuery] = useState("zhangsan@example.edu.cn");
  return <PortalFrame title="添加团队成员" showNav><StepStrip current={3} /><Panel title="通过注册邮箱查找队员"><div className="mx-auto max-w-3xl"><div className="flex flex-col gap-3 sm:flex-row"><input value={query} onChange={event => setQuery(event.target.value)} className="h-11 flex-1 rounded-control border border-border px-3 text-sm outline-none focus:border-primary" placeholder="请输入邮箱查找队员" /><Button>查找</Button></div><div className="mt-5 rounded-container border border-border-subtle p-4"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="font-semibold text-text-primary">张三</p><p className="mt-1 text-sm text-text-secondary">广州大学 · zhangsan@example.edu.cn · 已完成三创账号注册</p></div>{members.some(item => item.id === demoMember.id) ? <SecondaryButton onClick={() => removeMember(demoMember.id)}>移除成员</SecondaryButton> : <Button onClick={() => addMember(demoMember)}>添加</Button>}</div></div><div className="mt-6 flex justify-end"><Button onClick={() => navigate(`${portalBase}/team`)}>保存成员并返回</Button></div></div></Panel></PortalFrame>;
}

function ReviewPage() {
  const navigate = useNavigate();
  const { reviewStatus, rejectReview, approveReview, rejectionReason } = useRegistrationPortal();
  if (reviewStatus === "draft") return <Navigate to={`${portalBase}/team`} replace />;
  return <PortalFrame title="报名审核状态" showNav><StepStrip current={4} /><Panel><div className="mx-auto max-w-2xl py-4 text-center"><StatusTag tone={statusTone(reviewStatus)}>{statusLabel(reviewStatus)}</StatusTag>{reviewStatus === "pending" && <><h2 className="mt-4 text-xl font-semibold text-text-primary">报名已提交，等待学校审核真实性</h2><p className="mt-2 text-sm leading-6 text-text-secondary">审核完成前不会获得赛事工作区权限；队长可以查看状态，但团队信息进入只读。</p><div className="mt-6 grid gap-3 sm:grid-cols-2"><SecondaryButton onClick={() => { rejectReview(); }}>模拟审核未通过</SecondaryButton><Button onClick={() => { approveReview(); }}>模拟审核通过</Button></div></>}{reviewStatus === "rejected" && <><h2 className="mt-4 text-xl font-semibold text-danger-text">报名审核未通过</h2><p className="mt-2 text-sm leading-6 text-text-secondary">{rejectionReason}</p><Button className="mt-6" onClick={() => navigate(`${portalBase}/team`)}>返回团队信息修正</Button></>}{reviewStatus === "approved" && <><h2 className="mt-4 text-xl font-semibold text-success-text">审核通过</h2><p className="mt-2 text-sm leading-6 text-text-secondary">团队主体与成员信息已通过学校审核。继续填写项目承诺书，完成赛事报名材料。</p><Button className="mt-6" onClick={() => navigate(`${portalBase}/commitment`)}>填写承诺书</Button></>}{reviewStatus === "completed" && <><h2 className="mt-4 text-xl font-semibold text-success-text">赛事报名已完成</h2><p className="mt-2 text-sm text-text-secondary">报名材料与承诺书均已完成，可继续查看团队业绩报告与证书状态。</p><Button className="mt-6" onClick={() => navigate(`${portalBase}/complete`)}>查看报名结果</Button></>}</div></Panel></PortalFrame>;
}

function CommitmentPage() {
  const navigate = useNavigate();
  const { reviewStatus, commitment, updateCommitment, generateCommitment, completeRegistration } = useRegistrationPortal();
  if (reviewStatus !== "approved" && reviewStatus !== "completed") return <PortalFrame title="承诺书" showNav><Panel><div className="py-10 text-center"><StatusTag tone="warning">前置条件未满足</StatusTag><p className="mt-3 text-sm text-text-secondary">团队审核通过后才可填写并生成承诺书。</p><SecondaryButton className="mt-5" onClick={() => navigate(`${portalBase}/review`)}>查看审核状态</SecondaryButton></div></Panel></PortalFrame>;
  const complete = () => { completeRegistration(); navigate(`${portalBase}/complete`); };
  return <PortalFrame title="承诺书" showNav><StepStrip current={5} /><div className="space-y-5"><Panel title="项目信息"><div className="space-y-4"><Field label="项目标题" required value={commitment.projectTitle} onChange={projectTitle => updateCommitment({ projectTitle })} placeholder="请输入项目标题" /><TextAreaField label="项目摘要" required value={commitment.projectSummary} onChange={projectSummary => updateCommitment({ projectSummary })} placeholder="请输入项目摘要" /></div></Panel><Panel title="参赛团队承诺与说明书"><div className="space-y-4"><TextAreaField label="主要创新点" value={commitment.innovation} onChange={innovation => updateCommitment({ innovation })} placeholder="50–100字" /><TextAreaField label="主要创意点" value={commitment.creativity} onChange={creativity => updateCommitment({ creativity })} placeholder="100–200字" /><TextAreaField label="主要创业点" value={commitment.entrepreneurship} onChange={entrepreneurship => updateCommitment({ entrepreneurship })} placeholder="200–300字" /><div className="rounded-container bg-surface-subtle p-4 text-sm leading-6 text-text-secondary">我们郑重承诺：已仔细阅读大赛规则，并做如上承诺和必要说明，将严格按照大赛规则参加比赛。若遇争议，服从大赛组织仲裁，如果以上承诺有未做到，我们承担相应的责任。</div><div className="flex flex-wrap gap-3"><SecondaryButton onClick={() => undefined}>保存承诺书</SecondaryButton><Button onClick={generateCommitment}>生成承诺书</Button><SecondaryButton disabled={!commitment.generated}>下载团队承诺书</SecondaryButton><SecondaryButton>下载老师承诺书</SecondaryButton></div>{commitment.generated && <div className="rounded-control border border-success/30 bg-success-bg px-4 py-3 text-sm text-success-text">承诺书已生成，可下载预览并完成报名。</div>}</div></Panel><div className="flex justify-end"><Button disabled={!commitment.generated} onClick={complete}>确认承诺书并完成报名</Button></div></div></PortalFrame>;
}

function CompletePage() {
  const navigate = useNavigate();
  return <PortalFrame title="报名完成" showNav><StepStrip current={6} /><Panel><div className="mx-auto max-w-2xl py-8 text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success-bg text-2xl text-success-text">✓</div><h2 className="mt-4 text-xl font-semibold text-text-primary">完整报名流程已完成</h2><p className="mt-2 text-sm leading-6 text-text-secondary">个人注册、注册答题、团队成员绑定、学校审核与承诺书均已闭环。后续页面属于同一赛事团队门户，但不再改变报名身份。</p><div className="mt-6 grid gap-3 sm:grid-cols-2"><Button onClick={() => navigate(`${portalBase}/team`)}>查看团队信息</Button><SecondaryButton onClick={() => navigate(`${portalBase}/report`)}>团队业绩报告</SecondaryButton><SecondaryButton onClick={() => navigate(`${portalBase}/certificates`)}>查看证书下载</SecondaryButton><SecondaryButton onClick={() => navigate(`${portalBase}/review`)}>查看审核记录</SecondaryButton></div></div></Panel></PortalFrame>;
}

function ReportPage() {
  const { reviewStatus, reportSubmitted, submitReport } = useRegistrationPortal();
  const allowed = reviewStatus === "completed";
  return <PortalFrame title="团队业绩报告" showNav><Panel title="团队业绩报告"><div className="max-w-3xl space-y-5">{!allowed ? <div className="rounded-control border border-warning/30 bg-warning-bg p-4 text-sm text-warning-text">报名完成后开放团队业绩报告。当前页面保留完整后续状态，但不会反向改变报名流程。</div> : <><TextAreaField label="阶段业绩摘要" value="完成校园美妆用户访谈、内容投放与阶段经营复盘，形成首轮可验证经营数据。" onChange={() => undefined} rows={5} /><div className="grid gap-3 sm:grid-cols-[132px_minmax(0,1fr)]"><span className="pt-2 text-sm text-text-secondary">附件材料</span><button className="rounded-control border border-dashed border-primary px-4 py-4 text-left text-sm font-medium text-text-brand">⇧ 上传团队业绩报告 / 数据附件</button></div>{reportSubmitted ? <div className="rounded-control bg-success-bg p-4 text-sm text-success-text">业绩报告已提交，可在截止前更新。</div> : <div className="flex justify-end"><Button onClick={submitReport}>提交团队业绩报告</Button></div>}</>}</div></Panel></PortalFrame>;
}

function CertificatesPage() {
  const { certificateReady, reviewStatus } = useRegistrationPortal();
  const ready = certificateReady && reviewStatus === "completed";
  return <PortalFrame title="证书下载" showNav><Panel><div className="flex items-center justify-between border-b border-border-subtle pb-3"><div className="flex gap-5 text-sm font-medium"><span className="border-b-2 border-primary pb-3 text-text-brand">校赛 {ready ? 1 : 0}</span><span className="pb-3 text-text-secondary">省赛 0</span></div><SecondaryButton>刷新</SecondaryButton></div>{ready ? <div className="mt-5 rounded-container border border-border-subtle p-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><StatusTag tone="success">可下载</StatusTag><h2 className="mt-3 text-lg font-semibold text-text-primary">第十六届三创赛 · 校赛参赛证书</h2><p className="mt-1 text-sm text-text-secondary">团队：号外号外爆卖爆卖 · 示例证书状态</p></div><Button>下载证书</Button></div></div> : <div className="py-16 text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-container bg-surface-subtle text-2xl text-text-tertiary">□</div><p className="mt-4 text-sm text-text-tertiary">当前阶段暂无证书</p></div>}</Panel></PortalFrame>;
}

function ClosedPage() {
  return <PortalFrame title="报名已截止"><Panel><div className="mx-auto max-w-xl py-10 text-center"><StatusTag tone="neutral">报名关闭</StatusTag><h2 className="mt-4 text-xl font-semibold text-text-primary">队伍编辑时间已截止</h2><p className="mt-2 text-sm leading-6 text-text-secondary">已提交团队仍可查看报名资料与审核结果，但不能继续新增成员或修改团队核心信息。如有疑问请联系管理员。</p><SecondaryButton className="mt-6" onClick={() => undefined}>联系管理员</SecondaryButton></div></Panel></PortalFrame>;
}

function ScenarioDock() {
  const navigate = useNavigate();
  const { loadScenario } = useRegistrationPortal();
  const scenarios = [
    ["leaderDraft", "队长草稿", `${portalBase}/team`],
    ["memberWaiting", "队员等待", `${portalBase}/member-waiting`],
    ["pending", "待审核", `${portalBase}/review`],
    ["rejected", "审核驳回", `${portalBase}/review`],
    ["approved", "审核通过", `${portalBase}/commitment`],
    ["completed", "报名完成", `${portalBase}/complete`],
    ["closed", "报名截止", `${portalBase}/closed`],
  ] as const;
  return <details className="fixed bottom-3 right-3 z-50 max-w-[calc(100vw-24px)] rounded-container border border-border-subtle bg-surface p-2 text-xs shadow-floating"><summary className="cursor-pointer px-2 py-1 font-medium text-text-secondary">报名原型状态</summary><div className="mt-2 grid grid-cols-2 gap-1 sm:grid-cols-3">{scenarios.map(([scenario, label, to]) => <button key={scenario} className="min-h-8 rounded-control px-2 text-text-brand hover:bg-primary-container" onClick={() => { loadScenario(scenario); navigate(to); }}>{label}</button>)}</div></details>;
}

export function RegistrationPortal() {
  return <RegistrationPortalProvider><Routes>
    <Route index element={<Navigate to="start" replace />} />
    <Route path="start" element={<StartPage />} />
    <Route path="account" element={<AccountPage />} />
    <Route path="quiz" element={<QuizPage />} />
    <Route path="registration-success" element={<RegistrationSuccessPage />} />
    <Route path="member-waiting" element={<MemberWaitingPage />} />
    <Route path="team" element={<TeamPage />} />
    <Route path="members" element={<AddMembersPage />} />
    <Route path="review" element={<ReviewPage />} />
    <Route path="commitment" element={<CommitmentPage />} />
    <Route path="complete" element={<CompletePage />} />
    <Route path="report" element={<ReportPage />} />
    <Route path="certificates" element={<CertificatesPage />} />
    <Route path="closed" element={<ClosedPage />} />
    <Route path="*" element={<Navigate to="start" replace />} />
  </Routes></RegistrationPortalProvider>;
}
