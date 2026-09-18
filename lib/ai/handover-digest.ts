import { z } from "zod";
import { generateJson, isAiConfigured } from "@/lib/ai/client";
import type { HandoverDigest } from "@/types/handover";

// Split out from the service so the eval harness can exercise the real prompt
// against the real API without dragging the database in with it.

export const digestSchema = z.object({
  summary: z.string().min(1),
  keyPoints: z.array(z.string().min(1)),
  flags: z.array(z.string().min(1)),
});

// Mirrors digestSchema for the vendor's structured-output config. Kept next to
// it so the two cannot drift apart unnoticed.
const responseSchema = {
  type: "object",
  properties: {
    summary: { type: "string" },
    keyPoints: { type: "array", items: { type: "string" } },
    flags: { type: "array", items: { type: "string" } },
  },
  required: ["summary", "keyPoints", "flags"],
};

const SYSTEM_INSTRUCTION = [
  "You write shift handover summaries for a care home manager.",
  "You are given the anonymized clock-in and clock-out notes from one day.",
  "Write a summary of 2 to 3 sentences, a list of discrete handover items, and a list of items needing manager attention.",
  "Every concrete handover item in the notes must appear in keyPoints, phrased in the notes' own words where possible.",
  "Use only what the notes say. Do not invent detail, and do not guess at redacted text.",
  "Redaction markers such as [name], [email], and [phone] are deliberate. Leave them as they are.",
].join(" ");

export function buildPrompt(notes: string[], date: string): string {
  return `Notes recorded on ${date}:\n${notes.map((note) => `- ${note}`).join("\n")}`;
}

// Returns null when the model is unreachable or answers with the wrong shape.
// Callers turn that into the typed "unavailable" result; throwing here would
// let a vendor outage reach a page render.
export async function generateDigest(
  notes: string[],
  date: string
): Promise<HandoverDigest | null> {
  if (!isAiConfigured()) {
    return null;
  }

  const response = await generateJson({
    systemInstruction: SYSTEM_INSTRUCTION,
    prompt: buildPrompt(notes, date),
    responseSchema,
  });

  const parsed = digestSchema.safeParse(response);
  if (!parsed.success) {
    console.warn("[handover] the model returned an unexpected digest shape");
    return null;
  }

  return parsed.data;
}
