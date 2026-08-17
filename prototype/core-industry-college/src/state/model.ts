export type ViewState = "ready" | "loading" | "empty" | "error" | "permission" | "disabled" | "expired" | "success";
export type CompetitionStatus = "upcoming" | "registrationOpen" | "inProgress" | "ended";
export type IdentityStatus = "none" | "pending" | "active" | "rejected" | "revoked";
export type RegistrationStatus = "notStarted" | "externalInProgress" | "submitted" | "pending" | "approved" | "rejected" | "failed";
export type TaskRunStatus = "draft" | "ready" | "queued" | "running" | "failed" | "completed";
export type ApplicationStatus = "notSubmitted" | "submitting" | "submitted" | "statusUnknown" | "failed";

export type PrototypeState = {
  session: { loggedIn: boolean; profileComplete: boolean };
  competition: {
    currentCompetitionId?: string;
    status: CompetitionStatus;
    identity: IdentityStatus;
    registration: RegistrationStatus;
  };
  workshop: { currentTaskId?: string; taskRun: TaskRunStatus };
  application: { currentOpportunityId?: string; status: ApplicationStatus };
  view: ViewState;
};
