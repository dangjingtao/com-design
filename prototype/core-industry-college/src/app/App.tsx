import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { RouteProbe } from "./RouteProbe";
import { RouteLab } from "../dev/RouteLab";
import { routeDefinitions } from "../routes/registry";
import {
  ApplicationsPage,
  CompaniesPage,
  CompanyDetailPage,
  CompetitionsPage,
  HomePage,
  LoginBoundaryPage,
  OpportunitiesPage,
  OpportunityDetailPage,
  PublicPlatformProvider,
} from "../features/public-platform/PublicPlatform";
import {
  CompetitionLifecycleDetailPage,
  CompetitionResourceDetailPage,
  CompetitionResourcesPage,
  CompetitionTeamPage,
  CompetitionWorkspacePage,
  MyCompetitionsLifecyclePage,
  RegistrationLifecyclePage,
} from "../features/competition-workspace/WorkspacePages";
import {
  WorkshopComputePage,
  WorkshopHomePage,
  WorkshopProjectPage,
  WorkshopResultDetailPage,
  WorkshopResultsPage,
  WorkshopSkillPage,
  WorkshopSkillsPage,
} from "../features/competition-workspace/WorkshopPages";
import { TaskAnswerPage, TaskProgressPage, TaskReviewPage } from "../features/competition-workspace/TaskRuntimePages";
import { WorkshopRuntimeProvider } from "../features/competition-workspace/runtime";
import { LongTermAssetsProvider } from "../features/long-term-assets/store";
import { AccountRequired } from "../features/long-term-assets/shared";
import { CourseAchievementPage, CourseAssessmentPage, CourseDetailPage, CourseLearnPage, CoursesPage } from "../features/long-term-assets/CoursesPages";
import { BenefitDetailPage, BenefitsPage, BenefitsWalletPage } from "../features/long-term-assets/BenefitsPages";
import {
  AssetsHomePage,
  CertificateDetailPage,
  CertificatesPage,
  ExperienceDetailPage,
  ExperiencesPage,
  LearningAssetsPage,
  MyPage,
  ResultDetailPage,
  ResultsPage,
  VerificationPage,
} from "../features/long-term-assets/AssetsPages";
import { ProfilePage, ResumeEducationPage, ResumePage, ResumeStrengthsPage } from "../features/long-term-assets/ResumePages";

const implementedRouteIds = new Set([
  "auth.login",
  "home",
  "competitions.list",
  "competitions.mine",
  "competitions.detail",
  "competitions.registration",
  "competition.workspace",
  "competition.team",
  "competition.resources",
  "competition.resource",
  "workshop.home",
  "workshop.project",
  "workshop.compute",
  "workshop.skills",
  "workshop.skill",
  "workshop.task.answer",
  "workshop.task.review",
  "workshop.task.progress",
  "workshop.results",
  "workshop.result",
  "opportunities.list",
  "opportunities.detail",
  "applications.list",
  "companies.list",
  "companies.detail",
  "courses.list",
  "courses.detail",
  "courses.learn",
  "courses.assessment",
  "courses.achievement",
  "benefits.list",
  "benefits.detail",
  "benefits.wallet",
  "assets.home",
  "assets.experiences",
  "assets.experience",
  "assets.learning",
  "assets.results",
  "assets.result",
  "assets.certificates",
  "assets.certificate",
  "assets.verification",
  "me.home",
  "me.profile",
  "me.resume",
  "me.resume.strengths",
  "me.resume.education",
]);

const account = (page: ReactNode) => <AccountRequired>{page}</AccountRequired>;

