import { z } from "zod";

const categoryLiterals = [
  "Billing",
  "Claims",
  "Endorsement",
  "General",
  "Urgent",
  "Spam",
] as const;

export const aiAssistCategorySchema = z.enum(categoryLiterals, {
  error: () => ({
    message:
      "Category must be one of: Billing, Claims, Endorsement, General, Urgent, or Spam.",
  }),
});

const summaryBulletSchema = z
  .string("Each summary line must be text, not a number or object.")
  .min(1, "Summary lines cannot be empty — no blank bullets");

export const aiAssistSchema = z.object({
  id: z
    .string("Message ID must be text.")
    .min(1, "Message ID is missing — the AI reply should include which message it refers to."),
  summary_bullets: z
    .array(summaryBulletSchema, {
      error: () => ({
        message:
          "Summary bullets must be a list of short text lines (use an array of strings).",
      }),
    })
    .min(
      1,
      "Add at least one short summary line so agents can skim the case before reading details.",
    ),
  category: aiAssistCategorySchema,
  priority: z
    .string("Priority must be text (for example P1, P2, or P3).")
    .min(1, "Priority is missing — include how urgent this is (for example P1–P3)."),
  suggested_action: z
    .string("Suggested next step must be text.")
    .min(
      1,
      "Suggested next step is empty — describe what the agent should do next in plain language.",
    ),
  draft_reply: z
    .string("Draft reply must be text.")
    .min(1, "Draft reply is empty — include suggested wording the agent can edit and send."),
  confidence: z
    .number({
      error: () => ({
        message:
          "Confidence score must be a number between 0 and 1 (for example 0.85 for 85% sure), or omitted.",
      }),
    })
    .min(0, "Confidence cannot be below 0 (0% sure).")
    .max(1, "Confidence cannot be above 1 (100% sure). Use decimals such as 0.92.")
    .optional(),
  draft_reply_edited: z
    .boolean({
      error: () => ({
        message:
          '"Draft edited" flag must be true or false, or omitted if the agent has not changed the draft.',
      }),
    })
    .optional(),
});

export type AiAssistSchemaIssue = { path: string; message: string };

export function formatAiAssistSchemaIssues(
  error: z.ZodError<unknown> | undefined,
): AiAssistSchemaIssue[] {
  if (error == null) return [];
  return error.issues.map((issue) => ({
    path: issue.path.length ? issue.path.map(String).join(".") : "(root)",
    message: issue.message,
  }));
}
