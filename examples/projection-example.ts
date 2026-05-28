import { calculateMonthlyProjection, calculateServiceProfit } from "../src/bodyfix";
const singleGrooming = calculateServiceProfit({
  serviceId: "GROOMING_MALE_CARE",
  customerSource: "BODYFIX_OFFICIAL",
  staffLevelId: "L1_GROOMING_SPECIALIST",
  grossRevenueTwd: 2000,
  materialCostTwd: 200,
  adminCostTwd: 100,
});
console.log("Single grooming result:", singleGrooming);
const monthlyGrooming = calculateMonthlyProjection({
  serviceId: "GROOMING_MALE_CARE",
  customerSource: "BODYFIX_OFFICIAL",
  staffLevelId: "L1_GROOMING_SPECIALIST",
  monthlySessions: 80,
  pricePerSessionTwd: 2000,
  materialCostPerSessionTwd: 200,
  adminCostPerSessionTwd: 100,
  monthlyFixedCostTwd: 15000,
});
console.log("Monthly grooming projection:", monthlyGrooming);
