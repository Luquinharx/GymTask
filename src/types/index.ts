// User Types
export interface User {
  id: string
  name: string
  email: string
  role: "student" | "admin"
  password?: string // Only used for mock data
}

// Exercise Types
export interface Exercise {
  id: string
  name: string
  muscleGroup: string
  instructions: string
  imageUrl?: string
  videoUrl?: string // Adicionado campo para vídeo
}

// Workout Types
export interface Workout {
  id: string
  studentId: string
  dayOfWeek: DayOfWeek
  exercises: WorkoutExercise[]
  completed?: boolean // Adicionado campo para marcar treino como concluído
  completedDate?: string // Data de conclusão do treino
}

export interface WorkoutExercise {
  id: string
  exerciseId: string
  sets: number
  reps: number
  notes?: string
  completed?: boolean // Adicionado campo para marcar exercício como concluído
}

// Progress Types
export interface WorkoutProgress {
  dailyCompleted: boolean
  weeklyCompleted: boolean
  monthlyCompleted: boolean
  lastDailyCompletedDate?: string
  lastWeeklyCompletedDate?: string
  lastMonthlyCompletedDate?: string
}

// Helper Types
export type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"

export const daysOfWeek: DayOfWeek[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

export const daysOfWeekLabels: Record<DayOfWeek, string> = {
  monday: "Segunda",
  tuesday: "Terça",
  wednesday: "Quarta",
  thursday: "Quinta",
  friday: "Sexta",
  saturday: "Sábado",
  sunday: "Domingo",
}