export function App() {
  return (
    <PublicPlatformProvider>
      <WorkshopRuntimeProvider>
        <LongTermAssetsProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/dev/routes" element={<RouteLab />} />
            <Route path="/auth/login" element={<LoginBoundaryPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/competitions" element={<CompetitionsPage />} />
            <Route path="/competitions/mine" element={<MyCompetitionsLifecyclePage />} />
            <Route path="/competitions/:competitionId" element={<CompetitionLifecycleDetailPage />} />
            <Route path="/competitions/:competitionId/registration" element={<RegistrationLifecyclePage />} />
            <Route path="/competitions/:competitionId/workspace" element={<CompetitionWorkspacePage />} />
            <Route path="/competitions/:competitionId/workspace/team" element={<CompetitionTeamPage />} />
            <Route path="/competitions/:competitionId/workspace/resources" element={<CompetitionResourcesPage />} />
            <Route path="/competitions/:competitionId/workspace/resources/:resourceId" element={<CompetitionResourceDetailPage />} />
            <Route path="/competitions/:competitionId/workspace/workshop" element={<WorkshopHomePage />} />
            <Route path="/competitions/:competitionId/workspace/workshop/project" element={<WorkshopProjectPage />} />
            <Route path="/competitions/:competitionId/workspace/workshop/compute" element={<WorkshopComputePage />} />
            <Route path="/competitions/:competitionId/workspace/workshop/skills" element={<WorkshopSkillsPage />} />
            <Route path="/competitions/:competitionId/workspace/workshop/skills/:skillId" element={<WorkshopSkillPage />} />
            <Route path="/competitions/:competitionId/workspace/workshop/tasks/:taskId/answer" element={<TaskAnswerPage />} />
            <Route path="/competitions/:competitionId/workspace/workshop/tasks/:taskId/review" element={<TaskReviewPage />} />
            <Route path="/competitions/:competitionId/workspace/workshop/tasks/:taskId/progress" element={<TaskProgressPage />} />
            <Route path="/competitions/:competitionId/workspace/workshop/results" element={<WorkshopResultsPage />} />
            <Route path="/competitions/:competitionId/workspace/workshop/results/:resultId" element={<WorkshopResultDetailPage />} />
            <Route path="/opportunities" element={<OpportunitiesPage />} />
            <Route path="/opportunities/:opportunityId" element={<OpportunityDetailPage />} />
            <Route path="/applications" element={<ApplicationsPage />} />
            <Route path="/companies" element={<CompaniesPage />} />
            <Route path="/companies/:companyId" element={<CompanyDetailPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:courseId" element={<CourseDetailPage />} />
            <Route path="/courses/:courseId/learn" element={account(<CourseLearnPage />)} />
            <Route path="/courses/:courseId/assessment" element={account(<CourseAssessmentPage />)} />
            <Route path="/courses/:courseId/achievement" element={account(<CourseAchievementPage />)} />
            <Route path="/benefits" element={<BenefitsPage />} />
            <Route path="/benefits/wallet" element={account(<BenefitsWalletPage />)} />
            <Route path="/benefits/:benefitId" element={<BenefitDetailPage />} />
            <Route path="/assets" element={account(<AssetsHomePage />)} />
            <Route path="/assets/experiences" element={account(<ExperiencesPage />)} />
            <Route path="/assets/experiences/:experienceId" element={account(<ExperienceDetailPage />)} />
            <Route path="/assets/learning" element={account(<LearningAssetsPage />)} />
            <Route path="/assets/results" element={account(<ResultsPage />)} />
            <Route path="/assets/results/:resultId" element={account(<ResultDetailPage />)} />
            <Route path="/assets/certificates" element={account(<CertificatesPage />)} />
            <Route path="/assets/certificates/:certificateId" element={account(<CertificateDetailPage />)} />
            <Route path="/assets/verification" element={account(<VerificationPage />)} />
            <Route path="/me" element={account(<MyPage />)} />
            <Route path="/me/profile" element={account(<ProfilePage />)} />
            <Route path="/me/resume" element={account(<ResumePage />)} />
            <Route path="/me/resume/strengths" element={account(<ResumeStrengthsPage />)} />
            <Route path="/me/resume/education" element={account(<ResumeEducationPage />)} />
            {routeDefinitions.filter(route => !implementedRouteIds.has(route.id)).map(route => (
              <Route key={route.id} path={route.path} element={<RouteProbe route={route} />} />
            ))}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </LongTermAssetsProvider>
      </WorkshopRuntimeProvider>
    </PublicPlatformProvider>
  );
}
