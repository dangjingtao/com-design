import { Link } from "react-router-dom";
import { candidatePrimaryNavigation, routeDefinitions } from "../routes/registry";

const fixtures: Record<string, string> = {
  ":competitionId": "sanchuang-16",
  ":resourceId": "rules",
  ":skillId": "s1",
  ":taskId": "s1-product-score",
  ":resultId": "result-s1-product-score",
  ":opportunityId": "intern-1",
  ":companyId": "northstar-beauty",
  ":contentId": "competition-guide",
  ":courseId": "data-analytics",
  ":benefitId": "benefit-campus-video",
  ":certificateId": "cert-sanchuang-15",
  ":storyId": "team-retail",
  ":notificationId": "notice-registration",
  ":experienceId": "sanchuang-15",
};

const materialize = (path: string) => Object.entries(fixtures).reduce((resolved, [param, value]) => resolved.replace(param, value), path);

export function RouteLab() {
  return <main className="mx-auto max-w-3xl p-6 text-[var(--color-text-primary)]">
    <h1 className="text-2xl font-semibold">Route Lab</h1>
    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">T05 使用当前真实 mock ID 遍历 T01 的 66 条语义路由；业务未决项会进入明确的 decision-blocked 页面，而不是开发探针。</p>
    <section className="mt-6">
      <h2 className="font-semibold">一级导航</h2>
      <div className="mt-3 flex flex-wrap gap-2">{candidatePrimaryNavigation.map(item => <Link key={item.to} className="min-h-touch rounded-control border border-[var(--color-border)] px-3 py-3" to={item.to}>{item.label}</Link>)}</div>
    </section>
    <section className="mt-8">
      <h2 className="font-semibold">全部语义路由</h2>
      <ul className="mt-3 divide-y divide-[var(--color-border)]">{routeDefinitions.map(route => <li key={route.id} className="py-3"><Link to={materialize(route.path)} className="block min-h-touch"><span className="font-medium">{route.purpose}</span><span className="ml-2 text-xs text-[var(--color-text-secondary)]">{route.context}</span><div className="mt-1 break-all text-xs text-[var(--color-text-secondary)]">{route.path}</div></Link></li>)}</ul>
    </section>
  </main>;
}
