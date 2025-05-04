"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Header from "../../components/layout/Header"
import type { User } from "../../types"
import { Plus, Mail, Edit, Trash2, Check, AlertCircle, Loader2, X } from "lucide-react"
import {
  createStudent,
  getAllStudents,
  updateStudent,
  deleteStudent,
  sendPasswordReset,
} from "../../services/studentService"

const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<User[]>([])
  const [showModal, setShowModal] = useState(false)
  const [currentStudent, setCurrentStudent] = useState<User | null>(null)
  const [showEmailSent, setShowEmailSent] = useState(false)
  const [sentToEmail, setSentToEmail] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionInProgress, setActionInProgress] = useState(false)

  // Form state
  const [formData, setFormData] = useState<{
    name: string
    email: string
    generatePassword: boolean
    password: string
  }>({
    name: "",
    email: "",
    generatePassword: true,
    password: "",
  })

  // Carregar alunos do Firestore
  useEffect(() => {
    const loadStudents = async () => {
      try {
        setIsLoading(true)
        const loadedStudents = await getAllStudents()
        setStudents(loadedStudents)
      } catch (err) {
        console.error("Erro ao carregar alunos:", err)
        setError("Não foi possível carregar os alunos. Por favor, tente novamente.")
      } finally {
        setIsLoading(false)
      }
    }

    loadStudents()
  }, [])

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      generatePassword: true,
      password: "",
    })
    setCurrentStudent(null)
  }

  const openModal = (student?: User) => {
    if (student) {
      setFormData({
        name: student.name,
        email: student.email,
        generatePassword: false,
        password: "",
      })
      setCurrentStudent(student)
    } else {
      resetForm()
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionInProgress(true)
    setError(null)

    try {
      const password = formData.generatePassword ? generateRandomPassword() : formData.password

      if (currentStudent) {
        // Atualizar aluno existente
        await updateStudent(currentStudent.id, {
          name: formData.name,
          email: formData.email,
        })

        // Atualizar estado local
        setStudents((prev) =>
          prev.map((s) => (s.id === currentStudent.id ? { ...s, name: formData.name, email: formData.email } : s)),
        )
      } else {
        // Criar novo aluno
        const newStudent = await createStudent(formData.name, formData.email, password)

        // Adicionar ao estado local
        setStudents((prev) => [...prev, newStudent])

        // Mostrar notificação de email enviado
        setSentToEmail(formData.email)
        setShowEmailSent(true)
        setTimeout(() => {
          setShowEmailSent(false)
        }, 5000)
      }

      closeModal()
    } catch (err: any) {
      console.error("Erro ao salvar aluno:", err)
      setError(err.message || "Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.")
    } finally {
      setActionInProgress(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este aluno? Esta ação não pode ser desfeita.")) {
      setActionInProgress(true)
      try {
        await deleteStudent(id)

        // Atualizar estado local
        setStudents((prev) => prev.filter((s) => s.id !== id))
      } catch (err) {
        console.error("Erro ao excluir aluno:", err)
        setError("Falha ao excluir aluno. Por favor, tente novamente.")
      } finally {
        setActionInProgress(false)
      }
    }
  }

  const handleResendCredentials = async (email: string) => {
    setActionInProgress(true)
    try {
      await sendPasswordReset(email)
      setSentToEmail(email)
      setShowEmailSent(true)
      setTimeout(() => {
        setShowEmailSent(false)
      }, 5000)
    } catch (err) {
      console.error("Erro ao enviar email:", err)
      setError("Falha ao enviar email. Por favor, tente novamente.")
    } finally {
      setActionInProgress(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Gerenciamento de Alunos" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Meus Alunos</h2>

          <button
            onClick={() => openModal()}
            disabled={actionInProgress}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {actionInProgress ? (
              <>
                <Loader2 className="h-5 w-5 mr-1 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Plus className="h-5 w-5 mr-1" />
                Novo Aluno
              </>
            )}
          </button>
        </div>

        {/* Alerta de erro */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <div>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Alerta de email enviado */}
        {showEmailSent && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md flex items-center">
            <Check className="h-5 w-5 text-green-500 mr-2" />
            <div>
              <p className="text-green-700">
                Credenciais enviadas com sucesso para <span className="font-medium">{sentToEmail}</span>
              </p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <Loader2 className="h-8 w-8 text-blue-600 mx-auto animate-spin" />
            <p className="mt-2 text-gray-500">Carregando alunos...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-500">Nenhum aluno cadastrado.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Nome
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .substring(0, 2)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Ativo
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => handleResendCredentials(student.email)}
                          disabled={actionInProgress}
                          className="text-blue-600 hover:text-blue-900 disabled:text-blue-300 disabled:cursor-not-allowed"
                          title="Reenviar credenciais"
                        >
                          <Mail className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => openModal(student)}
                          disabled={actionInProgress}
                          className="text-indigo-600 hover:text-indigo-900 disabled:text-indigo-300 disabled:cursor-not-allowed"
                          title="Editar"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
                          disabled={actionInProgress}
                          className="text-red-600 hover:text-red-900 disabled:text-red-300 disabled:cursor-not-allowed"
                          title="Excluir"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modal de cadastro/edição */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">{currentStudent ? "Editar Aluno" : "Novo Aluno"}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nome completo
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                {!currentStudent && (
                  <>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="generatePassword"
                        name="generatePassword"
                        checked={formData.generatePassword}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="generatePassword" className="ml-2 block text-sm text-gray-700">
                        Gerar senha automaticamente
                      </label>
                    </div>

                    {!formData.generatePassword && (
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                          Senha
                        </label>
                        <input
                          type="text"
                          id="password"
                          name="password"
                          required={!formData.generatePassword}
                          value={formData.password}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                    )}
                  </>
                )}

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        {currentStudent
                          ? "As alterações serão salvas no sistema."
                          : "Um email será enviado ao aluno com as credenciais de acesso."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={actionInProgress}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionInProgress}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center"
                >
                  {actionInProgress && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {currentStudent ? "Atualizar" : "Cadastrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentManagement
