import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "../config/firebase"
import type { User, Exercise, Workout } from "../types"

// Função para obter estatísticas do dashboard
export const getDashboardStats = async (): Promise<{
  studentCount: number
  exerciseCount: number
  workoutCount: number
  lastUpdate: string
}> => {
  try {
    // Contar alunos
    const studentsCollection = collection(db, "users")
    const studentsQuery = query(studentsCollection, where("role", "==", "student"))
    const studentsSnapshot = await getDocs(studentsQuery)
    const studentCount = studentsSnapshot.size

    // Contar exercícios
    const exercisesCollection = collection(db, "exercises")
    const exercisesSnapshot = await getDocs(exercisesCollection)
    const exerciseCount = exercisesSnapshot.size

    // Contar treinos
    const workoutsCollection = collection(db, "workouts")
    const workoutsSnapshot = await getDocs(workoutsCollection)
    const workoutCount = workoutsSnapshot.size

    // Data da última atualização
    const now = new Date()
    const lastUpdate = now.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })

    return {
      studentCount,
      exerciseCount,
      workoutCount,
      lastUpdate,
    }
  } catch (error) {
    console.error("Erro ao buscar estatísticas do dashboard:", error)
    throw error
  }
}

// Função para obter os alunos mais ativos
export const getTopActiveStudents = async (limit = 5): Promise<User[]> => {
  try {
    // Buscar todos os treinos
    const workoutsCollection = collection(db, "workouts")
    const workoutsSnapshot = await getDocs(workoutsCollection)
    const workouts = workoutsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Workout[]

    // Contar treinos por aluno
    const studentWorkoutCounts: Record<string, number> = {}
    workouts.forEach((workout) => {
      const studentId = workout.studentId
      studentWorkoutCounts[studentId] = (studentWorkoutCounts[studentId] || 0) + 1
    })

    // Ordenar alunos por número de treinos
    const sortedStudentIds = Object.keys(studentWorkoutCounts).sort(
      (a, b) => studentWorkoutCounts[b] - studentWorkoutCounts[a],
    )

    // Limitar ao número solicitado
    const topStudentIds = sortedStudentIds.slice(0, limit)

    // Buscar detalhes dos alunos
    const studentsCollection = collection(db, "users")
    const studentsSnapshot = await getDocs(studentsCollection)
    const allStudents = studentsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as User[]

    // Filtrar apenas os alunos mais ativos
    const topStudents = allStudents.filter((student) => topStudentIds.includes(student.id))

    return topStudents
  } catch (error) {
    console.error("Erro ao buscar alunos mais ativos:", error)
    throw error
  }
}

// Função para obter os exercícios mais populares
export const getPopularExercises = async (limit = 5): Promise<Exercise[]> => {
  try {
    // Buscar todos os treinos
    const workoutsCollection = collection(db, "workouts")
    const workoutsSnapshot = await getDocs(workoutsCollection)
    const workouts = workoutsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Workout[]

    // Contar exercícios
    const exerciseCounts: Record<string, number> = {}
    workouts.forEach((workout) => {
      workout.exercises.forEach((ex) => {
        exerciseCounts[ex.exerciseId] = (exerciseCounts[ex.exerciseId] || 0) + 1
      })
    })

    // Ordenar exercícios por popularidade
    const sortedExerciseIds = Object.keys(exerciseCounts).sort(
      (a, b) => exerciseCounts[b] - exerciseCounts[a]
    )

    // Limitar ao número solicitado
    const topExerciseIds = sortedExerciseIds.slice(0, limit)

// Buscar detalhes dos exercícioscioscioscioscioscioscioscioscioscioscioscioscioscioscios
