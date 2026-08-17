import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, Card, GhostButton, PageHeader, PrototypeStateTools, PublicShell, SecondaryButton, Section, StateBlock, StatusTag } from "../../components/ui";
import { useLongTermAssets } from "../long-term-assets/store";
import { usePublicPlatform } from "../public-platform/PublicPlatform";

type NotificationRecord = { id: string; title: string; body: string; read: boolean; time: string };
type StoryRecord = { id: string; title: string; summary: string; author: string; external?: boolean };
type SupportState = {
  notifications: NotificationRecord[];
  accountBindings: string[];
  submittedStories: StoryRecord[];
  markRead: (id: string) => void;
  markAllRead: () => void;
  toggleBinding: (id: string) => void;
  submitStory: (story: StoryRecord) => void;
};

const seedNotifications: NotificationRecord[] = [
  { id: "notice-registration", title: "三创赛报名状态已更新", body: "你的报名材料已进入学校审核。审核完成后会在“我的赛事”同步身份状态。", read: false, time: "今天 09:20" },
  { id: "notice-course", title: "课程学习记录已保存", body: "商业数据分析基础的学习结果已进入长期学习资产。", read: true, time: "昨天 18:40" },
  { id: "notice-benefit", title: "权益即将到期", body: "一项活动权益将在近期到期，请在权益中心查看有效期。", read: false, time: "8 月 15 日" },
];

const newsItems = [
  { id: "competition-guide", title: "三创赛本阶段报名与校赛安排说明", summary: "集中查看当前报名窗口、学校审核和后续校赛节点。", body: "本阶段以学校审核与团队准备为主。具体时间由学校与赛道安排为准，平台只展示已确认节点。", tag: "赛事" },
  { id: "internship-week", title: "企业实践机会本周更新", summary: "品牌、电商、数据分析与供应链方向新增实践岗位。", body: "本周机会来自平台合作企业。投递前可先整理长期简历中的赛事经历、学习成果和证书。", tag: "机会" },
  { id: "asset-guide", title: "比赛结束后，哪些记录会继续保留？", summary: "赛事经历、成绩、证书与学习成果会沉淀到长期账号。", body: "赛事期权限会随着生命周期结束，但长期账号中的可信事实不会随赛事工作区一起消失。", tag: "平台" },
];

const seedStories: StoryRecord[] = [
  { id: "team-retail", title: "从校赛复盘到零售数据实习", summary: "一个学生团队如何把比赛里的数据复盘经验整理成长期履历。", author: "赛友投稿" },
  { id: "brand-project", title: "第一次和企业真实做项目", summary: "从需求澄清、协作到阶段汇报，一次并不完美但真实的项目实践。", author: "赛友投稿" },
  { id: "wechat-story", title: "公众号精选：三创赛后的下一站", summary: "外部内容镜像入口，保留来源说明。", author: "官方公众号", external: true },
];

const SupportContext = createContext<SupportState | null>(null);

export function SupportProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState(seedNotifications);
  const [accountBindings, setAccountBindings] = useState<string[]>(["email"]);
  const [submittedStories, setSubmittedStories] = useState<StoryRecord[]>([]);
  const value = useMemo<SupportState>(() => ({
    notifications,
    accountBindings,
    submittedStories,
    markRead: id => setNotifications(current => current.map(item => item.id === id ? { ...item, read: true } : item)),
    markAllRead: () => setNotifications(current => current.map(item => ({ ...item, read: true }))),
    toggleBinding: id => setAccountBindings(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]),
    submitStory: story => setSubmittedStories(current => [story, ...current]),
  }), [notifications, accountBindings, submittedStories]);
  return <SupportContext.Provider value={value}>{children}</SupportContext.Provider>;
}

function useSupport() {
  const value = useContext(SupportContext);
  if (!value) throw new Error("SupportProvider missing");
  return value;
}

function useViewState() {
  const { search } = useLocation();
  const value = new URLSearchParams(search).get("view");
  return value === "loading" || value === "empty" || value === "error" ? value : "ready";
}

