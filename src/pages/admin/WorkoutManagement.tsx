"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Header from "../../components/layout/Header"
import {
  type Workout,
  type WorkoutExercise,
  type User,
  type WorkoutTemplate,
  daysOfWeek,
  daysOfWeekLabels,
  type Exercise,
  type DayOfWeek,
} from "../../types"
import { Plus, X, Trash2, Edit, Save, Loader2, AlertCircle, Copy, Users } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import {
  getAllWorkouts,
  addWorkout,
  updateWorkout,
  deleteWorkout,
  saveWorkoutAsTemplate,
  getAllWorkoutTemplates,
  duplicateWorkoutForStudent,
} from "../../services/workoutService"
import { getAllStudents } from "../../services/studentService"
import { getAllExercises } from "../../services/exerciseService"

const WorkoutManagement: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [students, setStudents] = useState<User[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([])
  const [selectedStudent, setSelectedStudent] = useState<string>("")
  const [showModal, setShowModal] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)
  const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [duplicateData, setDuplicateData] = useState<{
    workoutId: string
    studentId: string
    dayOfWeek: DayOfWeek
  }>({
    workoutId: "",
    studentId: "",
    dayOfWeek: "monday",
  })

  // Form state
  const [formData, setFormData] = useState({
    studentId: "",
    name: "",
    dayOfWeek: "monday" as const,
    exercises: [] as WorkoutExercise[],
  })

  // Template form state
  const [templateFormData, setTemplateFormData] = useState({
    name: "",
    description: "",
  })

  // Adicionar estado para controlar quais alunos estão expandidos
  const [expandedStudents, setExpandedStudents] = useState<Record<string, boolean>>({})

  // Carregar dados do Firestore
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)

        // Carregar treinos
        const loadedWorkouts = await getAllWorkouts()
        setWorkouts(loadedWorkouts)

        // Carregar alunos
        const loadedStudents = await getAllStudents()
        setStudents(loadedStudents)

        // Carregar exercícios
        const loadedExercises = await getAllExercises()
        setExercises(loadedExercises)

        // Carregar templates
        const loadedTemplates = await getAllWorkoutTemplates()
        setTemplates(loadedTemplates)
      } catch (err) {
        console.error("Erro ao carregar dados:", err)
        setError("Não foi possível carregar os dados. Por favor, tente novamente.")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const resetForm = () => {
    setFormData({
      studentId: selectedStudent || "",
      name: "",
      dayOfWeek: "monday",
      exercises: [],
    })
    setCurrentWorkout(null)
    setSelectedTemplate("")
  }

  const filterWorkoutsByStudent = () => {
    if (!selectedStudent) return workouts
    return workouts.filter((workout) => workout.studentId === selectedStudent)
  }

  const openModal = (workout?: Workout) => {
    if (workout) {
      setFormData({
        studentId: workout.studentId,
        name: workout.name || "",
        dayOfWeek: workout.dayOfWeek,
        exercises: [...workout.exercises],
      })
      setCurrentWorkout(workout)
    } else {
      resetForm()
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }

  const openTemplateModal = () => {
    setTemplateFormData({
      name: formData.name || "",
      description: "",
    })
    setShowTemplateModal(true)
  }

  const closeTemplateModal = () => {
    setShowTemplateModal(false)
  }

  const openDuplicateModal = (workout: Workout) => {
    setDuplicateData({
      workoutId: workout.id,
      studentId: "",
      dayOfWeek: "monday",
    })
    setShowDuplicateModal(true)
  }

  const closeDuplicateModal = () => {
    setShowDuplicateModal(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleDuplicateInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setDuplicateData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleTemplateInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setTemplateFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleTemplateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value

    if (!templateId) {
      return
    }

    const template = templates.find((t) => t.id === templateId)

    if (template) {
      setFormData((prev) => ({
        ...prev,
        name: template.name,
        exercises: [...template.exercises],
      }))

      setSelectedTemplate(templateId)
    }
  }

  const handleAddExercise = () => {
    const newExercise: WorkoutExercise = {
      id: uuidv4(),
      exerciseId: "",
      sets: 3,
      reps: 12,
      notes: "",
    }

    setFormData((prev) => ({
      ...prev,
      exercises: [...prev.exercises, newExercise],
    }))
  }

  const handleRemoveExercise = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((ex) => ex.id !== id),
    }))
  }

  const handleExerciseChange = (id: string, field: keyof WorkoutExercise, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex) => {
        if (ex.id === id) {
          return { ...ex, [field]: value }
        }
        return ex
      }),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Validar formulário
      if (!formData.studentId) {
        alert("Por favor, selecione um aluno")
        setIsSaving(false)
        return
      }

      if (!formData.name) {
        alert("Por favor, dê um nome ao treino")
        setIsSaving(false)
        return
      }

      if (formData.exercises.length === 0) {
        alert("Por favor, adicione pelo menos um exercício")
        setIsSaving(false)
        return
      }

      if (formData.exercises.some((ex) => !ex.exerciseId)) {
        alert("Por favor, selecione todos os exercícios")
        setIsSaving(false)
        return
      }

      // Verificar se já existe um treino para este dia
      const existingWorkoutIndex = workouts.findIndex(
        (w) =>
          w.studentId === formData.studentId &&
          w.dayOfWeek === formData.dayOfWeek &&
          (!currentWorkout || w.id !== currentWorkout.id),
      )

      if (existingWorkoutIndex !== -1 && !currentWorkout) {
        if (confirm("Já existe um treino para este dia. Deseja substituí-lo?")) {
          // Substituir treino existente
          const existingWorkout = workouts[existingWorkoutIndex]

          await updateWorkout(existingWorkout.id, {
            name: formData.name,
            exercises: formData.exercises,
          })

          // Atualizar estado local
          const newWorkouts = [...workouts]
          newWorkouts[existingWorkoutIndex] = {
            ...newWorkouts[existingWorkoutIndex],
            name: formData.name,
            exercises: formData.exercises,
          }

          setWorkouts(newWorkouts)
          closeModal()
          return
        } else {
          setIsSaving(false)
          return // Usuário cancelou
        }
      }

      if (currentWorkout) {
        // Atualizar treino existente
        await updateWorkout(currentWorkout.id, {
          name: formData.name,
          exercises: formData.exercises,
        })

        // Atualizar estado local
        setWorkouts((prev) =>
          prev.map((w) =>
            w.id === currentWorkout.id
              ? {
                  ...w,
                  name: formData.name,
                  exercises: formData.exercises,
                }
              : w,
          ),
        )
      } else {
        // Criar novo treino
        const newWorkoutData = {
          studentId: formData.studentId,
          name: formData.name,
          dayOfWeek: formData.dayOfWeek,
          exercises: formData.exercises,
        }

        const newWorkout = await addWorkout(newWorkoutData)

        // Adicionar ao estado local
        setWorkouts((prev) => [...prev, newWorkout])
      }

      closeModal()
    } catch (err) {
      console.error("Erro ao salvar treino:", err)
      setError("Não foi possível salvar o treino. Por favor, tente novamente.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      if (!templateFormData.name) {
        alert("Por favor, dê um nome ao template")
        setIsSaving(false)
        return
      }

      // Criar template
      const templateData: Omit<WorkoutTemplate, "id"> = {
        name: templateFormData.name,
        description: templateFormData.description,
        exercises: formData.exercises,
        createdAt: new Date().toISOString(),
        createdBy: "admin", // Idealmente, usar o ID do usuário atual
      }

      const newTemplate = await saveWorkoutAsTemplate(templateData)

      // Adicionar ao estado local
      setTemplates((prev) => [...prev, newTemplate])

      closeTemplateModal()

      // Mostrar mensagem de sucesso
      alert("Template salvo com sucesso!")
    } catch (err) {
      console.error("Erro ao salvar template:", err)
      setError("Não foi possível salvar o template. Por favor, tente novamente.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDuplicateWorkout = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      if (!duplicateData.studentId) {
        alert("Por favor, selecione um aluno")
        setIsSaving(false)
        return
      }

      // Verificar se já existe um treino para este dia
      const existingWorkout = workouts.find(
        (w) => w.studentId === duplicateData.studentId && w.dayOfWeek === duplicateData.dayOfWeek,
      )

      if (existingWorkout) {
        if (!confirm("Já existe um treino para este dia. Deseja substituí-lo?")) {
          setIsSaving(false)
          return // Usuário cancelou
        }
        // Excluir o treino existente
        await deleteWorkout(existingWorkout.id)
        // Atualizar estado local
        setWorkouts((prev) => prev.filter((w) => w.id !== existingWorkout.id))
      }

      // Duplicar o treino
      const newWorkout = await duplicateWorkoutForStudent(
        duplicateData.workoutId,
        duplicateData.studentId,
        duplicateData.dayOfWeek,
      )

      if (newWorkout) {
        // Adicionar ao estado local
        setWorkouts((prev) => [...prev, newWorkout])
      }

      closeDuplicateModal()

      // Mostrar mensagem de sucesso
      alert("Treino duplicado com sucesso!")
    } catch (err) {
      console.error("Erro ao duplicar treino:", err)
      setError("Não foi possível duplicar o treino. Por favor, tente novamente.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteWorkout = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este treino?")) {
      try {
        await deleteWorkout(id)

        // Atualizar estado local
        setWorkouts((prev) => prev.filter((w) => w.id !== id))
      } catch (err) {
        console.error("Erro ao excluir treino:", err)
        setError("Não foi possível excluir o treino. Por favor, tente novamente.")
      }
    }
  }

  const getStudentName = (id: string) => {
    const student = students.find((s) => s.id === id)
    return student ? student.name : "Aluno Desconhecido"
  }

  const getExerciseName = (id: string) => {
    const exercise = exercises.find((ex) => ex.id === id)
    return exercise ? exercise.name : "Exercício Desconhecido"
  }

  const toggleStudent = (studentId: string) => {
    setExpandedStudents((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }))
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header title="Gerenciamento de Treinos" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-4 sm:mb-0">Treinos Semanais</h2>

            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-4">
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="block w-full sm:w-64 pl-3 pr-10 py-2 text-base border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">Todos os Alunos</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => openModal()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-5 w-5 mr-1" />
                Novo Treino
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-900 border-l-4 border-red-500 p-4 rounded-md">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
              <span className="ml-2 text-gray-300">Carregando treinos...</span>
            </div>
          ) : filterWorkoutsByStudent().length === 0 ? (
            <div className="bg-gray-700 shadow rounded-lg p-6 text-center">
              <p className="text-gray-400">
                {selectedStudent ? "Nenhum treino encontrado para este aluno." : "Nenhum treino cadastrado."}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {selectedStudent
                ? // Group workouts by day for selected student
                  daysOfWeek
                    .map((day) => {
                      const workout = filterWorkoutsByStudent().find((w) => w.dayOfWeek === day)

                      if (!workout) return null

                      return (
                        <div key={day} className="bg-gray-700 shadow rounded-lg overflow-hidden">
                          <div className="px-6 py-4 border-b border-gray-600 flex justify-between items-center">
                            <div>
                              <h3 className="text-lg font-medium text-white">{daysOfWeekLabels[day]}</h3>
                              {workout.name && <p className="text-sm text-gray-300">{workout.name}</p>}
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openDuplicateModal(workout)}
                                className="p-1 text-purple-400 hover:text-purple-300"
                                title="Duplicar para outro aluno"
                              >
                                <Copy className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => openModal(workout)}
                                className="p-1 text-blue-400 hover:text-blue-300"
                                title="Editar"
                              >
                                <Edit className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteWorkout(workout.id)}
                                className="p-1 text-red-400 hover:text-red-300"
                                title="Excluir"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                          <div className="px-6 py-4">
                            <div className="border border-gray-600 rounded-md overflow-hidden">
                              <table className="min-w-full divide-y divide-gray-600">
                                <thead className="bg-gray-800">
                                  <tr>
                                    <th
                                      scope="col"
                                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                                    >
                                      Exercício
                                    </th>
                                    <th
                                      scope="col"
                                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                                    >
                                      Séries
                                    </th>
                                    <th
                                      scope="col"
                                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                                    >
                                      Repetições
                                    </th>
                                    <th
                                      scope="col"
                                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                                    >
                                      Observações
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-gray-700 divide-y divide-gray-600">
                                  {workout.exercises.map((ex) => (
                                    <tr key={ex.id}>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                        {getExerciseName(ex.exerciseId)}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{ex.sets}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{ex.reps}</td>
                                      <td className="px-6 py-4 text-sm text-gray-300 max-w-xs truncate">
                                        {ex.notes || "-"}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )
                    })
                    .filter(Boolean)
                : // Group workouts by student
                  (() => {
                    return students
                      .map((student) => {
                        const studentWorkouts = filterWorkoutsByStudent().filter((w) => w.studentId === student.id)

                        if (studentWorkouts.length === 0) return null

                        const isExpanded = expandedStudents[student.id] || false

                        return (
                          <div key={student.id} className="bg-gray-700 shadow rounded-lg overflow-hidden mb-4">
                            <div
                              className="px-6 py-4 border-b border-gray-600 flex justify-between items-center cursor-pointer hover:bg-gray-600"
                              onClick={() => toggleStudent(student.id)}
                            >
                              <h3 className="text-lg font-medium text-white">{student.name}</h3>
                              <div className="flex items-center">
                                <span className="text-gray-300 mr-2">{studentWorkouts.length} treinos</span>
                                <svg
                                  className={`w-5 h-5 text-gray-300 transform transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="px-6 py-4">
                                <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                  {daysOfWeek.map((day) => {
                                    const workout = studentWorkouts.find((w) => w.dayOfWeek === day)

                                    return (
                                      <div key={day} className="border border-gray-600 rounded-md p-4 bg-gray-800">
                                        <div className="flex justify-between items-center mb-3">
                                          <h4 className="font-medium text-white">{daysOfWeekLabels[day]}</h4>
                                          {workout ? (
                                            <div className="flex space-x-1">
                                              <button
                                                onClick={() => openDuplicateModal(workout)}
                                                className="p-1 text-purple-400 hover:text-purple-300"
                                                title="Duplicar para outro aluno"
                                              >
                                                <Copy className="h-4 w-4" />
                                              </button>
                                              <button
                                                onClick={() => openModal(workout)}
                                                className="p-1 text-blue-400 hover:text-blue-300"
                                                title="Editar"
                                              >
                                                <Edit className="h-4 w-4" />
                                              </button>
                                              <button
                                                onClick={() => handleDeleteWorkout(workout.id)}
                                                className="p-1 text-red-400 hover:text-red-300"
                                                title="Excluir"
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </button>
                                            </div>
                                          ) : (
                                            <button
                                              onClick={() => {
                                                setFormData({
                                                  studentId: student.id,
                                                  name: "",
                                                  dayOfWeek: day,
                                                  exercises: [],
                                                })
                                                openModal()
                                              }}
                                              className="p-1 text-blue-400 hover:text-blue-300"
                                              title="Adicionar"
                                            >
                                              <Plus className="h-4 w-4" />
                                            </button>
                                          )}
                                        </div>

                                        {workout ? (
                                          <div className="text-sm text-gray-300">
                                            {workout.name && <p className="font-medium text-white">{workout.name}</p>}
                                            <p>{workout.exercises.length} exercícios</p>
                                            <ul className="mt-2 list-disc list-inside text-xs">
                                              {workout.exercises.slice(0, 3).map((ex) => (
                                                <li key={ex.id} className="truncate">
                                                  {getExerciseName(ex.exerciseId)}
                                                </li>
                                              ))}
                                              {workout.exercises.length > 3 && (
                                                <li className="text-gray-400">+ {workout.exercises.length - 3} mais</li>
                                              )}
                                            </ul>
                                          </div>
                                        ) : (
                                          <p className="text-sm text-gray-400">Sem treino</p>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })
                      .filter(Boolean)
                  })()}
            </div>
          )}
        </div>
      </main>

      {/* Modal de Treino */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">{currentWorkout ? "Editar Treino" : "Novo Treino"}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-300">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4">
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="studentId" className="block text-sm font-medium text-gray-300">
                      Aluno
                    </label>
                    <select
                      id="studentId"
                      name="studentId"
                      required
                      value={formData.studentId}
                      onChange={handleInputChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      disabled={!!currentWorkout} // Can't change student for existing workout
                    >
                      <option value="" disabled>
                        Selecione um aluno
                      </option>
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="dayOfWeek" className="block text-sm font-medium text-gray-300">
                      Dia da Semana
                    </label>
                    <select
                      id="dayOfWeek"
                      name="dayOfWeek"
                      required
                      value={formData.dayOfWeek}
                      onChange={handleInputChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      disabled={!!currentWorkout} // Can't change day for existing workout
                    >
                      {daysOfWeek.map((day) => (
                        <option key={day} value={day}>
                          {daysOfWeekLabels[day]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                    Nome do Treino
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ex: Treino A - Peito e Tríceps"
                    className="mt-1 block w-full border border-gray-600 bg-gray-700 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                {templates.length > 0 && (
                  <div>
                    <label htmlFor="template" className="block text-sm font-medium text-gray-300">
                      Usar Template (opcional)
                    </label>
                    <select
                      id="template"
                      value={selectedTemplate}
                      onChange={handleTemplateSelect}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="">Selecione um template</option>
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-base font-medium text-white">Exercícios</h4>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={openTemplateModal}
                        disabled={formData.exercises.length === 0}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-200 bg-green-800 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Salvar como Template
                      </button>
                      <button
                        type="button"
                        onClick={handleAddExercise}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-200 bg-blue-800 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar Exercício
                      </button>
                    </div>
                  </div>

                  {formData.exercises.length === 0 ? (
                    <div className="border border-dashed border-gray-600 rounded-md p-6 text-center">
                      <p className="text-gray-400">
                        Nenhum exercício adicionado. Clique em "Adicionar Exercício" para começar.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.exercises.map((exercise, index) => (
                        <div key={exercise.id} className="border border-gray-600 rounded-md p-4 bg-gray-700">
                          <div className="flex justify-between items-center mb-3">
                            <h5 className="text-sm font-medium text-white">Exercício {index + 1}</h5>
                            <button
                              type="button"
                              onClick={() => handleRemoveExercise(exercise.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div className="sm:col-span-2">
                              <label
                                htmlFor={`exercise-${exercise.id}`}
                                className="block text-xs font-medium text-gray-300"
                              >
                                Exercício
                              </label>
                              <select
                                id={`exercise-${exercise.id}`}
                                value={exercise.exerciseId}
                                onChange={(e) => handleExerciseChange(exercise.id, "exerciseId", e.target.value)}
                                required
                                className="mt-1 block w-full pl-3 pr-10 py-1.5 text-base border-gray-600 bg-gray-800 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                              >
                                <option value="" disabled>
                                  Selecione um exercício
                                </option>
                                {exercises.map((ex) => (
                                  <option key={ex.id} value={ex.id}>
                                    {ex.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label
                                htmlFor={`sets-${exercise.id}`}
                                className="block text-xs font-medium text-gray-300"
                              >
                                Séries
                              </label>
                              <input
                                type="number"
                                id={`sets-${exercise.id}`}
                                value={exercise.sets}
                                onChange={(e) =>
                                  handleExerciseChange(exercise.id, "sets", Number.parseInt(e.target.value))
                                }
                                min="1"
                                required
                                className="mt-1 block w-full pl-3 pr-3 py-1.5 text-base border-gray-600 bg-gray-800 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                              />
                            </div>

                            <div>
                              <label
                                htmlFor={`reps-${exercise.id}`}
                                className="block text-xs font-medium text-gray-300"
                              >
                                Repetições
                              </label>
                              <input
                                type="number"
                                id={`reps-${exercise.id}`}
                                value={exercise.reps}
                                onChange={(e) =>
                                  handleExerciseChange(exercise.id, "reps", Number.parseInt(e.target.value))
                                }
                                min="1"
                                required
                                className="mt-1 block w-full pl-3 pr-3 py-1.5 text-base border-gray-600 bg-gray-800 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                              />
                            </div>

                            <div className="sm:col-span-4">
                              <label
                                htmlFor={`notes-${exercise.id}`}
                                className="block text-xs font-medium text-gray-300"
                              >
                                Observações
                              </label>
                              <input
                                type="text"
                                id={`notes-${exercise.id}`}
                                value={exercise.notes || ""}
                                onChange={(e) => handleExerciseChange(exercise.id, "notes", e.target.value)}
                                className="mt-1 block w-full pl-3 pr-3 py-1.5 text-base border-gray-600 bg-gray-800 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-800 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : currentWorkout ? (
                    "Atualizar"
                  ) : (
                    "Criar"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Template */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Salvar como Template</h3>
              <button onClick={closeTemplateModal} className="text-gray-400 hover:text-gray-300">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="templateName" className="block text-sm font-medium text-gray-300">
                    Nome do Template
                  </label>
                  <input
                    type="text"
                    id="templateName"
                    name="name"
                    required
                    value={templateFormData.name}
                    onChange={handleTemplateInputChange}
                    placeholder="Ex: Treino A - Peito e Tríceps"
                    className="mt-1 block w-full border border-gray-600 bg-gray-700 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="templateDescription" className="block text-sm font-medium text-gray-300">
                    Descrição (opcional)
                  </label>
                  <textarea
                    id="templateDescription"
                    name="description"
                    rows={3}
                    value={templateFormData.description}
                    onChange={handleTemplateInputChange}
                    placeholder="Descreva o objetivo deste treino"
                    className="mt-1 block w-full border border-gray-600 bg-gray-700 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div className="bg-gray-900 border-l-4 border-yellow-500 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-300">
                        Este template poderá ser reutilizado para criar novos treinos rapidamente.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeTemplateModal}
                  className="px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-800 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Template"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Duplicação de Treino */}
      {showDuplicateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Duplicar Treino para Outro Aluno</h3>
              <button onClick={closeDuplicateModal} className="text-gray-400 hover:text-gray-300">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleDuplicateWorkout} className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="studentId" className="block text-sm font-medium text-gray-300">
                    Aluno Destino
                  </label>
                  <div className="mt-1 flex items-center">
                    <Users className="h-5 w-5 text-gray-400 mr-2" />
                    <select
                      id="studentId"
                      name="studentId"
                      required
                      value={duplicateData.studentId}
                      onChange={handleDuplicateInputChange}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="" disabled>
                        Selecione um aluno
                      </option>
                      {students
                        .filter((s) => {
                          const workout = workouts.find((w) => w.id === duplicateData.workoutId)
                          return workout ? s.id !== workout.studentId : true
                        })
                        .map((student) => (
                          <option key={student.id} value={student.id}>
                            {student.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="dayOfWeek" className="block text-sm font-medium text-gray-300">
                    Dia da Semana
                  </label>
                  <select
                    id="dayOfWeek"
                    name="dayOfWeek"
                    required
                    value={duplicateData.dayOfWeek}
                    onChange={handleDuplicateInputChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    {daysOfWeek.map((day) => (
                      <option key={day} value={day}>
                        {daysOfWeekLabels[day]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-gray-900 border-l-4 border-blue-500 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-300">
                        O treino será duplicado exatamente como está, incluindo todos os exercícios, séries e
                        repetições.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeDuplicateModal}
                  className="px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-800 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Duplicando...
                    </>
                  ) : (
                    "Duplicar Treino"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default WorkoutManagement
