import { SERVICES, STAFF_LEVELS } from "./config";
import type { ServiceCode, StaffLevelId } from "./types";

function findStaffLevel(staffLevelId: StaffLevelId) {
  const staffLevel = STAFF_LEVELS.find((item) => item.id === staffLevelId);
  if (!staffLevel) throw new Error(`Unknown staff level: ${staffLevelId}`);
  return staffLevel;
}

function findService(serviceCode: ServiceCode) {
  const service = SERVICES.find((item) => item.serviceCode === serviceCode);
  if (!service) throw new Error(`Unknown service code: ${serviceCode}`);
  return service;
}

export function getStaffRank(staffLevelId: StaffLevelId): number {
  return findStaffLevel(staffLevelId).rank;
}

export function canOperateService(staffLevelId: StaffLevelId, serviceCode: ServiceCode): boolean {
  const staffLevel = findStaffLevel(staffLevelId);
  const service = findService(serviceCode);

  if (service.status !== "active") return false;
  if (service.serviceCode === "grooming_interest") return false;
  if (service.minimumStaffLevelId === "CASE_BY_CASE") return false;

  if (service.minimumStaffLevelId === "GAVIN_ONLY") {
    return staffLevelId === "GAVIN_ONLY" && staffLevel.canOperateServiceCodes.includes(serviceCode);
  }

  const staffRank = getStaffRank(staffLevelId);
  const requiredRank = getStaffRank(service.minimumStaffLevelId);

  return staffRank >= requiredRank && staffLevel.canOperateServiceCodes.includes(serviceCode);
}

export function listAllowedServices(staffLevelId: StaffLevelId): ServiceCode[] {
  return SERVICES.filter((service) => canOperateService(staffLevelId, service.serviceCode)).map(
    (service) => service.serviceCode,
  );
}

export function assertCanOperateService(staffLevelId: StaffLevelId, serviceCode: ServiceCode): void {
  if (!canOperateService(staffLevelId, serviceCode)) {
    throw new Error(`Staff level '${staffLevelId}' is not allowed to operate service '${serviceCode}'.`);
  }
}
