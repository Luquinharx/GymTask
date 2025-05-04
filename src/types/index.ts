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
  name: string // Adicionado campo para nome do treino
  dayOfWeek: DayOfWeek
  exercises: WorkoutExercise[]
  completed?: boolean
  completedDate?: string
}

export interface WorkoutExercise {
  id: string
  exerciseId: string
  sets: number
  reps: number
  notes?: string
  completed?: boolean
}

// Novo tipo para templates de treino
export interface WorkoutTemplate {
  id: string
  name: string
  description?: string
  exercises: WorkoutExercise[]
  createdAt: string
  createdBy: string // ID do usuário que criou o template
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
