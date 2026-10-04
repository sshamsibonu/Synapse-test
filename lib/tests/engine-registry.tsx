import type { TestEngineComponent } from "@/types/tests";
import { SimpleReactionTimeEngine } from "@/components/tests/engines/simple-reaction-time";
import { StroopEngine } from "@/components/tests/engines/stroop";
import { NBackEngine } from "@/components/tests/engines/n-back";
import { DigitSpanEngine } from "@/components/tests/engines/digit-span";

export const ENGINE_REGISTRY: Record<string, TestEngineComponent> = {
  "simple-reaction-time": SimpleReactionTimeEngine,
  "stroop-test": StroopEngine,
  "n-back": NBackEngine,
  "digit-span": DigitSpanEngine,
};
