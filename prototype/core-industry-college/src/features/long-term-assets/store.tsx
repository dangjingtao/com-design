import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { usePublicPlatform } from "../public-platform/PublicPlatform";
import { benefitById, benefits, courses, initialCertificates, initialCompetitionResults, type BenefitStatus, type CertificateRecord, type CompetitionResultRecord } from "./data";

export type LearningStatus = "notStarted" | "inProgress" | "completed";
export type LearningRecord = {
  courseId: string;
  status: LearningStatus;
  progress: number;
  assessment: "idle" | "passed" | "failed";
};

export type ResumePresentation = {
  selectedFactKeys: string[];
  strengths: string;
  education: string;
  updatedAt: string;
};

export type ProfileState = {
  name: string;
  school: string;
  major: string;
  city: string;
  email: string;
};

type LongTermAssetsContextValue = {
  learning: LearningRecord[];
  benefitStatuses: Record<string, BenefitStatus>;
  benefitStatusFor: (benefitId: string) => BenefitStatus;
  certificates: CertificateRecord[];
  competitionResults: CompetitionResultRecord[];
  resume: ResumePresentation;
  profile: ProfileState;
  learningFor: (courseId: string) => LearningRecord;
  startCourse: (courseId: string) => void;
  advanceCourse: (courseId: string) => void;
  completeCourse: (courseId: string) => void;
  submitAssessment: (courseId: string, passed: boolean) => void;
  claimBenefit: (benefitId: string) => void;
  useBenefit: (benefitId: string) => void;
  claimCertificate: (certificateId: string) => void;
  toggleResumeFact: (factKey: string) => void;
  updateStrengths: (value: string) => void;
  updateEducation: (value: string) => void;
  updateProfile: (patch: Partial<ProfileState>) => void;
};

const seedLearning: LearningRecord[] = [
  { courseId: "data-analytics", status: "completed", progress: 100, assessment: "passed" },
  { courseId: "brand-ecommerce", status: "inProgress", progress: 38, assessment: "idle" },
  { courseId: "retail-project-lab", status: "notStarted", progress: 0, assessment: "idle" },
];

const seedResume: ResumePresentation = {
  selectedFactKeys: ["experience:sanchuang-15", "certificate:cert-sanchuang-15", "learning:data-analytics"],
  strengths: "有真实赛事项目协作、内容运营和数据复盘经历，习惯把结论落到可验证的行动。",
  education: "华南商贸学院 · 电子商务 · 本科",
  updatedAt: "2026-08-17",
};

const seedProfile: ProfileState = {
  name: "林晓",
  school: "华南商贸学院",
  major: "电子商务",
  city: "广州",
  email: "linxiao@example.edu.cn",
};

const LongTermAssetsContext = createContext<LongTermAssetsContextValue | null>(null);

function updateLearning(records: LearningRecord[], courseId: string, updater: (record: LearningRecord) => LearningRecord) {
  const existing = records.find(record => record.courseId === courseId) ?? { courseId, status: "notStarted" as LearningStatus, progress: 0, assessment: "idle" as const };
  return records.some(record => record.courseId === courseId)
    ? records.map(record => record.courseId === courseId ? updater(record) : record)
    : [...records, updater(existing)];
}

