import {
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    updateProfile,
    signInWithEmailAndPassword,
  } from "firebase/auth"
  import { doc, setDoc, collection, getDocs, query, where, deleteDoc, updateDoc } from "firebase/firestore"
  import { auth } from "../config/firebase"
  import { getFirestore } from "firebase/firestore"
  import type { User } from "../types"
  
  // Inicializar Firestore
  const db = getFirestore()
  
  // Verificar se o usuário admin existe e criá-lo se necessário
  export const ensureAdminExists = async (
    adminEmail: string,
    adminPassword: string,
    adminName: string,
  ): Promise<void> => {
    try {
      // Verificar se o usuário já existe no Firestore
      const usersRef = collection(db, "users")
      const q = query(usersRef, where("email", "==", adminEmail))
      const querySnapshot = await getDocs(q)
  
      if (querySnapshot.empty) {
        console.log("Admin não encontrado, tentando criar...")
  
        try {
          // Tentar criar o usuário no Firebase Authentication
          const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword)
          const firebaseUser = userCredential.user
  
          // Atualizar o perfil do usuário com o nome
          await updateProfile(firebaseUser, {
            displayName: adminName,
          })
  
          // Criar documento do usuário no Firestore
          const adminUser: User = {
            id: firebaseUser.uid,
            name: adminName,
            email: adminEmail,
            role: "admin",
          }
  
          await setDoc(doc(db, "users", firebaseUser.uid), {
            ...adminUser,
            createdAt: new Date().toISOString(),
          })
  
          console.log("Usuário admin criado com sucesso!")
        } catch (error: any) {
          // Se o erro for porque o usuário já existe no Authentication mas não no Firestore
          if (error.code === "auth/email-already-in-use") {
            console.log("Usuário já existe no Authentication, tentando login...")
  
            // Tentar fazer login para obter o UID
            try {
              const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword)
              const firebaseUser = userCredential.user
  
              // Criar documento do usuário no Firestore
              const adminUser: User = {
                id: firebaseUser.uid,
                name: adminName,
                email: adminEmail,
                role: "admin",
              }
  
              await setDoc(doc(db, "users", firebaseUser.uid), {
                ...adminUser,
                createdAt: new Date().toISOString(),
              })
  
              console.log("Documento do admin criado no Firestore!")
            } catch (loginError) {
              console.error("Erro ao fazer login como admin:", loginError)
              throw new Error("Não foi possível criar ou acessar a conta de administrador")
            }
          } else {
            console.error("Erro ao criar admin:", error)
            throw error
          }
        }
      } else {
        console.log("Admin já existe no sistema")
      }
    } catch (error) {
      console.error("Erro ao verificar/criar admin:", error)
      throw error
    }
  }
  
  // Criar um novo aluno no Firebase Authentication e Firestore
  export const createStudent = async (name: string, email: string, password: string): Promise<User> => {
    try {
      // Criar usuário no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user
  
      // Atualizar o perfil do usuário com o nome
      await updateProfile(firebaseUser, {
        displayName: name,
      })
  
      // Criar documento do usuário no Firestore
      const newUser: User = {
        id: firebaseUser.uid,
        name: name,
        email: email,
        role: "student",
      }
  
      await setDoc(doc(db, "users", firebaseUser.uid), {
        ...newUser,
        createdAt: new Date().toISOString(),
      })
  
      return newUser
    } catch (error) {
      console.error("Erro ao criar aluno:", error)
      throw new Error(error instanceof Error ? error.message : "Erro ao criar aluno")
    }
  }
  
  // Atualizar um aluno existente
  export const updateStudent = async (id: string, data: Partial<User>): Promise<User> => {
    try {
      const userRef = doc(db, "users", id)
      await updateDoc(userRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      })
  
      // Retornar o usuário atualizado
      return {
        id,
        name: data.name || "",
        email: data.email || "",
        role: "student",
      }
    } catch (error) {
      console.error("Erro ao atualizar aluno:", error)
      throw new Error(error instanceof Error ? error.message : "Erro ao atualizar aluno")
    }
  }
  
  // Excluir um aluno
  export const deleteStudent = async (id: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(db, "users", id))
      return true
    } catch (error) {
      console.error("Erro ao excluir aluno:", error)
      throw new Error(error instanceof Error ? error.message : "Erro ao excluir aluno")
    }
  }
  
  // Obter todos os alunos
  export const getAllStudents = async (): Promise<User[]> => {
    try {
      const studentsQuery = query(collection(db, "users"), where("role", "==", "student"))
      const querySnapshot = await getDocs(studentsQuery)
  
      const students: User[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        students.push({
          id: doc.id,
          name: data.name,
          email: data.email,
          role: data.role,
        })
      })
  
      return students
    } catch (error) {
      console.error("Erro ao obter alunos:", error)
      throw new Error(error instanceof Error ? error.message : "Erro ao obter alunos")
    }
  }
  
  // Enviar email de redefinição de senha
  export const sendPasswordReset = async (email: string): Promise<boolean> => {
    try {
      await sendPasswordResetEmail(auth, email)
      return true
    } catch (error) {
      console.error("Erro ao enviar email de redefinição de senha:", error)
      throw new Error(error instanceof Error ? error.message : "Erro ao enviar email de redefinição de senha")
    }
  }
  
  // Verificar se um email existe no Firebase Authentication
  export const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const usersRef = collection(db, "users")
      const q = query(usersRef, where("email", "==", email))
      const querySnapshot = await getDocs(q)
      return !querySnapshot.empty
    } catch (error) {
      console.error("Erro ao verificar email:", error)
      throw new Error(error instanceof Error ? error.message : "Erro ao verificar email")
    }
  }
  