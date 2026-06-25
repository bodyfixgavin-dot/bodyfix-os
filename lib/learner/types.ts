export type ReadingStage = "initial" | "cross_read" | "reread" | "practice";
export type PracticeBoundaryStatus = "unexplored" | "observing" | "guided" | "verified" | "out_of_scope";

export type BodyTextCase = {
  id: string;
  title: string;
  summary: string;
  status: string;
  href?: string;
};

export type ReadingLens = {
  name: string;
  question: string;
};

export type ReadPosition = {
  index: number;
  name: string;
  question: string;
  stage: "READ" | "RESET" | "RECONNECT" | "RETURN";
};

export type CrossReadPrompt = {
  text: string;
};

export type EvidenceEntry = {
  label: string;
  note: string;
};

export type CapabilityNode = {
  name: string;
  status: PracticeBoundaryStatus;
  note: string;
};