export function OnboardingProfilePage() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState({ school: "", major: "", city: "" });
  const valid = Boolean(draft.school.trim() && draft.major.trim() && draft.city.trim());
  return <PublicShell showNavigation={false}><PageHeader title="完善基础资料" backTo="/auth/login" /><div className="space-y-5 px-4 py-6"><Card><p className="text-sm leading-5 text-text-secondary">这些信息用于推荐赛事、课程与机会；赛事报名仍以对应赛事确认的信息为准。</p></Card>{(["school","major","city"] as const).map(key => <label key={key} className="block"><span className="text-sm font-medium text-text-primary">{key === "school" ? "学校" : key === "major" ? "专业" : "所在城市"}</span><input value={draft[key]} onChange={event => setDraft(current => ({ ...current, [key]: event.target.value }))} className="mt-2 min-h-touch w-full rounded-control border border-border bg-surface px-3 text-sm outline-none focus:border-primary" /></label>)}<Button className="w-full" disabled={!valid} onClick={() => navigate("/onboarding/survey")}>继续填写偏好</Button></div></PublicShell>;
}

export function OnboardingSurveyPage() {
  const navigate = useNavigate();
  const [focus, setFocus] = useState<string[]>([]);
  const options = ["参赛", "实习 / 就业", "企业项目", "课程成长"];
  const toggle = (value: string) => setFocus(current => current.includes(value) ? current.filter(item => item !== value) : [...current, value]);
  return <PublicShell showNavigation={false}><PageHeader title="你更关注什么" backTo="/onboarding/profile" /><div className="space-y-5 px-4 py-6"><Card><p className="text-sm leading-5 text-text-secondary">用于首屏排序与推荐，不会把账号永久锁成某一种学生类型。</p></Card><div className="grid grid-cols-2 gap-3">{options.map(item => <button key={item} onClick={() => toggle(item)} className={`min-h-touch rounded-control border px-3 py-4 text-left text-sm font-medium ${focus.includes(item) ? "border-primary bg-primary-container text-text-brand" : "border-border bg-surface text-text-primary"}`}>{item}</button>)}</div><Button className="w-full" disabled={!focus.length} onClick={() => navigate("/onboarding/ready")}>完成问卷</Button></div></PublicShell>;
}

export function OnboardingReadyPage() {
  const navigate = useNavigate();
  return <PublicShell showNavigation={false}><PageHeader title="准备好了" /><div className="space-y-5 px-4 py-8"><Card><StatusTag tone="success">资料已完成</StatusTag><h1 className="mt-3 text-lg font-semibold text-text-primary">先从比赛或机会开始</h1><p className="mt-2 text-sm leading-5 text-text-secondary">后续课程、权益和可信成果会作为支撑能力出现，不需要先完成一整套成长任务。</p></Card><Button className="w-full" onClick={() => navigate("/home")}>进入首页</Button></div></PublicShell>;
}

export function NewsPage() {
  const view = useViewState();
  return <PublicShell><PageHeader title="公告与资讯" subtitle="赛事、机会与平台通知" /><div className="space-y-4 px-4 py-5">{view === "ready" ? newsItems.map(item => <Link key={item.id} to={`/news/${item.id}`} className="block"><Card interactive><StatusTag tone="neutral">{item.tag}</StatusTag><h2 className="mt-3 text-base font-semibold text-text-primary">{item.title}</h2><p className="mt-2 text-sm leading-5 text-text-secondary">{item.summary}</p></Card></Link>) : <StateBlock state={view} />}</div><PrototypeStateTools /></PublicShell>;
}

export function NewsDetailPage() {
  const { contentId } = useParams();
  const item = newsItems.find(value => value.id === contentId);
  if (!item) return <PublicShell showNavigation={false}><PageHeader title="内容不存在" backTo="/news" /><div className="px-4 py-6"><StateBlock state="error" /></div></PublicShell>;
  return <PublicShell showNavigation={false}><PageHeader title="公告详情" backTo="/news" /><article className="space-y-5 px-4 py-6"><div><StatusTag tone="neutral">{item.tag}</StatusTag><h1 className="mt-3 text-2xl font-semibold leading-8 text-text-primary">{item.title}</h1><p className="mt-3 text-sm leading-6 text-text-secondary">{item.summary}</p></div><Card><p className="text-base leading-7 text-text-primary">{item.body}</p></Card></article></PublicShell>;
}

