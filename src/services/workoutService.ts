import { collection, doc, getDocs, query, where, getDoc, updateDoc, deleteDoc, addDoc } from "firebase/firestore"
import { db } from "../config/firebase"
import type { Workout, ExerciseHistory, WorkoutHistory, WorkoutTemplate } from "../types"
import { v4 as uuidv4 } from "uuid"

// Coleção de treinos no Firestore
const WORKOUTS_COLLECTION = "workouts"

// Buscar todos os treinos de um aluno
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
    console.error("Erro ao buscar treinos:", error)
    throw error
  }
}

// Buscar todos os treinos (para admin)
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
    console.error("Erro ao buscar todos os treinos:", error)
    throw error
  }
}

// Criar um novo treino
export const addWorkout = async (workout: Omit<Workout, "id">): Promise<Workout> => {
  try {
    // Gerar IDs para os exercícios
    const workoutWithIds = {
      ...workout,
      exercises: workout.exercises.map((exercise) => ({
        ...exercise,
        id: uuidv4(),
      })),
    }

    // Adicionar ao Firestore
    const docRef = await addDoc(collection(db, WORKOUTS_COLLECTION), workoutWithIds)

    // Retornar o treino completo com ID
    return {
      id: docRef.id,
      ...workoutWithIds,
    }
  } catch (error) {
    console.error("Erro ao criar treino:", error)
    throw error
  }
}

// Atualizar um treino existente
export const updateWorkout = async (id: string, workoutData: Partial<Workout>): Promise<void> => {
  try {
    const workoutRef = doc(db, WORKOUTS_COLLECTION, id)
    await updateDoc(workoutRef, workoutData)
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

// Buscar treino por ID
export const getWorkoutById = async (id: string): Promise<Workout | null> => {
  try {
    const workoutRef = doc(db, WORKOUTS_COLLECTION, id)
    const workoutSnap = await getDoc(workoutRef)

    if (workoutSnap.exists()) {
      return {
        id: workoutSnap.id,
        ...workoutSnap.data(),
      } as Workout
    }

    return null
  } catch (error) {
    console.error("Erro ao buscar treino:", error)
    throw error
  }
}

// Marcar exercício como concluído
export const toggleExerciseComplete = async (
  workoutId: string,
  exerciseId: string,
  completed: boolean,
  weight?: number,
  repsPerSet?: number[],
): Promise<void> => {
  try {
    const workoutRef = doc(db, WORKOUTS_COLLECTION, workoutId)
    const workoutSnap = await getDoc(workoutRef)

    if (!workoutSnap.exists()) {
      throw new Error("Treino não encontrado")
    }

    const workout = workoutSnap.data() as Omit<Workout, "id">
    const updatedExercises = workout.exercises.map((ex) => {
      if (ex.id === exerciseId) {
        // Criar um registro de histórico para este exercício
        const exerciseHistory: ExerciseHistory = {
          exerciseId: ex.exerciseId,
          weight: weight || ex.weight || 0,
          repsPerSet: repsPerSet || ex.repsPerSet || Array(ex.sets).fill(ex.reps),
          completed,
          date: new Date().toISOString(),
        }

        // Adicionar ao histórico do exercício
        const history = ex.history || []
        history.push(exerciseHistory)

        return {
          ...ex,
          completed,
          weight: weight || ex.weight,
          repsPerSet: repsPerSet || ex.repsPerSet,
          history,
        }
      }
      return ex
    })

    await updateDoc(workoutRef, { exercises: updatedExercises })
  } catch (error) {
    console.error("Erro ao marcar exercício como concluído:", error)
    throw error
  }
}

// Marcar treino como concluído
export const completeWorkout = async (workoutId: string, intensity?: number): Promise<void> => {
  try {
    const workoutRef = doc(db, WORKOUTS_COLLECTION, workoutId)
    const workoutSnap = await getDoc(workoutRef)

    if (!workoutSnap.exists()) {
      throw new Error("Treino não encontrado")
    }

    const workout = { ...workoutSnap.data() } as Omit<Workout, "id">

    // Criar um registro de histórico para este treino
    const workoutHistory: WorkoutHistory = {
      date: new Date().toISOString(),
      intensity: intensity || workout.intensity || 0,
      exercises: workout.exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        weight: ex.weight || 0,
        repsPerSet: ex.repsPerSet || Array(ex.sets).fill(ex.reps),
        completed: ex.completed || false,
        date: new Date().toISOString(),
      })),
    }

    // Adicionar ao histórico do treino
    const history = workout.history || []
    history.push(workoutHistory)

    await updateDoc(workoutRef, {
      completed: true,
      completedDate: new Date().toISOString(),
      intensity: intensity || workout.intensity,
      history,
    })
  } catch (error) {
    console.error("Erro ao marcar treino como concluído:", error)
    throw error
  }
}

