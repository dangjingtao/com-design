import { Link, useLocation, useParams } from "react-router-dom";
import type { RouteDefinition } from "../routes/registry";

export function RouteProbe({ route }: { route: RouteDefinition }) {
  const location = useLocation();
  const params = useParams();
  return (
    <main className="mx-auto min-h-dvh max-w-md bg-[var(--color-background)] px-4 py-6 text-[var(--color-text-primary)]">
      <div className="mb-6 text-sm text-[var(--color-text-secondary)]">T01 route probe · no product UI yet</div>
      <h1 className="text-xl font-semibold">{route.purpose}</h1>
      <dl className="mt-5 grid grid-cols-[96px_1fr] gap-x-3 gap-y-2 text-sm">
        <dt className="text-[var(--color-text-secondary)]">Route ID</dt><dd>{route.id}</dd>
        <dt className="text-[var(--color-text-secondary)]">Path</dt><dd className="break-all">{location.pathname}</dd>
        <dt className="text-[var(--color-text-secondary)]">Context</dt><dd>{route.context}</dd>
        <dt className="text-[var(--color-text-secondary)]">Params</dt><dd>{JSON.stringify(params)}</dd>
        <dt className="text-[var(--color-text-secondary)]">States</dt><dd>{route.states.join(" / ")}</dd>
      </dl>
      <div className="mt-8 flex gap-3">
        <Link className="min-h-11 rounded-lg border border-[var(--color-border)] px-4 py-3 text-sm" to="/dev/routes">路由总表</Link>
        <Link className="min-h-11 rounded-lg bg-[var(--color-primary)] px-4 py-3 text-sm text-white" to="/home">回首页探针</Link>
      </div>
    </main>
  );
}
