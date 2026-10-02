import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/responses";
const MODEL = "openai/gpt-6-astra";

async function callAi(instructions: string, input: string): Promise<string> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    throw new Error("AI service is not configured. Please try again later.");
  }

  const response = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: MODEL,
      instructions,
      input,
      stream: true,
      store: false,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    if (response.status === 429 || response.status >= 500) {
      throw new Error("The AI service is busy right now. Please try again in a moment.");
    }
    throw new Error(`AI request failed (${response.status}). ${text.slice(0, 200)}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("AI service returned an empty response.");

  const decoder = new TextDecoder();
  let buffer = "";
  let output = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      try {
        const event = JSON.parse(data);
        if (event.type === "response.output_text.delta" && typeof event.delta === "string") {
          output += event.delta;
        } else if (event.type === "response.completed" && event.response?.output_text) {
          output = event.response.output_text;
        }
      } catch {
        // ignore non-JSON SSE lines
      }
    }
  }

  if (!output.trim()) throw new Error("The AI returned an empty response. Please try again.");
  return output.trim();
}

const SYSTEM_BASE =
  "You are AI EduAssist, an AI productivity assistant for education professionals (teachers, lecturers, school administrators). " +
  "Write in clear, professional Markdown. Use ### headings and bullet lists where helpful. " +
  "Never invent facts the user did not provide; if details are missing, use sensible placeholders in [brackets].";

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        context: z.string().min(3),
        tone: z.enum(["formal", "friendly", "persuasive"]),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const toneGuide = {
      formal: "formal, courteous and professional",
      friendly: "warm, approachable and friendly while remaining professional",
      persuasive: "persuasive and compelling, with a clear call to action",
    }[data.tone];
    return callAi(
      `${SYSTEM_BASE} Draft a complete, ready-to-send email in a ${toneGuide} tone. Include a subject line, greeting, body and sign-off.`,
      `Email context and key points:\n${data.context}`,
    );
  });

export const summarizeNotes = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ notes: z.string().min(10) }).parse(data))
  .handler(async ({ data }) => {
    return callAi(
      `${SYSTEM_BASE} Summarise the meeting notes with exactly these sections: ` +
        `### Summary (2-4 sentences), ### Key Decisions, ### Action Items (each as "- Task — Owner — Deadline"; use [Unassigned] or [No deadline] when unknown), ### Deadlines. ` +
        `Extract only what is actually in the notes.`,
      `Meeting notes:\n${data.notes}`,
    );
  });

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        tasks: z.string().min(3),
        horizon: z.enum(["daily", "weekly"]),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    return callAi(
      `${SYSTEM_BASE} Create a ${data.horizon} schedule from the user's tasks. ` +
        `First give ### Prioritised Tasks, ranking each task by urgency and importance (label each High/Medium/Low for both). ` +
        `Then give ### Schedule with realistic time blocks. Group related tasks, put deep-focus work early, and include short breaks. ` +
        `Keep it practical for an education professional's working day.`,
      `Tasks:\n${data.tasks}`,
    );
  });
