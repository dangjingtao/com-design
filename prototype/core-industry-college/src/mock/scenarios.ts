import type { PrototypeState } from "../state/model";

const noCompetitionContext = { permissions: [] as string[] };

export const scenarios = {
  guest: {
    session: { loggedIn: false, profileComplete: false },
    competitions: { identities: [] },
    competitionContext: noCompetitionContext,
    workshop: { taskRun: "draft" },
    application: { status: "notSubmitted" },
    view: "ready",
  },
  newUser: {
    session: { loggedIn: true, profileComplete: true },
    competitions: { identities: [] },
    competitionContext: noCompetitionContext,
    workshop: { taskRun: "draft" },
    application: { status: "notSubmitted" },
    view: "ready",
  },
  registrationPending: {
    session: { loggedIn: true, profileComplete: true },
    competitions: {
      identities: [
        { competitionId: "sanchuang-16", competitionStatus: "registrationOpen", identityStatus: "pending", registrationStatus: "pending" },
      ],
    },
    competitionContext: { currentCompetitionId: "sanchuang-16", permissions: [] },
    workshop: { taskRun: "draft" },
    application: { status: "notSubmitted" },
    view: "ready",
  },
  competitionActive: {
    session: { loggedIn: true, profileComplete: true },
    competitions: {
      identities: [
        { competitionId: "sanchuang-16", competitionStatus: "registrationOpen", identityStatus: "active", registrationStatus: "approved" },
      ],
    },
    competitionContext: { currentCompetitionId: "sanchuang-16", teamId: "team-1", permissions: ["workspace:read", "workshop:use"] },
    workshop: { taskRun: "ready" },
    application: { status: "notSubmitted" },
    view: "ready",
  },
  workshopTaskRunning: {
    session: { loggedIn: true, profileComplete: true },
    competitions: {
      identities: [
        { competitionId: "sanchuang-16", competitionStatus: "registrationOpen", identityStatus: "active", registrationStatus: "approved" },
      ],
    },
    competitionContext: { currentCompetitionId: "sanchuang-16", teamId: "team-1", permissions: ["workspace:read", "workshop:use"] },
    workshop: { currentTaskId: "task-1", taskRun: "running" },
    application: { status: "notSubmitted" },
    view: "ready",
  },
  competitionEnded: {
    session: { loggedIn: true, profileComplete: true },
    competitions: {
      identities: [
        { competitionId: "sanchuang-15", competitionStatus: "ended", identityStatus: "revoked", registrationStatus: "approved" },
      ],
    },
    competitionContext: { currentCompetitionId: "sanchuang-15", permissions: ["workspace:history:read"] },
    workshop: { taskRun: "completed" },
    application: { status: "statusUnknown" },
    view: "ready",
  },
  multiCompetitionAccount: {
    session: { loggedIn: true, profileComplete: true },
    competitions: {
      identities: [
        { competitionId: "sanchuang-16", competitionStatus: "registrationOpen", identityStatus: "active", registrationStatus: "approved" },
        { competitionId: "innovation-cup-2026", competitionStatus: "upcoming", identityStatus: "pending", registrationStatus: "pending" },
        { competitionId: "sanchuang-15", competitionStatus: "ended", identityStatus: "revoked", registrationStatus: "approved" },
      ],
    },
    competitionContext: { currentCompetitionId: "sanchuang-16", teamId: "team-1", permissions: ["workspace:read", "workshop:use"] },
    workshop: { taskRun: "ready" },
    application: { status: "notSubmitted" },
    view: "ready",
  },
  applicationSubmitted: {
    session: { loggedIn: true, profileComplete: true },
    competitions: { identities: [] },
    competitionContext: noCompetitionContext,
    workshop: { taskRun: "draft" },
    application: { currentOpportunityId: "intern-1", status: "submitted" },
    view: "ready",
  },
  errorNetwork: {
    session: { loggedIn: true, profileComplete: true },
    competitions: { identities: [] },
    competitionContext: noCompetitionContext,
    workshop: { taskRun: "draft" },
    application: { status: "notSubmitted" },
    view: "error",
  },
  emptyData: {
    session: { loggedIn: true, profileComplete: true },
    competitions: { identities: [] },
    competitionContext: noCompetitionContext,
    workshop: { taskRun: "draft" },
    application: { status: "notSubmitted" },
    view: "empty",
  },
  permissionDenied: {
    session: { loggedIn: true, profileComplete: true },
    competitions: { identities: [] },
    competitionContext: { currentCompetitionId: "sanchuang-16", permissions: [] },
    workshop: { taskRun: "draft" },
    application: { status: "notSubmitted" },
    view: "permission",
  },
} satisfies Record<string, PrototypeState>;
