"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Header from "../../components/layout/Header"
import StudentForm from "../../components/student/StudentForm"
import type { User } from "../../types"
import { Plus, Mail, Edit, Trash2, Check, AlertCircle, Loader2, Search, Home, UsersIcon } from "lucide-react"
import {
  createStudent,
  getAllStudents,
  updateStudent,
  deleteStudent,
  sendPasswordReset,
  checkEmailExists,
} from "../../services/studentService"
import { useAuth } from "../../contexts/AuthContext"
import { Link } from "react-router-dom"

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
  const [searchTerm, setSearchTerm] = useState("")
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [newStudentName, setNewStudentName] = useState("")

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

  const handleSubmit = async (student: Omit<User, "id" | "role">, password: string) => {
    setActionInProgress(true)
    setError(null)

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
        // Verificar se o email já existe antes de criar
        const emailExists = await checkEmailExists(student.email)
        if (emailExists) {
          setError("Este email já está em uso. Por favor, use outro email.")
          setActionInProgress(false)
          return
        }

        // Criar novo aluno
        const newStudent = await createStudent(student.name, student.email, password)

        // Adicionar ao estado local
        setStudents((prev) => [...prev, newStudent])
        setFilteredStudents((prev) => [...prev, newStudent])

        // Mostrar modal de sucesso
        setNewStudentName(student.name)
        setShowSuccessModal(true)

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

      // Mensagens de erro mais amigáveis
      if (err.message.includes("EMAIL_EXISTS")) {
        setError("Este email já está em uso. Por favor, use outro email.")
      } else if (err.message.includes("INVALID_EMAIL")) {
        setError("O endereço de email é inválido. Por favor, verifique e tente novamente.")
      } else if (err.message.includes("WEAK_PASSWORD")) {
        setError("A senha é muito fraca. Use pelo menos 6 caracteres.")
      } else if (err.message.includes("recipient address is empty")) {
        setError("O endereço de email está vazio ou é inválido. Por favor, verifique e tente novamente.")
      } else {
        setError(err.message || "Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.")
      }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <Header title="Gerenciamento de Alunos" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-4 sm:mb-0">Meus Alunos</h2>

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
                className="pl-10 pr-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full sm:w-64"
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
          <div className="mb-6 bg-red-900/50 border-l-4 border-red-500 p-4 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <div>
              <p className="text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Alerta de email enviado */}
        {showEmailSent && (
          <div className="mb-6 bg-green-900/50 border-l-4 border-green-500 p-4 rounded-lg flex items-center">
            <Check className="h-5 w-5 text-green-500 mr-2" />
            <div>
              <p className="text-green-300">
                Credenciais enviadas com sucesso para <span className="font-medium">{sentToEmail}</span>
              </p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="bg-gray-800 shadow-lg rounded-xl p-6 text-center">
            <Loader2 className="h-8 w-8 text-blue-600 mx-auto animate-spin" />
            <p className="mt-2 text-gray-400">Carregando alunos...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-gray-800 shadow-lg rounded-xl p-6 text-center">
            <p className="text-gray-400">
              {searchTerm ? "Nenhum aluno encontrado para esta busca." : "Nenhum aluno cadastrado."}
            </p>
          </div>
        ) : (
          <div className="bg-gray-800 shadow-lg overflow-hidden rounded-xl">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      Nome
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-700 transition-colors">
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
                            <div className="text-sm font-medium text-white">{student.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{student.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900 text-green-300">
                          Ativo
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => handleResendCredentials(student.email)}
                            disabled={actionInProgress}
                            className="text-blue-400 hover:text-blue-300 disabled:text-blue-600 disabled:cursor-not-allowed transition-colors p-1 rounded-full hover:bg-blue-900"
                            title="Reenviar credenciais"
                          >
                            <Mail className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => openModal(student)}
                            disabled={actionInProgress}
                            className="text-indigo-400 hover:text-indigo-300 disabled:text-indigo-600 disabled:cursor-not-allowed transition-colors p-1 rounded-full hover:bg-indigo-900"
                            title="Editar"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(student.id)}
                            disabled={actionInProgress}
                            className="text-red-400 hover:text-red-300 disabled:text-red-600 disabled:cursor-not-allowed transition-colors p-1 rounded-full hover:bg-red-900"
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

      {/* Modal de sucesso ao criar aluno */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6 border border-gray-700">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-green-900/50 p-3 rounded-full">
                <Check className="h-8 w-8 text-green-400" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-white text-center mb-2">Aluno Criado com Sucesso!</h3>
            <p className="text-gray-300 text-center mb-6">
              O aluno <span className="font-medium text-white">{newStudentName}</span> foi cadastrado e as credenciais
              foram enviadas por email.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/admin"
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center justify-center"
              >
                <Home className="h-4 w-4 mr-2" />
                Ir para Home
              </Link>

              <button
                onClick={() => setShowSuccessModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center"
              >
                <UsersIcon className="h-4 w-4 mr-2" />
                Continuar Gerenciando Alunos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentManagement
