import { z } from 'zod';

export const athleteSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  sport: z.string(),
  team: z.string(),
  schoolId: z.string().uuid().optional(), // Injected by API middleware
  height: z.number().optional(),
  weight: z.number().optional(),
  trainingAge: z.number().optional(),
});

export type CreateAthleteInput = z.infer<typeof athleteSchema>;
