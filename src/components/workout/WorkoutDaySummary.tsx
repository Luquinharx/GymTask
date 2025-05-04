"use client"

import type { FC } from "react"
import { useState, useEffect } from "react"
import { type Workout, daysOfWeekLabels, type DayOfWeek } from "../../types"
import ExerciseCard from "../exercise/ExerciseCard"
import { getExerciseById } from "../../data/mockData"
import { Check, Download, Award, Calendar, CalendarCheck, Loader2, Printer } from "lucide-react"
import html2canvas from "html2canvas"
import { getAllExercises } from "../../services/exerciseService"
import { getStudentById } from "../../services/studentService"
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"

// Definir estilos para o PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    width: 50,
    height: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
  },
  subtitle: {
    fontSize: 16,
    color: "#4b5563",
    marginBottom: 5,
  },
  infoContainer: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "bold",
    width: 100,
    color: "#4b5563",
  },
  infoValue: {
    fontSize: 12,
    color: "#1f2937",
  },
  table: {
    display: "table",
    width: "100%",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginTop: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableHeader: {
    backgroundColor: "#f3f4f6",
  },
  tableCell: {
    padding: 8,
    fontSize: 10,
  },
  exerciseCell: {
    width: "40%",
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
  },
  setsCell: {
    width: "15%",
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
    textAlign: "center",
  },
  repsCell: {
    width: "15%",
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
    textAlign: "center",
  },
  notesCell: {
    width: "30%",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 10,
    color: "#9ca3af",
  },
})

// Componente do PDF
const WorkoutPDF = ({
  workout,
  studentName,
  exercises,
}: {
  workout: Workout
  studentName: string
  exercises: Record<string, any>
}) => {
  const today = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>GymTask</Text>
            <Text style={styles.subtitle}>{workout.name || `Treino de ${daysOfWeekLabels[workout.dayOfWeek]}`}</Text>
          </View>
          {/* Logo placeholder - removido para evitar erros */}
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Aluno:</Text>
            <Text style={styles.infoValue}>{studentName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Dia:</Text>
            <Text style={styles.infoValue}>{daysOfWeekLabels[workout.dayOfWeek]}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Data:</Text>
            <Text style={styles.infoValue}>{today}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.exerciseCell]}>Exercício</Text>
            <Text style={[styles.tableCell, styles.setsCell]}>Séries</Text>
            <Text style={[styles.tableCell, styles.repsCell]}>Repetições</Text>
            <Text style={[styles.tableCell, styles.notesCell]}>Observações</Text>
          </View>

          {workout.exercises.map((ex) => (
            <View key={ex.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.exerciseCell]}>
                {exercises[ex.exerciseId]?.name || "Exercício não encontrado"}
              </Text>
              <Text style={[styles.tableCell, styles.setsCell]}>{ex.sets}</Text>
              <Text style={[styles.tableCell, styles.repsCell]}>{ex.reps}</Text>
              <Text style={[styles.tableCell, styles.notesCell]}>{ex.notes || "-"}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          Gerado por GymTask em {today} • www.gymtask.app • Todos os direitos reservados
        </Text>
      </Page>
    </Document>
  )
}

interface WorkoutDaySummaryProps {
  workout: Workout | null
  dayOfWeek: DayOfWeek
  isActive: boolean
  onClick: () => void
}

const WorkoutDaySummary: FC<WorkoutDaySummaryProps> = ({ workout, dayOfWeek, isActive, onClick }) => {
  const hasWorkout = workout !== null
  const exerciseCount = workout?.exercises.length || 0
  const completedCount = workout?.exercises.filter((ex) => ex.completed).length || 0
  const isCompleted = workout?.completed || false

  return (
    <div
      className={`
        cursor-pointer rounded-lg p-4 transition-all duration-200
        ${
          isActive
            ? "bg-blue-600 text-white shadow-md"
            : hasWorkout
              ? isCompleted
                ? "bg-green-600 text-white hover:bg-green-500"
                : "bg-gray-700 text-white hover:bg-gray-600"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
        }
      `}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <h3 className={`font-semibold ${isActive ? "text-white" : isCompleted ? "text-white" : "text-gray-200"}`}>
          {daysOfWeekLabels[dayOfWeek]}
        </h3>
        {isCompleted && <Check className="h-4 w-4 text-white" />}
      </div>
      {hasWorkout ? (
        <div className="mt-1">
          <span className={`text-sm ${isActive ? "text-blue-100" : isCompleted ? "text-green-200" : "text-blue-300"}`}>
            {completedCount}/{exerciseCount} {exerciseCount === 1 ? "exercício" : "exercícios"}
          </span>
        </div>
      ) : (
        <p className="text-sm mt-1">Sem treino</p>
      )}
    </div>
  )
}

