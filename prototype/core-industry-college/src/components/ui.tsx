import type { ButtonHTMLAttributes, ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

export function Button({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`min-h-touch rounded-control bg-primary px-4 text-sm font-medium text-on-primary transition active:bg-primary-pressed disabled:cursor-not-allowed disabled:bg-border-subtle disabled:text-text-tertiary ${className}`} {...props} />;
}

export function SecondaryButton({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`min-h-touch rounded-control bg-primary-container px-4 text-sm font-medium text-text-brand transition active:bg-surface-pressed ${className}`} {...props} />;
}

export function GhostButton({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`min-h-touch rounded-control px-3 text-sm font-medium text-text-brand transition active:bg-surface-pressed ${className}`} {...props} />;
}

export function Card({ children, className = "", interactive = false }: { children: ReactNode; className?: string; interactive?: boolean }) {
  return <div className={`rounded-container bg-surface p-3 ${interactive ? "border border-border-subtle transition hover:bg-surface-subtle" : ""} ${className}`}>{children}</div>;
}

export function Section({ title, action, children, className = "" }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`space-y-3 ${className}`}>
      {(title || action) && <div className="flex min-h-6 items-center justify-between gap-3"><h2 className="text-base font-semibold text-text-primary">{title}</h2>{action}</div>}
      {children}
    </section>
  );
}

export function StatusTag({ tone = "info", children }: { tone?: "info" | "success" | "warning" | "danger" | "neutral"; children: ReactNode }) {
  const toneClass = tone === "success" ? "bg-success-bg text-success-text" : tone === "warning" ? "bg-warning-bg text-warning-text" : tone === "danger" ? "bg-danger-bg text-danger-text" : tone === "neutral" ? "bg-surface-subtle text-text-secondary" : "bg-info-bg text-info-text";
  return <span className={`inline-flex min-h-6 items-center rounded-full px-2 text-xs font-medium ${toneClass}`}>{children}</span>;
}

export function PageHeader({ title, subtitle, backTo }: { title: string; subtitle?: string; backTo?: string }) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-20 border-b border-border-subtle bg-surface">
      <div className="mx-auto flex min-h-12 w-full max-w-md items-center gap-3 px-4">
        {backTo && <button aria-label="返回" className="flex min-h-touch min-w-11 items-center justify-center rounded-control text-xl text-text-primary active:bg-surface-pressed" onClick={() => navigate(backTo)}>‹</button>}
        <div className="min-w-0 flex-1 py-2"><h1 className="truncate text-lg font-semibold text-text-primary">{title}</h1>{subtitle && <p className="truncate text-xs text-text-secondary">{subtitle}</p>}</div>
      </div>
    </header>
  );
}

const navItems = [
  { label: "首页", to: "/home" },
  { label: "赛事", to: "/competitions" },
  { label: "机会", to: "/opportunities" },
  { label: "我的", to: "/me" },
];

export function PublicShell({ children, showNavigation = true }: { children: ReactNode; showNavigation?: boolean }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className={`mx-auto w-full max-w-md ${showNavigation ? "pb-24" : "pb-8"}`}>{children}</main>
      {showNavigation && <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto flex min-h-14 max-w-md border-t border-border-subtle bg-surface px-2 pb-[env(safe-area-inset-bottom)]">
        {navItems.map(item => <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex min-h-touch flex-1 flex-col items-center justify-center gap-1 text-xs font-medium ${isActive ? "text-text-brand" : "text-text-tertiary"}`}><span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />{item.label}</NavLink>)}
      </nav>}
    </div>
  );
}

export function StateBlock({ state, onRetry }: { state: "loading" | "empty" | "error"; onRetry?: () => void }) {
  if (state === "loading") return <div className="space-y-3 py-4">{[1,2,3].map(i => <div key={i} className="h-24 animate-pulse rounded-container bg-surface-subtle" />)}</div>;
  if (state === "empty") return <Card className="py-8 text-center"><p className="text-base font-semibold text-text-primary">暂时没有内容</p><p className="mt-2 text-sm text-text-secondary">调整筛选条件，或稍后再看。</p></Card>;
  return <Card className="border border-danger bg-danger-bg py-6 text-center"><p className="text-base font-semibold text-danger-text">加载失败</p><p className="mt-2 text-sm text-danger-text">网络状态异常，请重新加载。</p>{onRetry && <Button className="mt-4" onClick={onRetry}>重新加载</Button>}</Card>;
}

export function PrototypeStateTools() {
  const location = useLocation();
  const navigate = useNavigate();
  const set = (state?: string) => {
    const next = new URLSearchParams(location.search);
    state ? next.set("view", state) : next.delete("view");
    const query = next.toString();
    navigate(`${location.pathname}${query ? `?${query}` : ""}`);
  };
  return <details className="fixed bottom-20 right-3 z-40 rounded-control border border-border-subtle bg-surface p-2 text-xs shadow-floating"><summary className="cursor-pointer font-medium text-text-secondary">原型状态</summary><div className="mt-2 grid grid-cols-2 gap-1">{[undefined,"loading","empty","error"].map(v => <button key={v ?? "ready"} className="min-h-8 rounded-control px-2 text-text-brand active:bg-surface-pressed" onClick={() => set(v)}>{v ?? "ready"}</button>)}</div></details>;
}