export function GrowthScorePage() {
  const { learning } = useLongTermAssets();
  const { applications } = usePublicPlatform();
  const completed = learning.filter(item => item.status === "completed").length;
  const score = 60 + completed * 20 + applications.length * 10;
  return <PublicShell showNavigation={false}><PageHeader title="学力值" backTo="/me" /><div className="space-y-6 px-4 py-5"><Card><p className="text-sm text-text-secondary">当前学力值</p><strong className="mt-2 block text-2xl font-semibold text-text-primary">{score}</strong><p className="mt-2 text-xs leading-5 text-text-secondary">它只用于表达平台内成长记录，不替代赛事成绩、证书或招聘评价。</p></Card><Section title="本期构成"><div className="space-y-2">{[["基础账号",60],["已完成学习",completed * 20],["真实投递",applications.length * 10]].map(([label,value]) => <Card key={String(label)}><div className="flex items-center justify-between text-sm"><span className="text-text-secondary">{label}</span><strong className="text-text-primary">+{value}</strong></div></Card>)}</div></Section></div></PublicShell>;
}

export function StoriesPage() {
  const { submittedStories } = useSupport();
  const view = useViewState();
  const stories = [...submittedStories, ...seedStories];
  return <PublicShell><PageHeader title="赛友风采" subtitle="精选经历，不做开放论坛" /><div className="space-y-5 px-4 py-5"><div className="flex justify-end"><Link to="/stories/submit" className="min-h-touch rounded-control bg-primary-container px-4 py-3 text-sm font-medium text-text-brand">投稿经历</Link></div>{view === "ready" ? stories.map(item => <Link key={item.id} to={`/stories/${item.id}`} className="block"><Card interactive><h2 className="text-base font-semibold text-text-primary">{item.title}</h2><p className="mt-2 text-sm leading-5 text-text-secondary">{item.summary}</p><p className="mt-3 text-xs text-text-tertiary">{item.author}{item.external ? " · 外部内容" : ""}</p></Card></Link>) : <StateBlock state={view} />}</div><PrototypeStateTools /></PublicShell>;
}

export function StoryDetailPage() {
  const { storyId } = useParams();
  const { submittedStories } = useSupport();
  const item = [...submittedStories, ...seedStories].find(value => value.id === storyId);
  if (!item) return <PublicShell showNavigation={false}><PageHeader title="故事不存在" backTo="/stories" /></PublicShell>;
  return <PublicShell showNavigation={false}><PageHeader title="赛友故事" backTo="/stories" /><div className="space-y-5 px-4 py-6"><div><StatusTag tone={item.external ? "info" : "neutral"}>{item.external ? "公众号来源" : "站内投稿"}</StatusTag><h1 className="mt-3 text-2xl font-semibold leading-8 text-text-primary">{item.title}</h1><p className="mt-2 text-sm text-text-secondary">{item.author}</p></div><Card><p className="text-base leading-7 text-text-primary">{item.summary}</p><p className="mt-4 text-sm leading-6 text-text-secondary">中保真原型保留来源与内容边界；正式内容由运营审核后发布。</p></Card></div></PublicShell>;
}

export function StorySubmitPage() {
  const navigate = useNavigate();
  const { submitStory } = useSupport();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const submit = () => {
    submitStory({ id: `submitted-${Date.now()}`, title: title.trim(), summary: summary.trim(), author: "我的投稿" });
    setSubmitted(true);
  };
  return <PublicShell showNavigation={false}><PageHeader title="投稿赛友经历" backTo="/stories" /><div className="space-y-5 px-4 py-5">{submitted ? <Card className="border border-success bg-success-bg"><h1 className="text-lg font-semibold text-success-text">投稿已提交</h1><p className="mt-2 text-sm text-success-text">内容进入运营审核；原型中先保留在本次会话。</p><Button className="mt-4 w-full" onClick={() => navigate("/stories")}>返回赛友风采</Button></Card> : <><label className="block"><span className="text-sm font-medium text-text-primary">标题</span><input value={title} onChange={event => setTitle(event.target.value)} className="mt-2 min-h-touch w-full rounded-control border border-border bg-surface px-3 text-sm outline-none focus:border-primary" /></label><label className="block"><span className="text-sm font-medium text-text-primary">经历摘要</span><textarea rows={7} value={summary} onChange={event => setSummary(event.target.value)} className="mt-2 w-full rounded-control border border-border bg-surface p-3 text-sm leading-6 outline-none focus:border-primary" /></label><Button className="w-full" disabled={!title.trim() || !summary.trim()} onClick={submit}>提交审核</Button></>}</div></PublicShell>;
}

