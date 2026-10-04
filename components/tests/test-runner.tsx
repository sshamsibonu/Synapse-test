"use client";

import type { TestDefinition } from "@/types/database";
import type { TestEngineResult } from "@/types/tests";
import { ENGINE_REGISTRY } from "@/lib/tests/engine-registry";
import { TestShell } from "@/components/tests/test-shell";

export function TestRunner({ definition }: { definition: TestDefinition }) {
  const Engine = ENGINE_REGISTRY[definition.id];

  async function handleFinish(result: TestEngineResult): Promise<string | null> {
    const res = await fetch(`/api/tests/${definition.id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result),
    });
    if (!res.ok) throw new Error("Failed to submit result");
    const body = await res.json();
    return body.testResultId ?? null;
  }

  return <TestShell definition={definition} Engine={Engine} onFinish={handleFinish} />;
}
