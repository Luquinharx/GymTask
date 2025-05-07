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
  weight?: number // Peso em kg
  repsPerSet?: number[] // Repetições por série
  completed?: boolean
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
  intensity?: number // Intensidade do treino (1-5)
  history?: WorkoutHistory[] // Histórico de treinos
}

export interface WorkoutExercise {
  id: string
  exerciseId: string
  sets: number
  reps: number
  notes?: string
  completed?: boolean
  weight?: number // Peso em kg
  repsPerSet?: number[] // Repetições por série
  history?: ExerciseHistory[] // Histórico do exercício
}

// Histórico de treinos
export interface WorkoutHistory {
  date: string
  intensity: number
  exercises: ExerciseHistory[]
}

// Histórico de exercícios
export interface ExerciseHistory {
  exerciseId: string
  weight: number
  repsPerSet: number[]
  completed: boolean
  date: string
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