export function LongTermAssetsProvider({ children }: { children: ReactNode }) {
  const { session, identities } = usePublicPlatform();
  const [learning, setLearning] = useState<LearningRecord[]>(seedLearning);
  const [benefitStatuses, setBenefitStatuses] = useState<Record<string, BenefitStatus>>(() => Object.fromEntries(benefits.map(item => [item.id, item.initialStatus])));
  const [certificates, setCertificates] = useState<CertificateRecord[]>(initialCertificates);
  const [competitionResults] = useState<CompetitionResultRecord[]>(initialCompetitionResults);
  const [resume, setResume] = useState<ResumePresentation>(seedResume);
  const [profile, setProfile] = useState<ProfileState>(seedProfile);

  const benefitStatusFor = useCallback((benefitId: string): BenefitStatus => {
    const benefit = benefitById(benefitId);
    if (!benefit) return "ineligible";
    const stored = benefitStatuses[benefitId] ?? benefit.initialStatus;
    if (stored === "claimed" || stored === "used" || stored === "expired") return stored;
    if (!benefit.requiresCompetitionId) return stored;
    const eligibleFromSharedIdentity = session.loggedIn && identities.some(identity => identity.competitionId === benefit.requiresCompetitionId && identity.identityStatus === "active");
    return eligibleFromSharedIdentity ? stored : "ineligible";
  }, [benefitStatuses, identities, session.loggedIn]);

  const value = useMemo<LongTermAssetsContextValue>(() => ({
    learning,
    benefitStatuses,
    benefitStatusFor,
    certificates,
    competitionResults,
    resume,
    profile,
    learningFor: courseId => learning.find(record => record.courseId === courseId) ?? { courseId, status: "notStarted", progress: 0, assessment: "idle" },
    startCourse: courseId => {
      if (!session.loggedIn) return;
      setLearning(records => updateLearning(records, courseId, record => record.status === "notStarted" ? { ...record, status: "inProgress", progress: 8 } : record));
    },
    advanceCourse: courseId => {
      if (!session.loggedIn) return;
      setLearning(records => updateLearning(records, courseId, record => {
        const nextProgress = Math.min(100, Math.max(record.progress, 8) + 22);
        return { ...record, status: nextProgress >= 100 ? "completed" : "inProgress", progress: nextProgress };
      }));
    },
    completeCourse: courseId => {
      if (!session.loggedIn) return;
      setLearning(records => updateLearning(records, courseId, record => ({ ...record, status: "completed", progress: 100 })));
    },
    submitAssessment: (courseId, passed) => {
      if (!session.loggedIn) return;
      setLearning(records => updateLearning(records, courseId, record => ({ ...record, status: passed ? "completed" : record.status, progress: passed ? 100 : record.progress, assessment: passed ? "passed" : "failed" })));
      if (passed) {
        const course = courses.find(item => item.id === courseId);
        const certificateId = course?.certificateId;
        if (course && certificateId) {
          setCertificates(current => current.some(item => item.id === certificateId)
            ? current
            : [...current, {
              id: certificateId,
              title: `${course.title}课程证书`,
              issuer: "核心产业学院",
              sourceType: "course",
              courseId,
              verificationCode: `COURSE-${courseId.toUpperCase()}-26001`,
              status: "claimable",
            }]);
        }
      }
    },
    claimBenefit: benefitId => {
      if (!session.loggedIn || benefitStatusFor(benefitId) !== "eligible") return;
      setBenefitStatuses(current => ({ ...current, [benefitId]: "claimed" }));
    },
    useBenefit: benefitId => {
      if (!session.loggedIn) return;
      setBenefitStatuses(current => current[benefitId] === "claimed" ? { ...current, [benefitId]: "used" } : current);
    },
    claimCertificate: certificateId => {
      if (!session.loggedIn) return;
      setCertificates(current => current.map(item => item.id === certificateId && item.status === "claimable" ? { ...item, status: "claimed", issuedAt: "2026-08-17" } : item));
    },
    toggleResumeFact: factKey => {
      if (!session.loggedIn) return;
      setResume(current => ({
        ...current,
        selectedFactKeys: current.selectedFactKeys.includes(factKey) ? current.selectedFactKeys.filter(key => key !== factKey) : [...current.selectedFactKeys, factKey],
        updatedAt: "2026-08-17",
      }));
    },
    updateStrengths: strengths => {
      if (!session.loggedIn) return;
      setResume(current => ({ ...current, strengths, updatedAt: "2026-08-17" }));
    },
    updateEducation: education => {
      if (!session.loggedIn) return;
      setResume(current => ({ ...current, education, updatedAt: "2026-08-17" }));
    },
    updateProfile: patch => {
      if (!session.loggedIn) return;
      setProfile(current => ({ ...current, ...patch }));
    },
  }), [learning, benefitStatuses, benefitStatusFor, certificates, competitionResults, resume, profile, session.loggedIn]);

  return <LongTermAssetsContext.Provider value={value}>{children}</LongTermAssetsContext.Provider>;
}

export function useLongTermAssets() {
  const value = useContext(LongTermAssetsContext);
  if (!value) throw new Error("LongTermAssetsProvider missing");
  return value;
}
