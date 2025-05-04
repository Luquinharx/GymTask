import { createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth"
import { collection, updateDoc, deleteDoc, doc, getDocs, query, where, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "../config/firebase"
import type { User } from "../types"
import { sendWelcomeEmail } from "./emailService"

// Coleção de usuários no Firestore
const USERS_COLLECTION = "users"

// Buscar todos os alunos
export const getAllStudents = async (): Promise<User[]> => {
  try {
    const usersCollection = collection(db, USERS_COLLECTION)
    const q = query(usersCollection, where("role", "==", "student"))
    const usersSnapshot = await getDocs(q)

    return usersSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as User,
    )
  } catch (error) {
    console.error("Erro ao buscar alunos:", error)
    throw error
  }
}

// Criar um novo aluno
export const createStudent = async (name: string, email: string, password: string): Promise<User> => {
  try {
    // 1. Criar usuário no Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const uid = userCredential.user.uid

    // 2. Salvar dados adicionais no Firestore
    const userData: Omit<User, "id"> = {
      name,
      email,
      role: "student",
    }

    await setDoc(doc(db, USERS_COLLECTION, uid), userData)

    // 3. Enviar email de boas-vindas com as credenciais
    const newUser: User = {
      id: uid,
      ...userData,
    }

    await sendWelcomeEmail(newUser, password)

    return newUser
  } catch (error) {
    console.error("Erro ao criar aluno:", error)
    throw error
  }
}

// Atualizar um aluno existente
export const updateStudent = async (id: string, userData: Partial<User>): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, id)
    await updateDoc(userRef, userData)
  } catch (error) {
    console.error("Erro ao atualizar aluno:", error)
    throw error
  }
}

// Excluir um aluno
export const deleteStudent = async (id: string): Promise<void> => {
  try {
    // Excluir do Firestore
    const userRef = doc(db, USERS_COLLECTION, id)
    await deleteDoc(userRef)

    // Nota: Excluir do Authentication requer funções do lado do servidor
    // ou regras de segurança específicas. Isso geralmente é feito com
    // Cloud Functions ou uma API backend.
  } catch (error) {
    console.error("Erro ao excluir aluno:", error)
    throw error
  }
}

// Enviar email de redefinição de senha
export const sendPasswordReset = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error) {
    console.error("Erro ao enviar email de redefinição de senha:", error)
    throw error
  }
}

// Buscar aluno por ID
export const getStudentById = async (id: string): Promise<User | null> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, id)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      return {
        id: userSnap.id,
        ...userSnap.data(),
      } as User
    }

    return null
  } catch (error) {
    console.error("Erro ao buscar aluno:", error)
    throw error
  }
}
