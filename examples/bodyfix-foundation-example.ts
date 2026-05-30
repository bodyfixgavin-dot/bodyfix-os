import { calculateMonthlyProjection, calculateServiceProfit } from "../src/bodyfix-foundation";

const fasciaChainSingle = calculateServiceProfit({
  serviceCode: "fascia_chain_reset_60",
  customerSource: "bodyfix_official",
  staffLevelId: "L4_FASCIA_LINE_PRACTITIONER",
});

const multiLineSingle = calculateServiceProfit({
  serviceCode: "multi_line_reset_90",
  customerSource: "bodyfix_official",
  staffLevelId: "L5_MULTI_LINE_PRACTITIONER",
});

const pelvicCoreSingle = calculateServiceProfit({
  serviceCode: "pelvic_core_reset_60",
  customerSource: "bodyfix_official",
  staffLevelId: "L6_PELVIC_CORE_PRACTITIONER",
});

const fasciaChainMonthly50 = calculateMonthlyProjection({
  serviceCode: "fascia_chain_reset_60",
  customerSource: "bodyfix_official",
  staffLevelId: "L4_FASCIA_LINE_PRACTITIONER",
  monthlySessions: 50,
  monthlyFixedCostTwd: 10000,
});

const fasciaLineMonthly80 = calculateMonthlyProjection({
  serviceCode: "fascia_line_selected_reset_60",
  customerSource: "bodyfix_official",
  staffLevelId: "L4_FASCIA_LINE_PRACTITIONER",
  monthlySessions: 80,
  monthlyFixedCostTwd: 15000,
});

console.log("fascia_chain_reset_60 single", fasciaChainSingle);
console.log("multi_line_reset_90 single", multiLineSingle);
console.log("pelvic_core_reset_60 single", pelvicCoreSingle);
console.log("fascia_chain_reset_60 monthly x50", fasciaChainMonthly50);
console.log("fascia_line_selected_reset_60 monthly x80", fasciaLineMonthly80);
