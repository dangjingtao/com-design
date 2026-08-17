export type ViewState = "ready" | "loading" | "empty" | "error" | "permission" | "disabled" | "expired" | "success";
export type CompetitionStatus = "upcoming" | "registrationOpen" | "inProgress" | "ended";
export type IdentityStatus = "pending" | "active" | "rejected" | "revoked";
export type RegistrationStatus = "externalInProgress" | "submitted" | "pending" | "approved" | "rejected" | "failed";
export type TaskRunStatus = "draft" | "ready" | "queued" | "running" | "failed" | "completed";
export type ApplicationStatus = "notSubmitted" | "submitting" | "submitted" | "statusUnknown" | "failed";

export type CompetitionIdentityState = {
  competitionId: string;
  competitionStatus: CompetitionStatus;
  identityStatus: IdentityStatus;
  registrationStatus: RegistrationStatus;
};

export type CompetitionAccountState = {
  /** All competition identities attached to the long-lived account. */
  identities: CompetitionIdentityState[];
};

export type CompetitionContextState = {
  /** The workspace currently being visited; it is not the account's only competition. */
  currentCompetitionId?: string;
  teamId?: string;
  permissions: string[];
};

export type PrototypeState = {
  session: { loggedIn: boolean; profileComplete: boolean };
  competitions: CompetitionAccountState;
  competitionContext: CompetitionContextState;
  workshop: { currentTaskId?: string; taskRun: TaskRunStatus };
  application: { currentOpportunityId?: string; status: ApplicationStatus };
  view: ViewState;
};
