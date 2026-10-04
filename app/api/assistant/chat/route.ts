import { NextRequest } from "next/server";
import { z } from "zod";

import { getOrCreateAnonSessionId } from "@/lib/session";
import { isRateLimited } from "@/lib/rate-limit";
import { getAnthropicClient, ASSISTANT_MODEL } from "@/lib/ai/anthropic";
import { getAssistantSystemPrompt } from "@/lib/ai/prompts";
import { routing } from "@/i18n/routing";

const ChatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(2000),
      })
    )
    .min(1)
    .max(20),
  locale: z.enum(routing.locales as unknown as [string, ...string[]]).default(routing.defaultLocale),
});

export async function POST(request: NextRequest) {
  const anonSessionId = await getOrCreateAnonSessionId();

  if (isRateLimited(`assistant:${anonSessionId}`, 20, 10 * 60 * 1000)) {
    return new Response("Too many messages — please wait a bit before asking more.", {
      status: 429,
    });
  }

  const parsed = ChatSchema.safeParse(await request.json());
  if (!parsed.success) {
    return new Response("Invalid request", { status: 400 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        const anthropic = getAnthropicClient();
        const anthropicStream = anthropic.messages.stream({
          model: ASSISTANT_MODEL,
          max_tokens: 600,
          system: getAssistantSystemPrompt(parsed.data.locale),
          messages: parsed.data.messages,
        });

        anthropicStream.on("text", (text) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
        });

        await anthropicStream.finalMessage();
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: "Something went wrong." })}\n\n`)
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
