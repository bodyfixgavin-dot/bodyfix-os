import { ContentEngineStatus } from "./types";

/**
 * BodyFix Content Engine MVP v0.1 - State Machine
 * Defines valid status transitions for content projects.
 */

const VALID_TRANSITIONS: Record<ContentEngineStatus, ContentEngineStatus[]> = {
  DRAFT: ["REVIEW", "ARCHIVED"],
  REVIEW: ["APPROVED", "DRAFT", "ARCHIVED"],
  APPROVED: ["SCHEDULED", "REVIEW", "ARCHIVED"],
  SCHEDULED: ["PUBLISHED", "APPROVED", "ARCHIVED"],
  PUBLISHED: ["ARCHIVED"],
  ARCHIVED: ["DRAFT"], // Allow restarting from a clean slate
};

export function isValidTransition(
  currentStatus: ContentEngineStatus,
  nextStatus: ContentEngineStatus
): boolean {
  return VALID_TRANSITIONS[currentStatus]?.includes(nextStatus) ?? false;
}

export function getNextPossibleStatuses(
  currentStatus: ContentEngineStatus
): ContentEngineStatus[] {
  return VALID_TRANSITIONS[currentStatus] || [];
}
