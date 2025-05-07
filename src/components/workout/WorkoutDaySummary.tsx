"use client"

import type { FC } from "react"
import { useState, useEffect } from "react"
import { type Workout, daysOfWeekLabels, type DayOfWeek, type ExerciseHistory } from "../../types"
import { getExerciseById } from "../../data/mockData"
import {
  Check,
  Download,
  Award,
  Calendar,
  CalendarCheck,
  Loader2,
  Printer,
  Star,
  Trophy,
  X,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import html2canvas from "html2canvas"
import { getAllExercises } from "../../services/exerciseService"
import { getStudentById } from "../../services/studentService"
import { getExerciseHistory } from "../../services/workoutService"
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

// Componente de confete para celebração
const Confetti = ({ count = 50 }) => {
  const confetti = Array.from({ length: count }).map((_, i) => {
    const size = Math.random() * 10 + 5
    const left = Math.random() * 100
    const delay = Math.random() * 3
    const duration = Math.random() * 3 + 2
    const color = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-orange-500",
    ][Math.floor(Math.random() * 8)]

    return (
      <div
        key={i}
        className={`absolute ${color} rounded-md animate-confetti`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          left: `${left}%`,
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
        }}
      />
    )
  })

  return <div className="fixed inset-0 pointer-events-none overflow-hidden">{confetti}</div>
}

// Componente de celebração
const CelebrationModal = ({
  type,
  onClose,
}: {
  type: "daily" | "weekly" | "monthly"
  onClose: () => void
}) => {
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false)
    }, 4000)

    return () => clearTimeout(timer)
  }, [])

  const messages = {
    daily: {
      title: "Treino Concluído!",
      message: "Você completou seu treino de hoje. Continue assim!",
      icon: <Award className="h-16 w-16 text-yellow-400" />,
      color: "from-green-600 to-green-800",
    },
    weekly: {
      title: "Semana Perfeita!",
      message: "Você completou todos os treinos da semana. Que dedicação incrível!",
      icon: <Trophy className="h-16 w-16 text-yellow-400" />,
      color: "from-blue-600 to-blue-800",
    },
    monthly: {
      title: "Meta Mensal Alcançada!",
      message: "Um mês inteiro de treinos completos. Você é extraordinário!",
      icon: <Star className="h-16 w-16 text-yellow-400" />,
      color: "from-purple-600 to-purple-800",
    },
  }

  const { title, message, icon, color } = messages[type]

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>

      {showConfetti && <Confetti />}

      <div
        className={`relative bg-gradient-to-br ${color} p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-celebration`}
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-white/70 hover:text-white">
          <X className="h-6 w-6" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="bg-white/20 p-6 rounded-full mb-4">{icon}</div>

          <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
          <p className="text-white/90 mb-6">{message}</p>

          <div className="flex space-x-2 justify-center">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-white text-gray-900 font-medium rounded-lg hover:bg-white/90 transition-colors"
            >
              Continuar
            </button>

            <button
              onClick={() => {
                // Compartilhar nas redes sociais (simulado)
                alert("Compartilhamento nas redes sociais seria implementado aqui!")
                onClose()
              }}
              className="px-6 py-2 bg-white/20 text-white font-medium rounded-lg hover:bg-white/30 transition-colors"
            >
              Compartilhar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente para avaliação de intensidade
const IntensityRating: FC<{ value: number; onChange: (value: number) => void }> = ({ value, onChange }) => {
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`focus:outline-none ${star <= value ? "text-yellow-500" : "text-gray-400"}`}
        >
          <Star className={`h-6 w-6 ${star <= value ? "fill-current" : ""}`} />
        </button>
      ))}
    </div>
  )
}

