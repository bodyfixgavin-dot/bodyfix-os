export type FasciaLineNode = {
  code: string;
  nameZh: string;
  nameEn: string;
  aliases: string[];
  legacyCodes?: string[];
  kind: "entry" | "leaf";
};

export const FASCIA_LINE_LEGACY_CODE_MAP = {
  "BF-FL-SPL": "BF-FL-SL",
} as const;

export const FASCIA_LINE_ENTRIES = [
  {
    code: "BF-FL-SBL",
    nameZh: "淺背線",
    nameEn: "Superficial Back Line",
    aliases: ["表淺背線"],
    kind: "entry",
  },
  {
    code: "BF-FL-SFL",
    nameZh: "淺前線",
    nameEn: "Superficial Front Line",
    aliases: ["表淺前線"],
    kind: "entry",
  },
  {
    code: "BF-FL-LL",
    nameZh: "側線",
    nameEn: "Lateral Line",
    aliases: ["體側線"],
    kind: "entry",
  },
  {
    code: "BF-FL-SL",
    nameZh: "螺旋線",
    nameEn: "Spiral Line",
    aliases: [],
    legacyCodes: ["BF-FL-SPL"],
    kind: "entry",
  },
  {
    code: "BF-FL-DFL",
    nameZh: "深前線",
    nameEn: "Deep Front Line",
    aliases: ["前深線"],
    kind: "entry",
  },
  {
    code: "BF-FLG-ARM",
    nameZh: "手臂線群組",
    nameEn: "Arm Lines Group",
    aliases: ["手臂線"],
    kind: "entry",
  },
  {
    code: "BF-FLG-FUNC",
    nameZh: "功能線群組",
    nameEn: "Functional Lines Group",
    aliases: ["功能線"],
    kind: "entry",
  },
] as const satisfies readonly FasciaLineNode[];

export const FASCIA_LINE_LEAVES = [
  ...FASCIA_LINE_ENTRIES.filter((line) => line.code.startsWith("BF-FL-") && !line.code.endsWith("G-ARM") && !line.code.endsWith("G-FUNC")),
  { code: "BF-FL-SBAL", nameZh: "淺背手臂線", nameEn: "Superficial Back Arm Line", aliases: [], kind: "leaf" },
  { code: "BF-FL-DBAL", nameZh: "深背手臂線", nameEn: "Deep Back Arm Line", aliases: [], kind: "leaf" },
  { code: "BF-FL-SFAL", nameZh: "淺前手臂線", nameEn: "Superficial Front Arm Line", aliases: [], kind: "leaf" },
  { code: "BF-FL-DFAL", nameZh: "深前手臂線", nameEn: "Deep Front Arm Line", aliases: [], kind: "leaf" },
  { code: "BF-FL-BFL", nameZh: "後功能線", nameEn: "Back Functional Line", aliases: [], kind: "leaf" },
  { code: "BF-FL-FFL", nameZh: "前功能線", nameEn: "Front Functional Line", aliases: [], kind: "leaf" },
  { code: "BF-FL-IFL", nameZh: "同側功能線", nameEn: "Ipsilateral Functional Line", aliases: [], kind: "leaf" },
] as const satisfies readonly FasciaLineNode[];

const FASCIA_LINE_CODE_MAP = new Map(
  ([...FASCIA_LINE_ENTRIES, ...FASCIA_LINE_LEAVES] as readonly FasciaLineNode[]).flatMap((line) => [
    [line.code, line.code] as const,
    ...(line.legacyCodes ?? []).map((legacyCode) => [legacyCode, line.code] as const),
  ]),
);

export function resolveFasciaLineCode(code: string) {
  return FASCIA_LINE_CODE_MAP.get(code) ?? null;
}
