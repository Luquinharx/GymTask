"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth"
import { auth, db } from "../config/firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"
import type { User } from "../types"

interface AuthContextType {
  currentUser: User | null
  login: (email: string, password: string) => Promise<User>
  logout: () => void
  loading: boolean
  error: string | null
  adminCredentials: { email: string; password: string } | null
  setAdminCredentials: (credentials: { email: string; password: string } | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Chave para armazenar o usuário no localStorage
const USER_STORAGE_KEY = "gymtask_user"

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [adminCredentials, setAdminCredentials] = useState<{ email: string; password: string } | null>(null)

  // Carregar usuário do localStorage ao iniciar
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(USER_STORAGE_KEY)
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser))
      }
    } catch (e) {
      console.error("Erro ao carregar usuário do localStorage:", e)
    }
  }, [])

  useEffect(() => {
    // Configurar persistência do Firebase Auth
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error("Erro ao configurar persistência:", error)
    })

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Buscar dados adicionais do usuário no Firestore
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))

          if (userDoc.exists()) {
            // Se o documento existe, use os dados do Firestore
            const userData = userDoc.data()
            const user: User = {
              id: firebaseUser.uid,
              name: userData.name || firebaseUser.displayName || "Usuário",
              email: userData.email || firebaseUser.email || "",
              role: userData.role || "student",
            }
            setCurrentUser(user)

            // Salvar no localStorage para persistência
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
          } else {
            // Se não existe documento no Firestore, use apenas os dados do Auth
            // Verificar se é o email do admin
            const isAdmin = firebaseUser.email === "lucasmartinsa3009@gmail.com"

            const user: User = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || "Usuário",
              email: firebaseUser.email || "",
              role: isAdmin ? "admin" : "student",
            }

            // Criar o documento no Firestore para este usuário
            try {
              await setDoc(doc(db, "users", firebaseUser.uid), {
                ...user,
                createdAt: new Date().toISOString(),
              })
              console.log("Documento do usuário criado no Firestore")
            } catch (docError) {
              console.error("Erro ao criar documento do usuário:", docError)
            }

            setCurrentUser(user)

            // Salvar no localStorage para persistência
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
          }
        } catch (error) {
          console.error("Erro ao buscar dados do usuário:", error)
          setError("Erro ao carregar dados do usuário")
          // Em caso de erro, fazer logout para evitar estado inconsistente
          await firebaseSignOut(auth)
          setCurrentUser(null)
          localStorage.removeItem(USER_STORAGE_KEY)
        }
      } else {
        setCurrentUser(null)
        localStorage.removeItem(USER_STORAGE_KEY)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const login = async (email: string, password: string): Promise<User> => {
    try {
      // Configurar persistência antes do login
      await setPersistence(auth, browserLocalPersistence)

      const result = await signInWithEmailAndPassword(auth, email, password)

      // Buscar dados adicionais do usuário no Firestore
      const userDoc = await getDoc(doc(db, "users", result.user.uid))

      if (userDoc.exists()) {
        // Se o documento existe, use os dados do Firestore
        const userData = userDoc.data()
        const user: User = {
          id: result.user.uid,
          name: userData.name || result.user.displayName || "Usuário",
          email: userData.email || result.user.email || "",
          role: userData.role || "student",
        }

        // Salvar no localStorage para persistência
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))

        // Salvar credenciais do admin se for admin
        if (user.role === "admin") {
          setAdminCredentials({ email, password })
        }

        return user
      } else {
        // Fallback para o comportamento anterior
        const isAdmin = email === "lucasmartinsa3009@gmail.com"
        const user: User = {
          id: result.user.uid,
          name: result.user.displayName || "Usuário",
          email: result.user.email || "",
          role: isAdmin ? "admin" : "student",
        }

        // Criar o documento no Firestore para este usuário
        try {
          await setDoc(doc(db, "users", result.user.uid), {
            ...user,
            createdAt: new Date().toISOString(),
          })
          console.log("Documento do usuário criado no Firestore durante login")
        } catch (docError) {
          console.error("Erro ao criar documento do usuário durante login:", docError)
        }

        // Salvar no localStorage para persistência
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))

        // Salvar credenciais do admin se for admin
        if (user.role === "admin") {
          setAdminCredentials({ email, password })
        }

        return user
      }
    } catch (error: any) {
      console.error("Erro de login:", error)

      // Mensagens de erro mais específicas
      if (error.code === "auth/user-not-found") {
        throw new Error("Usuário não encontrado. Verifique seu email.")
      } else if (error.code === "auth/wrong-password") {
        throw new Error("Senha incorreta. Tente novamente ou redefina sua senha.")
      } else if (error.code === "auth/too-many-requests") {
        throw new Error("Muitas tentativas de login. Tente novamente mais tarde ou redefina sua senha.")
      } else if (error.code === "auth/invalid-credential") {
        throw new Error("Credenciais inválidas. Verifique seu email e senha.")
      } else {
        throw new Error("Erro ao fazer login: " + (error.message || "Tente novamente mais tarde"))
      }
    }
  }

  const logout = async () => {
    try {
      await firebaseSignOut(auth)
      setCurrentUser(null)
      setAdminCredentials(null)
      localStorage.removeItem(USER_STORAGE_KEY)
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

  const value = {
    currentUser,
    login,
    logout,
    loading,
    error,
    adminCredentials,
    setAdminCredentials,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
