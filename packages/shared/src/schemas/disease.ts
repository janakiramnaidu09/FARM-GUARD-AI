import { z } from 'zod';

export const AssessmentStatusSchema = z.enum(['completed', 'uncertain', 'unsupported', 'failed']);
export type AssessmentStatus = z.infer<typeof AssessmentStatusSchema>;

export const ClassProbabilitySchema = z.object({
  className: z.string(),
  displayName: z.object({
    en: z.string(),
    te: z.string()
  }),
  crop: z.string(),
  probability: z.number().min(0).max(1)
});

export type ClassProbability = z.infer<typeof ClassProbabilitySchema>;

export const PracticalNextStepSchema = z.object({
  action: z.string(),
  descriptionEn: z.string(),
  descriptionTe: z.string(),
  category: z.enum(['cultural_control', 'sanitation', 'monitoring', 'expert_consultation', 'retake_photo'])
});

export type PracticalNextStep = z.infer<typeof PracticalNextStepSchema>;

export const DiseaseAssessmentResponseSchema = z.object({
  status: AssessmentStatusSchema,
  predictedClass: z.string().nullable().optional(),
  predictedClassDisplayName: z
    .object({
      en: z.string(),
      te: z.string()
    })
    .nullable()
    .optional(),
  confidence: z.number().min(0).max(1).nullable().optional(),
  classProbabilities: z.array(ClassProbabilitySchema).default([]),
  modelVersion: z.string().nullable().optional(),
  abstentionReason: z.string().nullable().optional(),
  nextSteps: z.array(PracticalNextStepSchema).default([]),
  uncertaintyWarning: z.string()
});

export type DiseaseAssessmentResponse = z.infer<typeof DiseaseAssessmentResponseSchema>;

export const DiseaseAssessmentRecordSchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string().uuid(),
  fieldId: z.string().uuid().nullable().optional(),
  cropCode: z.string().nullable().optional(),
  storageKey: z.string(),
  imageSha256: z.string(),
  predictedClass: z.string().nullable().optional(),
  confidence: z.number().min(0).max(1).nullable().optional(),
  status: AssessmentStatusSchema,
  abstentionReason: z.string().nullable().optional(),
  classProbabilities: z.array(ClassProbabilitySchema).default([]),
  nextSteps: z.array(PracticalNextStepSchema).default([]),
  modelVersion: z.string().nullable().optional(),
  imageUrl: z.string().optional(),
  createdAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable().optional()
});

export type DiseaseAssessmentRecord = z.infer<typeof DiseaseAssessmentRecordSchema>;