export function SupportHomePage() {
  return <PublicShell><PageHeader title="帮助与客服" subtitle="先自助定位，再进入客服会话" /><div className="space-y-6 px-4 py-5"><Section title="常见问题"><div className="space-y-2">{["报名后为什么还不能进入赛事工作区？","比赛结束后证书和成绩在哪里？","投递使用的是哪一份简历？"].map(item => <Card key={item}><p className="text-sm font-medium text-text-primary">{item}</p></Card>)}</div></Section><Card><h2 className="text-base font-semibold text-text-primary">仍需要帮助</h2><p className="mt-2 text-sm leading-5 text-text-secondary">客服会话会保留 AI 与人工客服的边界，不伪造已经接入人工。</p><Link to="/support/chat" className="mt-4 block min-h-touch rounded-control bg-primary px-4 py-3 text-center text-sm font-medium text-on-primary">进入客服会话</Link></Card></div></PublicShell>;
}

export function SupportChatPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>(["你好，我可以先帮你定位报名、赛事、课程、权益和投递相关问题。"]);
  const [humanRequested, setHumanRequested] = useState(false);
  const send = () => { if (!message.trim()) return; setMessages(current => [...current, message.trim(), "原型客服：已记录你的问题。需要人工处理时可以发起人工请求。"]); setMessage(""); };
  return <PublicShell showNavigation={false}><PageHeader title="客服会话" backTo="/support" /><div className="space-y-5 px-4 py-5"><div className="space-y-2">{messages.map((item,index) => <Card key={`${index}-${item}`}><p className="text-sm leading-6 text-text-primary">{item}</p></Card>)}</div>{humanRequested && <Card className="border border-info bg-info-bg"><StatusTag tone="info">已请求人工</StatusTag><p className="mt-2 text-sm text-info-text">当前原型不伪造企业微信已接通，仅保留请求状态与后续外部承接位置。</p></Card>}<textarea rows={4} value={message} onChange={event => setMessage(event.target.value)} className="w-full rounded-control border border-border bg-surface p-3 text-sm outline-none focus:border-primary" placeholder="描述你的问题" /><div className="grid grid-cols-2 gap-3"><SecondaryButton onClick={() => setHumanRequested(true)} disabled={humanRequested}>{humanRequested ? "已请求人工" : "请求人工客服"}</SecondaryButton><Button disabled={!message.trim()} onClick={send}>发送</Button></div></div></PublicShell>;
}

export function AccountsPage() {
  const { accountBindings, toggleBinding } = useSupport();
  const accounts = [{ id: "email", label: "邮箱" }, { id: "wecom", label: "企业微信" }, { id: "wechat", label: "微信" }];
  return <PublicShell showNavigation={false}><PageHeader title="第三方账号" backTo="/me" /><div className="space-y-4 px-4 py-5">{accounts.map(item => { const bound = accountBindings.includes(item.id); return <Card key={item.id}><div className="flex items-center justify-between gap-3"><div><h2 className="font-semibold text-text-primary">{item.label}</h2><p className="mt-1 text-xs text-text-secondary">{bound ? "已绑定到当前长期账号" : "尚未绑定"}</p></div><StatusTag tone={bound ? "success" : "neutral"}>{bound ? "已绑定" : "未绑定"}</StatusTag></div><SecondaryButton className="mt-4 w-full" onClick={() => toggleBinding(item.id)}>{bound ? "解除绑定（原型）" : "绑定账号（原型）"}</SecondaryButton></Card>; })}</div></PublicShell>;
}

export function SubjectDecisionPage() {
  return <DecisionBlockedPage title="主体管理" decision="D08" body="旧原型中的“主体管理”与长期账号身份、学校/企业主体之间的真实业务关系尚未确认。T05 不用 UI 猜定义；路由保留为明确的产品决策阻塞态。" backTo="/me" />;
}

