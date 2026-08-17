import { Navigate, Route, Routes } from "react-router-dom";
import { RouteProbe } from "./RouteProbe";
import { RouteLab } from "../dev/RouteLab";
import { routeDefinitions } from "../routes/registry";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dev/routes" replace />} />
      <Route path="/dev/routes" element={<RouteLab />} />
      {routeDefinitions.map(route => (
        <Route key={route.id} path={route.path} element={<RouteProbe route={route} />} />
      ))}
      <Route path="*" element={<Navigate to="/dev/routes" replace />} />
    </Routes>
  );
}
