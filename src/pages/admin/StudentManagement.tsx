"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Header from "../../components/layout/Header"
import StudentForm from "../../components/student/StudentForm"
import type { User } from "../../types"
import { Plus, Mail, Edit, Trash2, Check, AlertCircle, Loader2, X, Search } from "lucide-react"
import {
  createStudent,
  getAllStudents,
  updateStudent,
  deleteStudent,
  sendPasswordReset,
} from "../../services/studentService"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "../../config/firebase"
import { useAuth } from "../../contexts/AuthContext"

const StudentManagement: React.FC = () => {
  const { currentUser } = useAuth()
  const [students, setStudents] = useState<User[]>([])
  const [filteredStudents, setFilteredStudents] = useState<User[]>([])
  const [showModal, setShowModal] = useState(false)
  const [currentStudent, setCurrentStudent] = useState<User | null>(null)
  const [showEmailSent, setShowEmailSent] = useState(false)
  const [sentToEmail, setSentToEmail] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionInProgress, setActionInProgress] = useState(false)
  const [adminCredentials, setAdminCredentials] = useState<{ email: string; password: string } | null>(null)
  const [showAdminCredentialsModal, setShowAdminCredentialsModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Carregar alunos do Firestore
  useEffect(() => {
    const loadStudents = async () => {
      try {
        setIsLoading(true)
        const loadedStudents = await getAllStudents()
        setStudents(loadedStudents)
        setFilteredStudents(loadedStudents)
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
    setCurrentStudent(null)
  }

  const openModal = (student?: User) => {
    if (student) {
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

  const handleAdminCredentialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setAdminCredentials((prev) => ({
      ...(prev || { email: "", password: "" }),
      [name]: value,
    }))
  }

  const handleSubmit = async (student: Omit<User, "id" | "role">, password: string) => {
    setActionInProgress(true)
    setError(null)

    try {
      // Salvar as credenciais do admin para reautenticação posterior
      if (currentUser && currentUser.email) {
        setAdminCredentials({
          email: currentUser.email,
          password: "",
        })
        setShowAdminCredentialsModal(true)
        return
      } else {
        await processStudentCreation(student, password)
      }
    } catch (err: any) {
      console.error("Erro ao salvar aluno:", err)
      setError(err.message || "Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.")
      setActionInProgress(false)
    }
  }

  const processStudentCreation = async (student: Omit<User, "id" | "role">, password: string) => {
    try {
      if (currentStudent) {
        // Atualizar aluno existente
        await updateStudent(currentStudent.id, {
          name: student.name,
          email: student.email,
        })

        // Atualizar estado local
        setStudents((prev) =>
          prev.map((s) => (s.id === currentStudent.id ? { ...s, name: student.name, email: student.email } : s)),
        )
        setFilteredStudents((prev) =>
          prev.map((s) => (s.id === currentStudent.id ? { ...s, name: student.name, email: student.email } : s)),
        )
      } else {
        // Criar novo aluno
        const newStudent = await createStudent(student.name, student.email, password)

        // Adicionar ao estado local
        setStudents((prev) => [...prev, newStudent])
        setFilteredStudents((prev) => [...prev, newStudent])

        // Mostrar notificação de email enviado
        setSentToEmail(student.email)
        setShowEmailSent(true)
        setTimeout(() => {
          setShowEmailSent(false)
        }, 5000)
      }

      closeModal()
    } catch (err: any) {
      console.error("Erro ao processar aluno:", err)
      setError(err.message || "Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.")
    } finally {
      setActionInProgress(false)
      setShowAdminCredentialsModal(false)
    }
  }

  const handleAdminReauthentication = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!adminCredentials || !adminCredentials.email || !adminCredentials.password) {
      setError("Por favor, forneça suas credenciais de administrador.")
      return
    }

    try {
      // Reautenticar o admin
      await signInWithEmailAndPassword(auth, adminCredentials.email, adminCredentials.password)

      // Prosseguir com a criação do aluno
      if (currentStudent && showModal) {
        // Não temos os dados do formulário aqui, então precisamos fechar o modal de reautenticação
        // e deixar o usuário continuar com o formulário
        setShowAdminCredentialsModal(false)
        setActionInProgress(false)
      } else {
        setShowAdminCredentialsModal(false)
        // Não podemos prosseguir sem os dados do formulário
        setActionInProgress(false)
      }
    } catch (err: any) {
      console.error("Erro na reautenticação:", err)
      setError("Falha na autenticação. Verifique suas credenciais e tente novamente.")
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
        setFilteredStudents((prev) => prev.filter((s) => s.id !== id))
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase()
    setSearchTerm(term)

    if (!term.trim()) {
      setFilteredStudents(students)
      return
    }

    const filtered = students.filter(
      (student) => student.name.toLowerCase().includes(term) || student.email.toLowerCase().includes(term),
    )

    setFilteredStudents(filtered)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header title="Gerenciamento de Alunos" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Meus Alunos</h2>

          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar alunos..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full sm:w-64"
              />
            </div>

            <button
              onClick={() => openModal()}
              disabled={actionInProgress}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
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
        </div>

        {/* Alerta de erro */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <div>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Alerta de email enviado */}
        {showEmailSent && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-center">
            <Check className="h-5 w-5 text-green-500 mr-2" />
            <div>
              <p className="text-green-700">
                Credenciais enviadas com sucesso para <span className="font-medium">{sentToEmail}</span>
              </p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="bg-white shadow-lg rounded-xl p-6 text-center">
            <Loader2 className="h-8 w-8 text-blue-600 mx-auto animate-spin" />
            <p className="mt-2 text-gray-500">Carregando alunos...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-white shadow-lg rounded-xl p-6 text-center">
            <p className="text-gray-500">
              {searchTerm ? "Nenhum aluno encontrado para esta busca." : "Nenhum aluno cadastrado."}
            </p>
          </div>
        ) : (
          <div className="bg-white shadow-lg overflow-hidden rounded-xl">
            <div className="overflow-x-auto">
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
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
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
                            className="text-blue-600 hover:text-blue-900 disabled:text-blue-300 disabled:cursor-not-allowed transition-colors p-1 rounded-full hover:bg-blue-50"
                            title="Reenviar credenciais"
                          >
                            <Mail className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => openModal(student)}
                            disabled={actionInProgress}
                            className="text-indigo-600 hover:text-indigo-900 disabled:text-indigo-300 disabled:cursor-not-allowed transition-colors p-1 rounded-full hover:bg-indigo-50"
                            title="Editar"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(student.id)}
                            disabled={actionInProgress}
                            className="text-red-600 hover:text-red-900 disabled:text-red-300 disabled:cursor-not-allowed transition-colors p-1 rounded-full hover:bg-red-50"
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
          </div>
        )}
      </main>

      {/* Modal de cadastro/edição */}
      {showModal && <StudentForm student={currentStudent} onSubmit={handleSubmit} onCancel={closeModal} />}

      {/* Modal de reautenticação do admin */}
      {showAdminCredentialsModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">Confirme suas credenciais</h3>
              <button
                onClick={() => {
                  setShowAdminCredentialsModal(false)
                  setActionInProgress(false)
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAdminReauthentication} className="px-6 py-4">
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Para manter sua sessão ativa enquanto criamos um novo aluno, por favor confirme suas credenciais de
                  administrador.
                </p>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={adminCredentials?.email || ""}
                    onChange={handleAdminCredentialsChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Senha
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    value={adminCredentials?.password || ""}
                    onChange={handleAdminCredentialsChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminCredentialsModal(false)
                    setActionInProgress(false)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionInProgress}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center"
                >
                  {actionInProgress && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Confirmar
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