// Componente para mostrar o histórico de um exercício
const ExerciseHistoryPanel: FC<{
  history: ExerciseHistory[]
  exerciseName: string
}> = ({ history, exerciseName }) => {
  const [isOpen, setIsOpen] = useState(false)

  if (history.length === 0) {
    return null
  }

  // Ordenar por data, do mais recente para o mais antigo
  const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const lastSession = sortedHistory[0]

  return (
    <div className="mt-2 bg-gray-800 rounded-lg border border-gray-700">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-3 text-left focus:outline-none"
      >
        <div className="flex items-center">
          <Info className="h-4 w-4 text-blue-400 mr-2" />
          <span className="text-sm text-gray-300">
            Último treino: {new Date(lastSession.date).toLocaleDateString("pt-BR")}
          </span>
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
      </button>

      {isOpen && (
        <div className="p-3 pt-0 border-t border-gray-700">
          <h5 className="text-sm font-medium text-gray-300 mb-2">Histórico de {exerciseName}</h5>
          <div className="space-y-2">
            {sortedHistory.slice(0, 3).map((record, index) => (
              <div key={index} className="bg-gray-700 p-2 rounded text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">{new Date(record.date).toLocaleDateString("pt-BR")}</span>
                  <span className="text-blue-400 font-medium">{record.weight} kg</span>
                </div>
                <div className="mt-1">
                  <span className="text-gray-400">Repetições: </span>
                  <span className="text-gray-300">
                    {record.repsPerSet.map((reps, i) => `${i + 1}ª: ${reps}`).join(", ")}
                  </span>
                </div>
              </div>
            ))}

            {sortedHistory.length > 3 && (
              <button
                className="text-xs text-blue-400 hover:text-blue-300 mt-1"
                onClick={() => alert("Histórico completo seria exibido aqui")}
              >
                Ver histórico completo
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface WorkoutDetailsProps {
  workout: Workout | null
  dayOfWeek: DayOfWeek
  onToggleExerciseComplete?: (workoutId: string, exerciseId: string, completed: boolean) => void
  onCompleteWorkout?: (workoutId: string) => void
  onUpdateWorkoutIntensity?: (workoutId: string, intensity: number) => void
  onUpdateExerciseWeight?: (workoutId: string, exerciseId: string, weight: number) => void
  onUpdateExerciseReps?: (workoutId: string, exerciseId: string, setIndex: number, reps: number) => void
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
  onUpdateWorkoutIntensity,
  onUpdateExerciseWeight,
  onUpdateExerciseReps,
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
  const [showCelebration, setShowCelebration] = useState<"daily" | "weekly" | "monthly" | null>(null)
  const [workoutIntensity, setWorkoutIntensity] = useState<number>(workout?.intensity || 0)
  const [exerciseWeights, setExerciseWeights] = useState<Record<string, number>>({})
  const [exerciseReps, setExerciseReps] = useState<Record<string, number[]>>({})
  const [exerciseHistory, setExerciseHistory] = useState<Record<string, ExerciseHistory[]>>({})

  // Verificar se deve mostrar celebração
  useEffect(() => {
    if (monthlyCompleted) {
      setShowCelebration("monthly")
    } else if (weeklyCompleted) {
      setShowCelebration("weekly")
    } else if (dailyCompleted) {
      setShowCelebration("daily")
    }
  }, [dailyCompleted, weeklyCompleted, monthlyCompleted])

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

        // Inicializar pesos e repetições
        const weights: Record<string, number> = {}
        const reps: Record<string, number[]> = {}
        const history: Record<string, ExerciseHistory[]> = {}

        // Para cada exercício, carregar o histórico
        for (const ex of workout.exercises) {
          weights[ex.id] = ex.weight || 0
          reps[ex.id] = ex.repsPerSet || Array(ex.sets).fill(ex.reps)

          // Carregar histórico do exercício
          if (workout.studentId) {
            try {
              const exerciseHistoryData = await getExerciseHistory(workout.studentId, ex.exerciseId)
              history[ex.id] = exerciseHistoryData
            } catch (error) {
              console.error(`Erro ao carregar histórico do exercício ${ex.exerciseId}:`, error)
              history[ex.id] = []
            }
          }
        }

        setExerciseWeights(weights)
        setExerciseReps(reps)
        setExerciseHistory(history)
        setWorkoutIntensity(workout.intensity || 0)

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

  // Verificar se todos os exercícios foram concluídos e concluir o treino automaticamente
  useEffect(() => {
    if (workout && !workout.completed && onCompleteWorkout) {
      const allExercisesCompleted = workout.exercises.every((ex) => ex.completed)
      if (allExercisesCompleted) {
        onCompleteWorkout(workout.id)
      }
    }
  }, [workout, onCompleteWorkout])

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

  const handleIntensityChange = (intensity: number) => {
    setWorkoutIntensity(intensity)
    if (onUpdateWorkoutIntensity) {
      onUpdateWorkoutIntensity(workout.id, intensity)
    }
  }

  const handleWeightChange = (exerciseId: string, weight: number) => {
    setExerciseWeights((prev) => ({ ...prev, [exerciseId]: weight }))
    if (onUpdateExerciseWeight) {
      onUpdateExerciseWeight(workout.id, exerciseId, weight)
    }
  }

  const handleRepsChange = (exerciseId: string, setIndex: number, reps: number) => {
    setExerciseReps((prev) => {
      const newReps = { ...prev }
      if (!newReps[exerciseId]) {
        const exercise = workout.exercises.find((ex) => ex.id === exerciseId)
        newReps[exerciseId] = Array(exercise?.sets || 0).fill(exercise?.reps || 0)
      }
      newReps[exerciseId][setIndex] = reps
      return newReps
    })

    if (onUpdateExerciseReps) {
      onUpdateExerciseReps(workout.id, exerciseId, setIndex, reps)
    }
  }

  // Função para exportar imagem no estilo PDF
  const exportPdfStyleImage = async () => {
    try {
      setExportLoading(true)

      // Criar um elemento temporário para estilizar como PDF
      const tempDiv = document.createElement("div")
      tempDiv.style.position = "absolute"
      tempDiv.style.left = "-9999px"
      tempDiv.style.top = "-9999px"
      tempDiv.style.width = "800px"
      tempDiv.style.backgroundColor = "white"
      tempDiv.style.padding = "40px"
      tempDiv.style.fontFamily = "Arial, sans-serif"

      // Adicionar cabeçalho
      const header = document.createElement("div")
      header.style.display = "flex"
      header.style.justifyContent = "space-between"
      header.style.marginBottom = "20px"
      header.style.borderBottom = "2px solid #333"
      header.style.paddingBottom = "10px"

      const titleDiv = document.createElement("div")

      const title = document.createElement("h1")
      title.textContent = "GymTask - Ficha de Treino"
      title.style.fontSize = "24px"
      title.style.fontWeight = "bold"
      title.style.color = "#333"
      titleDiv.appendChild(title)

      const logo = document.createElement("img")
      logo.src = "/logo.png"
      logo.style.width = "50px"
      logo.style.height = "50px"
      logo.style.objectFit = "contain"

      header.appendChild(titleDiv)
      header.appendChild(logo)

      // Adicionar informações do aluno
      const studentInfo = document.createElement("div")
      studentInfo.style.marginBottom = "20px"

      const studentTitle = document.createElement("h2")
      studentTitle.textContent = "Aluno:"
      studentTitle.style.fontSize = "16px"
      studentTitle.style.fontWeight = "bold"

      const studentNameElem = document.createElement("p")
      studentNameElem.textContent = studentName || "Aluno"
      studentNameElem.style.fontSize = "16px"

      studentInfo.appendChild(studentTitle)
      studentInfo.appendChild(studentNameElem)

      // Adicionar informações do treino
      const workoutInfo = document.createElement("div")
      workoutInfo.style.marginBottom = "20px"

      const workoutTitle = document.createElement("h2")
      workoutTitle.textContent = workout.name || `Treino de ${daysOfWeekLabels[dayOfWeek]}`
      workoutTitle.style.fontSize = "18px"
      workoutTitle.style.fontWeight = "bold"
      workoutTitle.style.marginBottom = "10px"

      workoutInfo.appendChild(workoutTitle)

      // Criar tabela de exercícios
      const table = document.createElement("table")
      table.style.width = "100%"
      table.style.borderCollapse = "collapse"
      table.style.marginBottom = "20px"

      // Cabeçalho da tabela
      const thead = document.createElement("thead")
      const headerRow = document.createElement("tr")
      headerRow.style.backgroundColor = "#f3f3f3"

      const headers = ["Exercício", "Séries", "Repetições", "Peso (kg)", "Observações"]
      headers.forEach((headerText) => {
        const th = document.createElement("th")
        th.textContent = headerText
        th.style.padding = "8px"
        th.style.border = "1px solid #ddd"
        th.style.textAlign = "left"
        headerRow.appendChild(th)
      })

      thead.appendChild(headerRow)
      table.appendChild(thead)

      // Corpo da tabela
      const tbody = document.createElement("tbody")

      workout.exercises.forEach((ex) => {
        const tr = document.createElement("tr")

        // Exercício
        const tdExercise = document.createElement("td")
        tdExercise.textContent = exercises[ex.exerciseId]?.name || "Exercício não encontrado"
        tdExercise.style.padding = "8px"
        tdExercise.style.border = "1px solid #ddd"
        tr.appendChild(tdExercise)

        // Séries
        const tdSets = document.createElement("td")
        tdSets.textContent = ex.sets.toString()
        tdSets.style.padding = "8px"
        tdSets.style.border = "1px solid #ddd"
        tr.appendChild(tdSets)

        // Repetições
        const tdReps = document.createElement("td")
        tdReps.textContent = ex.reps.toString()
        tdReps.style.padding = "8px"
        tdReps.style.border = "1px solid #ddd"
        tr.appendChild(tdReps)

        // Peso
        const tdWeight = document.createElement("td")
        tdWeight.textContent = exerciseWeights[ex.id]?.toString() || "0"
        tdWeight.style.padding = "8px"
        tdWeight.style.border = "1px solid #ddd"
        tr.appendChild(tdWeight)

        // Observações
        const tdNotes = document.createElement("td")
        tdNotes.textContent = ex.notes || "-"
        tdNotes.style.padding = "8px"
        tdNotes.style.border = "1px solid #ddd"
        tr.appendChild(tdNotes)

        tbody.appendChild(tr)
      })

      table.appendChild(tbody)

      // Adicionar rodapé
      const footer = document.createElement("div")
      footer.style.borderTop = "1px solid #ddd"
      footer.style.paddingTop = "10px"
      footer.style.fontSize = "12px"
      footer.style.color = "#666"
      footer.style.textAlign = "center"
      footer.textContent = `Gerado por GymTask em ${new Date().toLocaleDateString("pt-BR")} • www.gymtask.app • Todos os direitos reservados`

      // Montar o documento
      tempDiv.appendChild(header)
      tempDiv.appendChild(studentInfo)
      tempDiv.appendChild(workoutInfo)
      tempDiv.appendChild(table)
      tempDiv.appendChild(footer)

      // Adicionar ao documento para renderização
      document.body.appendChild(tempDiv)

      // Capturar como imagem
      const canvas = await html2canvas(tempDiv, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        imageTimeout: 0,
      })

      // Remover o elemento temporário
      document.body.removeChild(tempDiv)

      // Converter para PNG e fazer download
      const dataUrl = canvas.toDataURL("image/png", 1.0)
      const link = document.createElement("a")
      link.download = `treino-${workout.name || daysOfWeekLabels[dayOfWeek]}.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error("Erro ao exportar imagem:", error)
      alert("Não foi possível exportar a imagem. Por favor, tente novamente.")
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
      {/* Mensagens de celebração */}
      {showCelebration && <CelebrationModal type={showCelebration} onClose={() => setShowCelebration(null)} />}

      {/* Mensagens de conclusão (agora como notificações menores) */}
      {showCompletionMessages && (
        <>
          {dailyCompleted && !showCelebration && (
            <div className="bg-green-900 border-l-4 border-green-500 p-4 rounded-xl flex items-center">
              <Award className="h-6 w-6 text-green-400 mr-3" />
              <div>
                <p className="font-medium text-green-300">Parabéns! Você concluiu o treino de hoje!</p>
                <p className="text-green-400 text-sm">Continue assim para alcançar seus objetivos.</p>
              </div>
            </div>
          )}

          {weeklyCompleted && !showCelebration && (
            <div className="bg-blue-900 border-l-4 border-blue-500 p-4 rounded-xl flex items-center">
              <Calendar className="h-6 w-6 text-blue-400 mr-3" />
              <div>
                <p className="font-medium text-blue-300">Incrível! Você completou todos os treinos da semana!</p>
                <p className="text-blue-400 text-sm">Sua dedicação está rendendo frutos.</p>
              </div>
            </div>
          )}

          {monthlyCompleted && !showCelebration && (
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
            {/* Botão de exportação PDF-style renomeado para Foto */}
            <button
              onClick={exportPdfStyleImage}
              disabled={exportLoading}
              className="px-3 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center disabled:bg-green-800 disabled:opacity-70"
            >
              {exportLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-1" />
                  Exportar Foto
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
          </div>
        </div>

        {/* Área visível para exportação no estilo normal */}
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
            <div className="space-y-4">
              {workout.exercises.map((workoutExercise) => {
                const exercise = getExerciseInfo(workoutExercise.exerciseId)
                if (!exercise) return null

                return (
                  <div key={workoutExercise.id} className="bg-gray-700 rounded-md p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Foto do exercício */}
                      {exercise.imageUrl && (
                        <div className="w-full md:w-1/3 lg:w-1/4">
                          <img
                            src={exercise.imageUrl || "/placeholder.svg"}
                            alt={exercise.name}
                            className="w-full h-48 object-cover rounded-md"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg?height=200&width=200"
                              e.currentTarget.alt = "Imagem não disponível"
                            }}
                          />
                        </div>
                      )}

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="text-lg font-medium text-white">{exercise.name}</h4>
                            {/* Ênfase nas séries e repetições */}
                            <div className="mt-2 bg-blue-900 rounded-md p-2 inline-block">
                              <p className="text-blue-100 font-semibold">
                                {workoutExercise.sets} séries x {workoutExercise.reps} repetições
                              </p>
                            </div>
                            <p className="text-gray-400 text-sm mt-2">{exercise.instructions}</p>
                          </div>
                          <button
                            onClick={() => handleToggleExerciseComplete(workoutExercise.id, !workoutExercise.completed)}
                            className={`rounded-full h-8 w-8 flex items-center justify-center ${
                              workoutExercise.completed
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-gray-600 hover:bg-gray-500"
                            } transition-colors`}
                          >
                            {workoutExercise.completed ? (
                              <Check className="h-5 w-5 text-white" />
                            ) : (
                              <div className="h-3 w-3 rounded-full bg-gray-800"></div>
                            )}
                          </button>
                        </div>

                        {/* Histórico do exercício */}
                        {exerciseHistory[workoutExercise.id] && exerciseHistory[workoutExercise.id].length > 0 && (
                          <ExerciseHistoryPanel
                            history={exerciseHistory[workoutExercise.id]}
                            exerciseName={exercise.name}
                          />
                        )}

                        {/* Novos campos para peso e repetições - Redesenhados */}
                        <div className="mt-4 border-t border-gray-600 pt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Campo de peso */}
                            <div className="bg-gray-800 rounded-lg p-3">
                              <label className="block text-gray-300 text-sm font-medium mb-2">Peso (kg):</label>
                              <div className="flex items-center">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  value={exerciseWeights[workoutExercise.id] || 0}
                                  onChange={(e) =>
                                    handleWeightChange(workoutExercise.id, Number.parseFloat(e.target.value))
                                  }
                                  className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <span className="ml-2 text-gray-400">kg</span>
                              </div>
                            </div>

                            {/* Repetições por série */}
                            <div className="bg-gray-800 rounded-lg p-3">
                              <label className="block text-gray-300 text-sm font-medium mb-2">
                                Repetições por série:
                              </label>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                {Array.from({ length: workoutExercise.sets }).map((_, index) => (
                                  <div key={index} className="flex items-center">
                                    <span className="text-gray-400 text-sm mr-2">Série {index + 1}:</span>
                                    <input
                                      type="number"
                                      min="0"
                                      value={(exerciseReps[workoutExercise.id] || [])[index] || workoutExercise.reps}
                                      onChange={(e) =>
                                        handleRepsChange(workoutExercise.id, index, Number.parseInt(e.target.value))
                                      }
                                      className="bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm w-16 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Intensidade do treino */}
        <div className="p-4 bg-gray-700 border-t border-gray-600">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-white font-medium mb-2 sm:mb-0">Intensidade do treino:</p>
            <div className="flex items-center">
              <IntensityRating value={workoutIntensity} onChange={handleIntensityChange} />
              <span className="ml-2 text-gray-300 text-sm">
                {workoutIntensity > 0 ? `${workoutIntensity}/5` : "Não avaliado"}
              </span>
            </div>
          </div>
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
