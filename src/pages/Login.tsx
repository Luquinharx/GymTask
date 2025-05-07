"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

// Importar a fonte Orbitron do Google Fonts
import "@fontsource/orbitron/400.css"
import "@fontsource/orbitron/700.css"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login, currentUser } = useAuth()
  const navigate = useNavigate()

  // Verificar se já existe um usuário logado
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
      const user = await login(email, password)
      navigate(user.role === "admin" ? "/admin" : "/student")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao fazer login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop')",
        backgroundBlendMode: "overlay",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <div className="absolute inset-0 backdrop-blur-sm bg-black/30"></div>

      <div className="relative max-w-md w-full space-y-8 p-8 rounded-xl overflow-hidden">
        {/* Container para o efeito holográfico e o conteúdo */}
        <div className="relative">
          {/* Borda holográfica animada */}
          <div className="absolute -inset-0.5 rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-border-flow opacity-75"></div>
          </div>

          {/* Fundo preto fosco */}
          <div className="relative bg-black/70 backdrop-blur-sm rounded-xl p-8">
            <div className="text-center">
              <div className="flex justify-center">
                <img src="/logo.png" alt="GymTask Logo" className="h-16 w-16" />
              </div>
              <h2 className="mt-6 text-4xl font-extrabold text-white tracking-tight font-orbitron">GymTask</h2>
              <p className="mt-2 text-sm text-gray-300">Seu treino personalizado na palma da mão</p>
            </div>

            {error && (
              <div className="mt-4 bg-red-900/50 border-l-4 border-red-500 p-4 rounded-md">
                <p className="text-red-200">{error}</p>
              </div>
            )}

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
                    className="appearance-none rounded-t-md relative block w-full px-3 py-3 border border-gray-600 placeholder-gray-400 text-white bg-gray-800/70 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
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
                    className="appearance-none rounded-b-md relative block w-full px-3 py-3 border border-gray-600 placeholder-gray-400 text-white bg-gray-800/70 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
                  defaultChecked={true}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                  Manter conectado
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 transition-colors duration-200"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Entrando...
                    </span>
                  ) : (
                    "Entrar"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
