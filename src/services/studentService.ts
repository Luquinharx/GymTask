import { collection, doc, getDocs, query, where, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "../config/firebase"
import type { User } from "../types"
import { sendWelcomeEmail } from "./emailService"
import { getAuth, sendPasswordResetEmail } from "firebase/auth"

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

// Criar um novo aluno sem fazer login com ele
export const createStudent = async (name: string, email: string, password: string): Promise<User> => {
  try {
    // Criar uma instância secundária do Firebase Auth
    // Isso permite criar um usuário sem afetar a autenticação atual
    const secondaryAuth = getAuth()
    secondaryAuth.tenantId = "student-creation" // Isso é apenas para diferenciar, não afeta a funcionalidade

    // Criar o usuário no Firebase Auth usando a API REST
    // Isso evita qualquer alteração no estado de autenticação atual
    const apiKey = "AIzaSyC60KEVrIQIen91OPHnZ9IV_LhozfceSvY" // Usar a chave diretamente para o ambiente do navegador
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error.message)
    }

    const data = await response.json()
    const uid = data.localId

    // Salvar dados no Firestore
    const userData: Omit<User, "id"> = {
      name,
      email,
      role: "student",
    }

    await setDoc(doc(db, USERS_COLLECTION, uid), userData)

    // Enviar email de boas-vindas
    const newUser: User = {
      id: uid,
      ...userData,
    }

    try {
      await sendWelcomeEmail(newUser, password)
    } catch (emailError) {
      console.error("Erro ao enviar email de boas-vindas:", emailError)
    }

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
    await sendPasswordResetEmail(getAuth(), email)
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
