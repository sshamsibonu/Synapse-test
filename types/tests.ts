import type * as React from "react";

import type { DomainScores } from "@/types/database";

export interface TestEngineResult {
  rawMetrics: Record<string, unknown>;
  domainScores: DomainScores;
}

export interface TestEngineProps {
  mode: "practice" | "real";
  onComplete: (result: TestEngineResult) => void;
}

export type TestEngineComponent = React.ComponentType<TestEngineProps>;
