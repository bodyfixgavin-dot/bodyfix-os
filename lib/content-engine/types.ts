/**
 * BodyFix Content Engine MVP v0.1 - Core Type Definitions
 * Based on BodyFix Content JSON Contract v0.1
 */

export type ContentType =
  | "instagram_carousel"
  | "instagram_reel"
  | "instagram_caption"
  | "story_sequence"
  | "article_outline";

export type SlideRole =
  | "cover"
  | "problem"
  | "mechanism"
  | "example"
  | "self_check"
  | "method"
  | "cta";

export interface ContentSlide {
  page: number;
  role: SlideRole;
  headline: string;
  body: string;
  keyPoint: string;
  visualDirection: string;
  layout: string;
  whitespacePercent: number;
}

export interface ContentPackage {
  schemaVersion: "0.1";
  projectCode: string;
  title: string;
  contentType: ContentType;
  platform: "instagram" | "facebook" | "website" | "line";
  language: "zh-TW";
  aspectRatio: "4:5" | "9:16" | "1:1" | "16:9";
  objective: string;
  audience: string[];
  coreMessage: string;
  hook: string;
  slides: ContentSlide[];
  caption: {
    opening: string;
    body: string;
    cta: string;
  };
  visualSystem: {
    background: string;
    primary: string;
    accent: string;
    illustrationStyle: string;
    minimumWhitespacePercent: number;
    maximumWhitespacePercent: number;
  };
  brandRules: string[];
  safetyChecks: {
    containsPersonalData: boolean;
    containsMedicalClaim: boolean;
    containsUnverifiedEvidence: boolean;
    requiresHumanReview: true;
  };
  sourceNotes: Array<{
    type: "brand_knowledge" | "research" | "case_summary" | "user_input";
    label: string;
    summary: string;
  }>;
  openQuestions: string[];
  approvedVersionId: string;
  generatedAt: string;
}

export type ContentEngineStatus =
  | "DRAFT"
  | "REVIEW"
  | "APPROVED"
  | "SCHEDULED"
  | "PUBLISHED"
  | "ARCHIVED";

export interface ContentProject {
  id: string;
  projectCode: string;
  title: string;
  status: ContentEngineStatus;
  currentVersionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContentVersion {
  id: string;
  projectId: string;
  versionNumber: number;
  content: ContentPackage;
  createdBy: "AI" | "HUMAN";
  createdAt: string;
}

export interface ApprovalLog {
  id: string;
  versionId: string;
  action: "APPROVE_TEXT" | "APPROVE_VISUAL" | "REQUEST_REVISION" | "REJECT";
  comment?: string;
  actor: string;
  createdAt: string;
}

export interface ManusTask {
  id: string;
  externalTaskId?: string;
  versionId: string;
  idempotencyKey: string;
  taskType: string;
  status: "pending" | "submitted" | "completed" | "failed";
  payload: any;
  result?: any;
  createdAt: string;
  updatedAt: string;
}
