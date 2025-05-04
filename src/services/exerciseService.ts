import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from "firebase/firestore"
import { db } from "../config/firebase"
import type { Exercise } from "../types"

// Coleção de exercícios no Firestore
const EXERCISES_COLLECTION = "exercises"

// Buscar todos os exercícios
export const getAllExercises = async (): Promise<Exercise[]> => {
  try {
    const exercisesCollection = collection(db, EXERCISES_COLLECTION)
    const exercisesSnapshot = await getDocs(exercisesCollection)

    return exercisesSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Exercise,
    )
  } catch (error) {
    console.error("Erro ao buscar exercícios:", error)
    throw error
  }
}

// Adicionar um novo exercício
export const addExercise = async (exercise: Omit<Exercise, "id">): Promise<Exercise> => {
  try {
    const exercisesCollection = collection(db, EXERCISES_COLLECTION)
    const docRef = await addDoc(exercisesCollection, exercise)

    return {
      id: docRef.id,
      ...exercise,
    }
  } catch (error) {
    console.error("Erro ao adicionar exercício:", error)
    throw error
  }
}

// Atualizar um exercício existente
export const updateExercise = async (id: string, exercise: Partial<Exercise>): Promise<void> => {
  try {
    const exerciseRef = doc(db, EXERCISES_COLLECTION, id)
    await updateDoc(exerciseRef, exercise)
  } catch (error) {
    console.error("Erro ao atualizar exercício:", error)
    throw error
  }
}

// Excluir um exercício
export const deleteExercise = async (id: string): Promise<void> => {
  try {
    const exerciseRef = doc(db, EXERCISES_COLLECTION, id)
    await deleteDoc(exerciseRef)
  } catch (error) {
    console.error("Erro ao excluir exercício:", error)
    throw error
  }
}

// Buscar exercício por ID
export const getExerciseById = async (id: string): Promise<Exercise | null> => {
  try {
    const exerciseRef = doc(db, EXERCISES_COLLECTION, id)
    const exerciseSnap = await exerciseRef.get()

    if (exerciseSnap.exists()) {
      return {
        id: exerciseSnap.id,
        ...exerciseSnap.data(),
      } as Exercise
    }

    return null
  } catch (error) {
    console.error("Erro ao buscar exercício:", error)
    throw error
  }
}
