// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  password?: string; // Only used for mock data
}

// Exercise Types
export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  instructions: string;
  imageUrl?: string;
}

// Workout Types
export interface Workout {
  id: string;
  studentId: string;
  dayOfWeek: DayOfWeek;
  exercises: WorkoutExercise[];
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  sets: number;
  reps: number;
  notes?: string;
}

// Helper Types
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export const daysOfWeek: DayOfWeek[] = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];

export const daysOfWeekLabels: Record<DayOfWeek, string> = {
  monday: 'Segunda',
  tuesday: 'Terça',
  wednesday: 'Quarta',
  thursday: 'Quinta',
  friday: 'Sexta',
  saturday: 'Sábado',
  sunday: 'Domingo'
};