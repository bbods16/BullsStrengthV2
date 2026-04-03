import { z } from 'zod';

export const exerciseLogSchema = z.object({
  exerciseName: z.string().min(1),
  sets: z.number().int().min(1),
  reps: z.number().int().min(1),
  weight: z.number().min(0),
  rpe: z.number().int().min(1).max(10).optional(),
});

export const sessionLogSchema = z.object({
  athleteId: z.string().uuid(),
  date: z.string(),
  durationMin: z.number().int().min(1),
  sessionType: z.string(),
  sessionRPE: z.number().int().min(1).max(10),
  notes: z.string().optional(),
  exercises: z.array(exerciseLogSchema).optional(),
});

export type SessionLogInput = z.infer<typeof sessionLogSchema>;
export type ExerciseLogInput = z.infer<typeof exerciseLogSchema>;
