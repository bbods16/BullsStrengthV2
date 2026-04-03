import { z } from 'zod';

export const wellnessSchema = z.object({
  athleteId: z.string().uuid(),
  sleepHours: z.number().min(0).max(24),
  sleepQuality: z.number().min(1).max(10),
  soreness: z.number().min(1).max(10),
  fatigue: z.number().min(1).max(10),
  stress: z.number().min(1).max(10),
  mood: z.number().min(1).max(10).optional(),
  motivation: z.number().min(1).max(10).optional(),
  illness: z.boolean().default(false),
  pain: z.boolean().default(false),
  notes: z.string().optional(),
});

export type WellnessInput = z.infer<typeof wellnessSchema>;
