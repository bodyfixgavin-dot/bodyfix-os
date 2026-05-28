import { SERVICES, STAFF_LEVELS } from "./foundation.config";
import type { ServiceId, StaffLevelId } from "./types";
export function getStaffRank(staffLevelId: StaffLevelId): number {
  const level = STAFF_LEVELS.find((item) => item.id === staffLevelId);
  if (!level) throw new Error(`Unknown staff level: ${staffLevelId}`);
  return level.rank;
}
export function canOperateService(staffLevelId: StaffLevelId, serviceId: ServiceId): boolean {
  const staffLevel = STAFF_LEVELS.find((item) => item.id === staffLevelId);
  const service = SERVICES.find((item) => item.id === serviceId);
  if (!staffLevel) throw new Error(`Unknown staff level: ${staffLevelId}`);
  if (!service) throw new Error(`Unknown service: ${serviceId}`);
  if (service.minimumStaffLevelId === "GAVIN_ONLY") return false;
  if (service.minimumStaffLevelId === "CASE_BY_CASE") return false;
  const staffRank = getStaffRank(staffLevelId);
  const requiredRank = getStaffRank(service.minimumStaffLevelId);
  return staffRank >= requiredRank && staffLevel.canOperateServiceIds.includes(serviceId);
}
export function listAllowedServices(staffLevelId: StaffLevelId): ServiceId[] {
  return SERVICES.filter((service) => canOperateService(staffLevelId, service.id)).map((service) => service.id);
}
export function assertCanOperateService(staffLevelId: StaffLevelId, serviceId: ServiceId): void {
  if (!canOperateService(staffLevelId, serviceId)) {
    throw new Error(`Staff level '${staffLevelId}' is not allowed to operate service '${serviceId}'.`);
  }
}
