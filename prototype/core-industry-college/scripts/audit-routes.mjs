import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const registry = read("src/routes/registry.ts");
const app = read("src/app/App.tsx");

const registryPaths = [...registry.matchAll(/\{\s*id:\s*"[^"]+",\s*path:\s*"([^"]+)"/g)].map(match => match[1]);
const appPaths = new Set([...app.matchAll(/<Route\s+path="([^"]+)"/g)].map(match => match[1]));
const missing = registryPaths.filter(routePath => !appPaths.has(routePath));
const usesRouteProbe = /RouteProbe/.test(app);
const explicitNotFound = /path="\*"\s+element=\{<NotFoundPage\s*\/>\}/.test(app);

console.log(`Registry routes: ${registryPaths.length}`);
console.log(`App route declarations: ${appPaths.size}`);
console.log(`Missing registry routes: ${missing.length}`);
if (missing.length) missing.forEach(routePath => console.log(`  - ${routePath}`));
console.log(`RouteProbe in App: ${usesRouteProbe ? "yes" : "no"}`);
console.log(`Explicit 404 route: ${explicitNotFound ? "yes" : "no"}`);

if (missing.length || usesRouteProbe || !explicitNotFound) {
  process.exitCode = 1;
} else {
  console.log("Route audit PASS");
}
