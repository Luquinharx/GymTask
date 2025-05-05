"use client"

import type React from "react"
import { useState } from "react"
import { X, AlertCircle } from "lucide-react"
import type { User } from "../../types"

interface StudentFormProps {
  student: User | null
  onSubmit: (student: Omit<User, "id" | "role">, password: string) => void
  onCancel: () => void
}

const StudentForm: React.FC<StudentFormProps> = ({ student, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<{
    name: string
    email: string
    generatePassword: boolean
    password: string
  }>({
    name: student?.name || "",
    email: student?.email || "",
    generatePassword: !student,
    password: student?.password || "",
  })

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const password = formData.generatePassword ? generateRandomPassword() : formData.password

    onSubmit(
      {
        name: formData.name,
        email: formData.email,
      },
      password,
    )
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full border border-gray-700">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">{student ? "Editar Aluno" : "Novo Aluno"}</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                Nome completo
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-700 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-700 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="generatePassword"
                name="generatePassword"
                checked={formData.generatePassword}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
              />
              <label htmlFor="generatePassword" className="ml-2 block text-sm text-gray-300">
                Gerar senha automaticamente
              </label>
            </div>

            {!formData.generatePassword && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Senha
                </label>
                <input
                  type="text"
                  id="password"
                  name="password"
                  required={!formData.generatePassword}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-700 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            )}

            <div className="bg-blue-900/30 border-l-4 border-blue-500 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-300">
                    {student
                      ? "As alterações serão salvas, mas o email não será reenviado automaticamente."
                      : "Um email será enviado ao aluno com as credenciais de acesso."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {student ? "Atualizar" : "Cadastrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StudentForm
