import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, getDoc } from "firebase/firestore"
import { db } from "../config/firebase"
import type { Workout, WorkoutTemplate } from "../types"

// Coleções no Firestore
const WORKOUTS_COLLECTION = "workouts"
const WORKOUT_TEMPLATES_COLLECTION = "workoutTemplates"

// Buscar todos os treinos
export const getAllWorkouts = async (): Promise<Workout[]> => {
  try {
    const workoutsCollection = collection(db, WORKOUTS_COLLECTION)
    const workoutsSnapshot = await getDocs(workoutsCollection)

    return workoutsSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Workout,
    )
  } catch (error) {
    console.error("Erro ao buscar treinos:", error)
    throw error
  }
}

// Buscar treinos de um aluno específico
export const getWorkoutsByStudent = async (studentId: string): Promise<Workout[]> => {
  try {
    const workoutsCollection = collection(db, WORKOUTS_COLLECTION)
    const q = query(workoutsCollection, where("studentId", "==", studentId))
    const workoutsSnapshot = await getDocs(q)

    return workoutsSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Workout,
    )
  } catch (error) {
    console.error("Erro ao buscar treinos do aluno:", error)
    throw error
  }
}

// Adicionar um novo treino
export const addWorkout = async (workout: Omit<Workout, "id">): Promise<Workout> => {
  try {
    const workoutsCollection = collection(db, WORKOUTS_COLLECTION)
    const docRef = await addDoc(workoutsCollection, workout)

    return {
      id: docRef.id,
      ...workout,
    }
  } catch (error) {
    console.error("Erro ao adicionar treino:", error)
    throw error
  }
}

// Atualizar um treino existente
export const updateWorkout = async (id: string, workout: Partial<Workout>): Promise<void> => {
  try {
    const workoutRef = doc(db, WORKOUTS_COLLECTION, id)
    await updateDoc(workoutRef, workout)
  } catch (error) {
    console.error("Erro ao atualizar treino:", error)
    throw error
  }
}

// Excluir um treino
export const deleteWorkout = async (id: string): Promise<void> => {
  try {
    const workoutRef = doc(db, WORKOUTS_COLLECTION, id)
    await deleteDoc(workoutRef)
  } catch (error) {
    console.error("Erro ao excluir treino:", error)
    throw error
  }
}

// Salvar um treino como template
export const saveWorkoutAsTemplate = async (template: Omit<WorkoutTemplate, "id">): Promise<WorkoutTemplate> => {
  try {
    const templatesCollection = collection(db, WORKOUT_TEMPLATES_COLLECTION)
    const docRef = await addDoc(templatesCollection, template)

    return {
      id: docRef.id,
      ...template,
    }
  } catch (error) {
    console.error("Erro ao salvar template de treino:", error)
    throw error
  }
}

// Buscar todos os templates de treino
export const getAllWorkoutTemplates = async (): Promise<WorkoutTemplate[]> => {
  try {
    const templatesCollection = collection(db, WORKOUT_TEMPLATES_COLLECTION)
    const templatesSnapshot = await getDocs(templatesCollection)

    return templatesSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as WorkoutTemplate,
    )
  } catch (error) {
    console.error("Erro ao buscar templates de treino:", error)
    throw error
  }
}

// Excluir um template de treino
export const deleteWorkoutTemplate = async (id: string): Promise<void> => {
  try {
    const templateRef = doc(db, WORKOUT_TEMPLATES_COLLECTION, id)
    await deleteDoc(templateRef)
  } catch (error) {
    console.error("Erro ao excluir template de treino:", error)
    throw error
  }
}

// Buscar um template de treino por ID
export const getWorkoutTemplateById = async (id: string): Promise<WorkoutTemplate | null> => {
  try {
    const templateRef = doc(db, WORKOUT_TEMPLATES_COLLECTION, id)
    const templateSnap = await getDoc(templateRef)

    if (templateSnap.exists()) {
      return {
        id: templateSnap.id,
        ...templateSnap.data(),
      } as WorkoutTemplate
    }

    return null
  } catch (error) {
    console.error("Erro ao buscar template de treino:", error)
    throw error
  }
}