export function NotificationsPage() {
  const { notifications, markAllRead } = useSupport();
  const [onlyUnread, setOnlyUnread] = useState(false);
  const visible = onlyUnread ? notifications.filter(item => !item.read) : notifications;
  return <PublicShell showNavigation={false}><PageHeader title="通知中心" backTo="/me" /><div className="space-y-5 px-4 py-5"><div className="flex gap-2"><button onClick={() => setOnlyUnread(false)} className={`min-h-touch rounded-control px-3 text-sm font-medium ${!onlyUnread ? "bg-primary-container text-text-brand" : "bg-surface text-text-secondary"}`}>全部</button><button onClick={() => setOnlyUnread(true)} className={`min-h-touch rounded-control px-3 text-sm font-medium ${onlyUnread ? "bg-primary-container text-text-brand" : "bg-surface text-text-secondary"}`}>未读</button><GhostButton className="ml-auto" onClick={markAllRead}>全部已读</GhostButton></div>{visible.length ? visible.map(item => <Link key={item.id} to={`/me/notifications/${item.id}`} className="block"><Card interactive><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-text-primary">{item.title}</h2><p className="mt-2 text-sm leading-5 text-text-secondary">{item.body}</p><p className="mt-3 text-xs text-text-tertiary">{item.time}</p></div>{!item.read && <StatusTag tone="info">未读</StatusTag>}</div></Card></Link>) : <StateBlock state="empty" />}</div></PublicShell>;
}

export function NotificationDetailPage() {
  const { notificationId } = useParams();
  const { notifications, markRead } = useSupport();
  const item = notifications.find(value => value.id === notificationId);
  useEffect(() => { if (notificationId) markRead(notificationId); }, [notificationId, markRead]);
  if (!item) return <PublicShell showNavigation={false}><PageHeader title="通知不存在" backTo="/me/notifications" /></PublicShell>;
  return <PublicShell showNavigation={false}><PageHeader title="通知详情" backTo="/me/notifications" /><div className="space-y-5 px-4 py-6"><div><h1 className="text-lg font-semibold text-text-primary">{item.title}</h1><p className="mt-2 text-xs text-text-tertiary">{item.time}</p></div><Card><p className="text-base leading-7 text-text-primary">{item.body}</p></Card></div></PublicShell>;
}

export function LegalPage({ kind }: { kind: "user" | "privacy" }) {
  const title = kind === "user" ? "用户协议" : "隐私政策";
  return <PublicShell showNavigation={false}><PageHeader title={title} backTo="/me" /><div className="space-y-5 px-4 py-6"><Card><h1 className="text-lg font-semibold text-text-primary">{title}</h1><p className="mt-3 text-sm leading-6 text-text-secondary">本原型仅展示信息架构和阅读入口。正式协议文本必须由业务与法务确认后替换，不在 T05 虚构法律条款。</p></Card></div></PublicShell>;
}

export function AboutPage() {
  return <PublicShell showNavigation={false}><PageHeader title="关于" backTo="/me" /><div className="space-y-5 px-4 py-6"><Card><h1 className="text-lg font-semibold text-text-primary">核心产业学院</h1><p className="mt-3 text-sm leading-6 text-text-secondary">围绕参赛、企业实践与就业/实习建立长期学生账号；课程、权益与可信成果作为支撑能力长期沉淀。</p></Card><Card><p className="text-xs text-text-secondary">Prototype · Com Design consumer</p></Card></div></PublicShell>;
}

export function TasksDecisionPage() {
  return <DecisionBlockedPage title="任务专区" decision="D03" body="平台任务、赛事任务、企业任务与权益任务之间的对象关系仍未确认。这里保留明确的产品决策阻塞态，不把创赛工坊 Task Runtime 误当成全局任务中心。" backTo="/home" />;
}

function DecisionBlockedPage({ title, decision, body, backTo }: { title: string; decision: string; body: string; backTo: string }) {
  return <PublicShell showNavigation={false}><PageHeader title={title} backTo={backTo} /><div className="space-y-5 px-4 py-6"><Card className="border border-warning bg-warning-bg"><StatusTag tone="warning">待产品决策 · {decision}</StatusTag><h1 className="mt-3 text-lg font-semibold text-warning-text">暂不实现产品交互</h1><p className="mt-2 text-sm leading-6 text-warning-text">{body}</p></Card><SecondaryButton className="w-full" onClick={() => window.history.length > 1 ? window.history.back() : window.location.assign(backTo)}>返回上一层</SecondaryButton></div></PublicShell>;
}

export function NotFoundPage() {
  const navigate = useNavigate();
  const location = useLocation();
  return <PublicShell showNavigation={false}><PageHeader title="页面不存在" /><div className="space-y-5 px-4 py-8"><Card className="border border-danger bg-danger-bg"><StatusTag tone="danger">404 / dead-link</StatusTag><h1 className="mt-3 text-lg font-semibold text-danger-text">没有匹配到已登记路由</h1><p className="mt-2 break-all text-sm text-danger-text">{location.pathname}</p></Card><Button className="w-full" onClick={() => navigate("/home", { replace: true })}>返回首页</Button><SecondaryButton className="w-full" onClick={() => navigate("/dev/routes")}>查看路由总表</SecondaryButton></div></PublicShell>;
}
