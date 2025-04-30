"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Dumbbell, Loader2, AlertCircle, Check } from "lucide-react"
import { sendPasswordReset, checkEmailExists } from "../services/firebaseService"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)
  const [showResetForm, setShowResetForm] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState("")
  const { login, currentUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (currentUser) {
      navigate(currentUser.role === "admin" ? "/admin" : "/student")
    }
  }, [currentUser, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      console.log(`Tentando login com: ${email}`)
      const user = await login(email, password)
      console.log("Login bem-sucedido:", user)
      navigate(user.role === "admin" ? "/admin" : "/student")
    } catch (err) {
      console.error("Erro no login:", err)
      setError(err instanceof Error ? err.message : "Falha ao fazer login")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetError("")
    setResetLoading(true)

    try {
      // Verificar se o email existe antes de enviar o reset
      const emailExists = await checkEmailExists(resetEmail)

      if (!emailExists) {
        setResetError("Email não encontrado no sistema. Verifique se digitou corretamente.")
        setResetLoading(false)
        return
      }

      await sendPasswordReset(resetEmail)
      setResetEmailSent(true)
      setTimeout(() => {
        setShowResetForm(false)
        setResetEmailSent(false)
        setResetEmail("")
      }, 5000)
    } catch (err) {
      setResetError(err instanceof Error ? err.message : "Falha ao enviar email de recuperação")
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-blue-500 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-2xl transform transition-all hover:scale-[1.01]">
        <div className="text-center">
          <div className="flex justify-center">
            <Dumbbell className="h-16 w-16 text-indigo-600" />
          </div>
          <h2 className="mt-6 text-4xl font-extrabold text-gray-900 tracking-tight">GymTask</h2>
          <p className="mt-2 text-sm text-gray-600">Seu treino personalizado na palma da mão</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {!showResetForm ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none rounded-t-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Senha
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-b-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowResetForm(true)}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Esqueceu sua senha?
              </button>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 transition-colors duration-200"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Entrando...
                  </span>
                ) : (
                  "Entrar"
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-8 space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Recuperar senha</h3>
            <p className="text-sm text-gray-600">
              Digite seu email abaixo e enviaremos um link para redefinir sua senha.
            </p>

            {resetEmailSent && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <p className="text-green-700">
                  Email de recuperação enviado com sucesso! Verifique sua caixa de entrada.
                </p>
              </div>
            )}

            {resetError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                <p className="text-red-700">{resetError}</p>
              </div>
            )}

            <form onSubmit={handleResetPassword}>
              <div>
                <label htmlFor="reset-email" className="sr-only">
                  Email
                </label>
                <input
                  id="reset-email"
                  name="reset-email"
                  type="email"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Seu email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
              </div>

              <div className="mt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowResetForm(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                >
                  {resetLoading ? (
                    <span className="flex items-center">
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                      Enviando...
                    </span>
                  ) : (
                    "Enviar"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default Login
