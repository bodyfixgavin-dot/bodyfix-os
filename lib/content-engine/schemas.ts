import { z } from "zod";

/**
 * BodyFix Content Engine MVP v0.1 - Zod Schemas
 * Based on BodyFix Content JSON Contract v0.1
 */

export const ContentSlideSchema = z.object({
  page: z.number().int().min(1),
  role: z.enum([
    "cover",
    "problem",
    "mechanism",
    "example",
    "self_check",
    "method",
    "cta",
  ]),
  headline: z.string().min(1),
  body: z.string(),
  keyPoint: z.string(),
  visualDirection: z.string(),
  layout: z.string(),
  whitespacePercent: z.number().min(0).max(100),
});

export const ContentPackageSchema = z.object({
  schemaVersion: z.literal("0.1"),
  projectCode: z.string().min(1),
  title: z.string().min(1),
  contentType: z.enum([
    "instagram_carousel",
    "instagram_reel",
    "instagram_caption",
    "story_sequence",
    "article_outline",
  ]),
  platform: z.enum(["instagram", "facebook", "website", "line"]),
  language: z.literal("zh-TW"),
  aspectRatio: z.enum(["4:5", "9:16", "1:1", "16:9"]),
  objective: z.string(),
  audience: z.array(z.string()),
  coreMessage: z.string(),
  hook: z.string(),
  slides: z.array(ContentSlideSchema).min(4).max(10),
  caption: z.object({
    opening: z.string(),
    body: z.string(),
    cta: z.string(),
  }),
  visualSystem: z.object({
    background: z.string(),
    primary: z.string(),
    accent: z.string(),
    illustrationStyle: z.string(),
    minimumWhitespacePercent: z.number().min(0).max(100),
    maximumWhitespacePercent: z.number().min(0).max(100),
  }).refine(data => data.minimumWhitespacePercent <= data.maximumWhitespacePercent, {
    message: "minimumWhitespacePercent cannot be greater than maximumWhitespacePercent",
    path: ["minimumWhitespacePercent"],
  }),
  brandRules: z.array(z.string()),
  safetyChecks: z.object({
    containsPersonalData: z.literal(false),
    containsMedicalClaim: z.literal(false),
    containsUnverifiedEvidence: z.boolean(),
    requiresHumanReview: z.literal(true),
  }),
  sourceNotes: z.array(z.object({
    type: z.enum(["brand_knowledge", "research", "case_summary", "user_input"]),
    label: z.string(),
    summary: z.string(),
  })),
  openQuestions: z.array(z.string()),
  approvedVersionId: z.string().min(1),
  generatedAt: z.string().datetime(),
}).refine(data => {
  // Ensure slides are sequentially numbered
  const pages = data.slides.map(s => s.page).sort((a, b) => a - b);
  return pages.every((p, i) => p === i + 1);
}, {
  message: "Slides must be sequentially numbered starting from 1",
  path: ["slides"],
});
