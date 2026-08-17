import { Navigate, Route, Routes } from "react-router-dom";
import { RouteProbe } from "./RouteProbe";
import { RouteLab } from "../dev/RouteLab";
import { routeDefinitions } from "../routes/registry";
import {
  ApplicationsPage,
  CompaniesPage,
  CompanyDetailPage,
  CompetitionDetailPage,
  CompetitionsPage,
  HomePage,
  LoginBoundaryPage,
  MyCompetitionsPage,
  OpportunitiesPage,
  OpportunityDetailPage,
  PublicPlatformProvider,
  RegistrationHandoffPage,
  ResumeBoundaryPage,
  WorkspaceBoundaryPage,
} from "../features/public-platform/PublicPlatform";

const implementedRouteIds = new Set([
  "auth.login",
  "home",
  "competitions.list",
  "competitions.mine",
  "competitions.detail",
  "competitions.registration",
  "competition.workspace",
  "opportunities.list",
  "opportunities.detail",
  "applications.list",
  "companies.list",
  "companies.detail",
  "me.resume",
]);

export function App() {
  return (
    <PublicPlatformProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/dev/routes" element={<RouteLab />} />
        <Route path="/auth/login" element={<LoginBoundaryPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/competitions" element={<CompetitionsPage />} />
        <Route path="/competitions/mine" element={<MyCompetitionsPage />} />
        <Route path="/competitions/:competitionId" element={<CompetitionDetailPage />} />
        <Route path="/competitions/:competitionId/registration" element={<RegistrationHandoffPage />} />
        <Route path="/competitions/:competitionId/workspace" element={<WorkspaceBoundaryPage />} />
        <Route path="/opportunities" element={<OpportunitiesPage />} />
        <Route path="/opportunities/:opportunityId" element={<OpportunityDetailPage />} />
        <Route path="/applications" element={<ApplicationsPage />} />
        <Route path="/companies" element={<CompaniesPage />} />
        <Route path="/companies/:companyId" element={<CompanyDetailPage />} />
        <Route path="/me/resume" element={<ResumeBoundaryPage />} />
        {routeDefinitions.filter(route => !implementedRouteIds.has(route.id)).map(route => (
          <Route key={route.id} path={route.path} element={<RouteProbe route={route} />} />
        ))}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </PublicPlatformProvider>
  );
}