// Atualizar o peso de um exercício
export const updateExerciseWeight = async (workoutId: string, exerciseId: string, weight: number): Promise<void> => {
  try {
    const workoutRef = doc(db, WORKOUTS_COLLECTION, workoutId)
    const workoutSnap = await getDoc(workoutRef)

    if (!workoutSnap.exists()) {
      throw new Error("Treino não encontrado")
    }

    const workout = workoutSnap.data() as Omit<Workout, "id">
    const updatedExercises = workout.exercises.map((ex) => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          weight,
        }
      }
      return ex
    })

    await updateDoc(workoutRef, { exercises: updatedExercises })
  } catch (error) {
    console.error("Erro ao atualizar peso do exercício:", error)
    throw error
  }
}

// Atualizar as repetições de um exercício
export const updateExerciseReps = async (
  workoutId: string,
  exerciseId: string,
  setIndex: number,
  reps: number,
): Promise<void> => {
  try {
    const workoutRef = doc(db, WORKOUTS_COLLECTION, workoutId)
    const workoutSnap = await getDoc(workoutRef)

    if (!workoutSnap.exists()) {
      throw new Error("Treino não encontrado")
    }

    const workout = workoutSnap.data() as Omit<Workout, "id">
    const updatedExercises = workout.exercises.map((ex) => {
      if (ex.id === exerciseId) {
        const repsPerSet = ex.repsPerSet || Array(ex.sets).fill(ex.reps)
        repsPerSet[setIndex] = reps
        return {
          ...ex,
          repsPerSet,
        }
      }
      return ex
    })

    await updateDoc(workoutRef, { exercises: updatedExercises })
  } catch (error) {
    console.error("Erro ao atualizar repetições do exercício:", error)
    throw error
  }
}

// Atualizar a intensidade do treino
export const updateWorkoutIntensity = async (workoutId: string, intensity: number): Promise<void> => {
  try {
    const workoutRef = doc(db, WORKOUTS_COLLECTION, workoutId)
    await updateDoc(workoutRef, { intensity })
  } catch (error) {
    console.error("Erro ao atualizar intensidade do treino:", error)
    throw error
  }
}

// Obter o histórico de um exercício específico
export const getExerciseHistory = async (studentId: string, exerciseId: string): Promise<ExerciseHistory[]> => {
  try {
    const workoutsCollection = collection(db, WORKOUTS_COLLECTION)
    const q = query(workoutsCollection, where("studentId", "==", studentId))
    const workoutsSnapshot = await getDocs(q)

    const history: ExerciseHistory[] = []

    workoutsSnapshot.docs.forEach((doc) => {
      const workout = doc.data() as Workout

      // Procurar nos exercícios do treino
      workout.exercises.forEach((ex) => {
        if (ex.exerciseId === exerciseId && ex.history) {
          history.push(...ex.history)
        }
      })

      // Procurar no histórico do treino
      if (workout.history) {
        workout.history.forEach((wh) => {
          wh.exercises.forEach((ex) => {
            if (ex.exerciseId === exerciseId) {
              history.push(ex)
            }
          })
        })
      }
    })

    // Ordenar por data, do mais recente para o mais antigo
    return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch (error) {
    console.error("Erro ao buscar histórico do exercício:", error)
    throw error
  }
}

// Coleção de templates de treino no Firestore
const WORKOUT_TEMPLATES_COLLECTION = "workoutTemplates"

// Salvar um treino como template
export const saveWorkoutAsTemplate = async (template: Omit<WorkoutTemplate, "id">): Promise<WorkoutTemplate> => {
  try {
    const docRef = await addDoc(collection(db, WORKOUT_TEMPLATES_COLLECTION), template)

    return {
      id: docRef.id,
      ...template,
    }
  } catch (error) {
    console.error("Erro ao salvar treino como template:", error)
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

// Duplicar um treino para um aluno específico
export const duplicateWorkoutForStudent = async (
  workoutId: string,
  studentId: string,
  dayOfWeek: DayOfWeek,
): Promise<Workout | null> => {
  try {
    const workoutRef = doc(db, WORKOUTS_COLLECTION, workoutId)
    const workoutSnap = await getDoc(workoutRef)

    if (!workoutSnap.exists()) {
      throw new Error("Treino não encontrado")
    }

    const workoutData = workoutSnap.data() as Omit<Workout, "id">

    const newWorkoutData: Omit<Workout, "id"> = {
      studentId,
      name: workoutData.name,
      dayOfWeek: dayOfWeek,
      exercises: workoutData.exercises.map((ex) => ({
        ...ex,
        id: uuidv4(),
      })),
      completed: false,
      intensity: workoutData.intensity || 0,
    }

    const docRef = await addDoc(collection(db, WORKOUTS_COLLECTION), newWorkoutData)

    return {
      id: docRef.id,
      ...newWorkoutData,
    }
  } catch (error) {
    console.error("Erro ao duplicar treino para aluno:", error)
    throw error
  }
}
