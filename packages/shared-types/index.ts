export type UserRole = 'Coach' | 'SportScientist' | 'Athlete' | 'SportsMedicine' | 'Admin';

export interface Athlete {
  id: string;
  schoolId: string;
  firstName: string;
  lastName: string;
  sport: string;
  team: string;
  statusTag: 'GREEN' | 'YELLOW' | 'RED';
}

export interface School {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface TrainingSession {
  id: string;
  schoolId: string;
  athleteId: string;
  date: string;
  durationMin: number;
  sessionType: string;
  sessionRPE?: number;
  sessionLoad?: number;
}
