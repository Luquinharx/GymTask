"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged } from "firebase/auth"
import { auth } from "../config/firebase"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../config/firebase"
import type { User } from "../types"
import { ensureAdminExists } from "../services/firebaseService"

interface AuthContextType {
  currentUser: User | null
  login: (email: string, password: string) => Promise<User>
  logout: () => void
  loading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

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

  // Configuração inicial - garantir que o admin existe
  useEffect(() => {
    const setupAdmin = async () => {
      try {
        // Substitua por uma senha forte real em produção
        await ensureAdminExists("lucasmartinsa3009@gmail.com", "leoleobr3", "Administrador")
      } catch (error) {
        console.error("Erro ao configurar admin:", error)
      }
    }

    setupAdmin()
  }, [])

  useEffect(() => {
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
              await doc(db, "users", firebaseUser.uid).set({
                ...user,
                createdAt: new Date().toISOString(),
              })
              console.log("Documento do usuário criado no Firestore")
            } catch (docError) {
              console.error("Erro ao criar documento do usuário:", docError)
            }

            setCurrentUser(user)
          }
        } catch (error) {
          console.error("Erro ao buscar dados do usuário:", error)
          setError("Erro ao carregar dados do usuário")
        }
      } else {
        setCurrentUser(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const login = async (email: string, password: string): Promise<User> => {
    try {
      console.log(`Tentando login com email: ${email}`)
      const result = await signInWithEmailAndPassword(auth, email, password)
      console.log("Login bem-sucedido, UID:", result.user.uid)

      // Buscar dados adicionais do usuário no Firestore
      const userDoc = await getDoc(doc(db, "users", result.user.uid))

      if (userDoc.exists()) {
        // Se o documento existe, use os dados do Firestore
        const userData = userDoc.data()
        console.log("Dados do usuário encontrados no Firestore:", userData)

        const user: User = {
          id: result.user.uid,
          name: userData.name || result.user.displayName || "Usuário",
          email: userData.email || result.user.email || "",
          role: userData.role || "student",
        }
        return user
      } else {
        console.log("Documento do usuário não encontrado no Firestore, verificando se é admin")

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
          await doc(db, "users", result.user.uid).set({
            ...user,
            createdAt: new Date().toISOString(),
          })
          console.log("Documento do usuário criado no Firestore durante login")
        } catch (docError) {
          console.error("Erro ao criar documento do usuário durante login:", docError)
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
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
