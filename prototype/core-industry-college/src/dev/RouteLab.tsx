import { Link } from "react-router-dom";
import { candidatePrimaryNavigation, routeDefinitions } from "../routes/registry";

const materialize = (path: string) => path.replace(":competitionId", "sanchuang-16").replace(":resourceId", "rules").replace(":skillId", "s1").replace(":taskId", "task-1").replace(":resultId", "result-1").replace(":opportunityId", "intern-1").replace(":companyId", "company-1").replace(":contentId", "news-1").replace(":courseId", "course-1").replace(":benefitId", "benefit-1").replace(":certificateId", "cert-1").replace(":storyId", "story-1").replace(":notificationId", "notice-1").replace(":experienceId", "experience-1");

export function RouteLab() {
  return <main className="mx-auto max-w-3xl p-6">
    <h1 className="text-2xl font-semibold">T01 Route Lab</h1>
    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">这里只验证语义路由、上下文和状态边界，不提前实现 T02 页面 UI。</p>
    <section className="mt-6">
      <h2 className="font-semibold">候选一级导航</h2>
      <div className="mt-3 flex flex-wrap gap-2">{candidatePrimaryNavigation.map(item => <Link key={item.to} className="rounded-lg border border-[var(--color-border)] px-3 py-2" to={item.to}>{item.label}</Link>)}</div>
    </section>
    <section className="mt-8">
      <h2 className="font-semibold">全部语义路由</h2>
      <ul className="mt-3 divide-y divide-[var(--color-border)]">{routeDefinitions.map(route => <li key={route.id} className="py-3"><Link to={materialize(route.path)} className="block"><span className="font-medium">{route.purpose}</span><span className="ml-2 text-xs text-[var(--color-text-secondary)]">{route.context}</span><div className="mt-1 break-all text-xs text-[var(--color-text-secondary)]">{route.path}</div></Link></li>)}</ul>
    </section>
  </main>;
}