interface WorkoutDetailsProps {
  workout: Workout | null
  dayOfWeek: DayOfWeek
  onToggleExerciseComplete?: (workoutId: string, exerciseId: string, completed: boolean) => void
  onCompleteWorkout?: (workoutId: string) => void
  showCompletionMessages?: boolean
  dailyCompleted?: boolean
  weeklyCompleted?: boolean
  monthlyCompleted?: boolean
}

export const WorkoutDetails: FC<WorkoutDetailsProps> = ({
  workout,
  dayOfWeek,
  onToggleExerciseComplete,
  onCompleteWorkout,
  showCompletionMessages = false,
  dailyCompleted = false,
  weeklyCompleted = false,
  monthlyCompleted = false,
}) => {
  const [exportLoading, setExportLoading] = useState(false)
  const [exercises, setExercises] = useState<Record<string, any>>({})
  const [isLoadingExercises, setIsLoadingExercises] = useState(false)
  const [studentName, setStudentName] = useState<string>("")
  const [pdfReady, setPdfReady] = useState(false)

  // Carregar exercícios do Firestore
  useEffect(() => {
    const loadExercises = async () => {
      if (!workout) return

      try {
        setIsLoadingExercises(true)
        const allExercises = await getAllExercises()

        // Converter para um objeto para acesso mais fácil
        const exercisesMap: Record<string, any> = {}
        allExercises.forEach((ex) => {
          exercisesMap[ex.id] = ex
        })

        setExercises(exercisesMap)

        // Carregar nome do aluno
        if (workout.studentId) {
          const student = await getStudentById(workout.studentId)
          if (student) {
            setStudentName(student.name)
          }
        }

        setPdfReady(true)
      } catch (error) {
        console.error("Erro ao carregar exercícios:", error)
      } finally {
        setIsLoadingExercises(false)
      }
    }

    loadExercises()
  }, [workout])

  if (!workout) {
    return (
      <div className="bg-gray-800 rounded-xl shadow p-6 text-center">
        <h3 className="text-xl font-semibold text-gray-300">Nenhum treino para {daysOfWeekLabels[dayOfWeek]}</h3>
        <p className="text-gray-400 mt-2">Aproveite o descanso!</p>
      </div>
    )
  }

  const allExercisesCompleted = workout.exercises.every((ex) => ex.completed)
  const someExercisesCompleted = workout.exercises.some((ex) => ex.completed)
  const completedCount = workout.exercises.filter((ex) => ex.completed).length

  const handleToggleExerciseComplete = (exerciseId: string, completed: boolean) => {
    if (onToggleExerciseComplete) {
      onToggleExerciseComplete(workout.id, exerciseId, completed)
    }
  }

  const handleCompleteWorkout = () => {
    if (onCompleteWorkout) {
      onCompleteWorkout(workout.id)
    }
  }

  const exportWorkoutImage = async () => {
    try {
      setExportLoading(true)
      const element = document.getElementById("workout-export")
      if (!element) return

      const canvas = await html2canvas(element, {
        backgroundColor: "#1f2937", // Cor de fundo escura
        scale: 2,
      })

      const dataUrl = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.download = `treino-${daysOfWeekLabels[dayOfWeek]}.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error("Erro ao exportar imagem:", error)
    } finally {
      setExportLoading(false)
    }
  }

  const today = new Date()
  const formattedDate = today.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

  // Função para obter informações do exercício
  const getExerciseInfo = (exerciseId: string) => {
    // Primeiro tenta buscar do estado carregado do Firestore
    if (exercises[exerciseId]) {
      return exercises[exerciseId]
    }

    // Fallback para os dados mockados
    return getExerciseById(exerciseId)
  }

  return (
    <div className="space-y-4">
      {/* Mensagens de conclusão */}
      {showCompletionMessages && (
        <>
          {dailyCompleted && (
            <div className="bg-green-900 border-l-4 border-green-500 p-4 rounded-xl flex items-center">
              <Award className="h-6 w-6 text-green-400 mr-3" />
              <div>
                <p className="font-medium text-green-300">Parabéns! Você concluiu o treino de hoje!</p>
                <p className="text-green-400 text-sm">Continue assim para alcançar seus objetivos.</p>
              </div>
            </div>
          )}

          {weeklyCompleted && (
            <div className="bg-blue-900 border-l-4 border-blue-500 p-4 rounded-xl flex items-center">
              <Calendar className="h-6 w-6 text-blue-400 mr-3" />
              <div>
                <p className="font-medium text-blue-300">Incrível! Você completou todos os treinos da semana!</p>
                <p className="text-blue-400 text-sm">Sua dedicação está rendendo frutos.</p>
              </div>
            </div>
          )}

          {monthlyCompleted && (
            <div className="bg-purple-900 border-l-4 border-purple-500 p-4 rounded-xl flex items-center">
              <CalendarCheck className="h-6 w-6 text-purple-400 mr-3" />
              <div>
                <p className="font-medium text-purple-300">Extraordinário! Você completou todos os treinos do mês!</p>
                <p className="text-purple-400 text-sm">Sua consistência é admirável!</p>
              </div>
            </div>
          )}
        </>
      )}

      <div className="bg-gray-800 rounded-xl shadow overflow-hidden">
        <div className="p-6 border-b border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-xl font-semibold text-white">
              {workout.name || `Treino de ${daysOfWeekLabels[dayOfWeek]}`}
            </h3>
            <p className="text-sm text-gray-300 mt-1">
              {completedCount}/{workout.exercises.length} exercícios concluídos
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportWorkoutImage}
              disabled={exportLoading}
              className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center disabled:bg-blue-800 disabled:opacity-70"
            >
              {exportLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-1" />
                  Exportar PNG
                </>
              )}
            </button>

            {/* Botão de exportação PDF */}
            {pdfReady && Object.keys(exercises).length > 0 && (
              <PDFDownloadLink
                document={<WorkoutPDF workout={workout} studentName={studentName || "Aluno"} exercises={exercises} />}
                fileName={`treino-${workout.name || daysOfWeekLabels[dayOfWeek]}.pdf`}
                className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
              >
                {({ loading }) =>
                  loading ? (
                    <>Preparando PDF...</>
                  ) : (
                    <>
                      <Printer className="h-4 w-4 mr-1" />
                      Exportar PDF
                    </>
                  )
                }
              </PDFDownloadLink>
            )}

            {!workout.completed && allExercisesCompleted && onCompleteWorkout && (
              <button
                onClick={handleCompleteWorkout}
                className="px-3 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center"
              >
                <Check className="h-4 w-4 mr-1" />
                Concluir Treino
              </button>
            )}
          </div>
        </div>

        {/* Área visível para exportação */}
        <div id="workout-export" className="p-6 bg-gray-800">
          <div className="mb-4 pb-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-center text-white">
              {workout.name || `Treino de ${daysOfWeekLabels[dayOfWeek]}`}
            </h2>
            <p className="text-center text-gray-400">{formattedDate}</p>
          </div>

          {isLoadingExercises ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
              <span className="ml-2 text-gray-300">Carregando exercícios...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {workout.exercises.map((workoutExercise) => {
                const exercise = getExerciseInfo(workoutExercise.exerciseId)
                if (!exercise) return null

                return (
                  <ExerciseCard
                    key={workoutExercise.id}
                    exercise={exercise}
                    workoutExercise={workoutExercise}
                    showDetails={true}
                    onToggleComplete={(id, completed) => handleToggleExerciseComplete(id, completed)}
                    isStudentView={true}
                  />
                )
              })}
            </div>
          )}
        </div>

        {/* Progresso do treino */}
        {someExercisesCompleted && !workout.completed && (
          <div className="p-4 bg-gray-700 border-t border-gray-600">
            <div className="w-full bg-gray-600 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${(completedCount / workout.exercises.length) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-300 mt-2 text-center">
              {completedCount} de {workout.exercises.length} exercícios concluídos
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default WorkoutDaySummary
