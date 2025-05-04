"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import Header from "../../components/layout/Header"
import WorkoutDaySummary, { WorkoutDetails } from "../../components/workout/WorkoutDaySummary"
import { type Workout, daysOfWeek, type DayOfWeek, type WorkoutProgress } from "../../types"
import { getWorkoutsByStudent, updateWorkout } from "../../services/workoutService"
import { Loader2, Dumbbell, Award, TrendingUp, Flame } from "lucide-react"

const StudentDashboard: React.FC = () => {
  const { currentUser } = useAuth()
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>("monday")
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [progress, setProgress] = useState<WorkoutProgress>({
    dailyCompleted: false,
    weeklyCompleted: false,
    monthlyCompleted: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)

  // Função para carregar os treinos do aluno
  const loadWorkouts = async () => {
    if (!currentUser) return

    try {
      const studentWorkouts = await getWorkoutsByStudent(currentUser.id)
      setWorkouts(studentWorkouts)

      // Verificar progresso
      const completedWorkouts = studentWorkouts.filter((w) => w.completed)

      // Verificar se há algum treino concluído hoje
      const today = new Date().toISOString().split("T")[0]
      const dailyCompleted = completedWorkouts.some((w) => w.completedDate && w.completedDate.startsWith(today))

      // Verificar se todos os treinos da semana foram concluídos
      const weeklyCompleted = studentWorkouts.length > 0 && studentWorkouts.every((w) => w.completed)

      // Atualizar progresso
      setProgress({
        dailyCompleted,
        weeklyCompleted,
        monthlyCompleted: weeklyCompleted, // Simplificação para demonstração
        lastDailyCompletedDate: dailyCompleted ? today : undefined,
        lastWeeklyCompletedDate: weeklyCompleted ? today : undefined,
        lastMonthlyCompletedDate: weeklyCompleted ? today : undefined,
      })
    } catch (err) {
      console.error("Erro ao carregar treinos:", err)
      setError("Não foi possível carregar seus treinos. Por favor, tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  // Carregar treinos ao iniciar e configurar atualização periódica
  useEffect(() => {
    loadWorkouts()

    // Configurar atualização a cada 30 segundos
    const interval = setInterval(() => {
      loadWorkouts()
    }, 30000)

    setRefreshInterval(interval)

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    }
  }, [currentUser])

  const getWorkoutForDay = (day: DayOfWeek): Workout | null => {
    return workouts.find((workout) => workout.dayOfWeek === day) || null
  }

  const handleToggleExerciseComplete = async (workoutId: string, exerciseId: string, completed: boolean) => {
    try {
      const workout = workouts.find((w) => w.id === workoutId)
      if (!workout) return

      // Atualizar localmente primeiro para UI responsiva
      const updatedWorkout = {
        ...workout,
        exercises: workout.exercises.map((ex) => (ex.id === exerciseId ? { ...ex, completed } : ex)),
      }

      setWorkouts(workouts.map((w) => (w.id === workoutId ? updatedWorkout : w)))

      // Atualizar no Firestore
      await updateWorkout(workoutId, {
        exercises: updatedWorkout.exercises,
      })
    } catch (err) {
      console.error("Erro ao atualizar exercício:", err)
      // Recarregar treinos em caso de erro
      loadWorkouts()
    }
  }

  const handleCompleteWorkout = async (workoutId: string) => {
    try {
      const today = new Date().toISOString()

      // Atualizar localmente primeiro
      setWorkouts((prevWorkouts) =>
        prevWorkouts.map((workout) => {
          if (workout.id === workoutId) {
            return {
              ...workout,
              completed: true,
              completedDate: today,
            }
          }
          return workout
        }),
      )

      // Atualizar no Firestore
      await updateWorkout(workoutId, {
        completed: true,
        completedDate: today,
      })

      // Verificar se todos os treinos da semana foram concluídos
      const updatedWorkouts = workouts.map((w) => (w.id === workoutId ? { ...w, completed: true } : w))
      const allWorkoutsCompleted = updatedWorkouts.every((w) => w.completed)

      // Atualizar progresso
      setProgress((prev) => {
        const newProgress = { ...prev }
        newProgress.dailyCompleted = true
        newProgress.lastDailyCompletedDate = today

        if (allWorkoutsCompleted) {
          newProgress.weeklyCompleted = true
          newProgress.lastWeeklyCompletedDate = today

          // Verificar se é o final do mês
          const currentDate = new Date()
          const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
          if (currentDate.getDate() >= lastDayOfMonth - 2) {
            newProgress.monthlyCompleted = true
            newProgress.lastMonthlyCompletedDate = today
          }
        }

        return newProgress
      })
    } catch (err) {
      console.error("Erro ao concluir treino:", err)
      // Recarregar treinos em caso de erro
      loadWorkouts()
    }
  }

  // Calcular estatísticas para o dashboard
  const totalExercises = workouts.reduce((total, workout) => total + workout.exercises.length, 0)
  const completedExercises = workouts.reduce(
    (total, workout) => total + workout.exercises.filter((ex) => ex.completed).length,
    0,
  )
  const completionPercentage = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header title="Meus Treinos" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Treinos Concluídos</p>
                <p className="text-3xl font-bold">
                  {workouts.filter((w) => w.completed).length}/{workouts.length}
                </p>
              </div>
              <div className="bg-blue-600 p-3 rounded-lg">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-blue-800 rounded-full h-2.5">
                <div
                  className="bg-blue-300 h-2.5 rounded-full"
                  style={{
                    width: `${workouts.length > 0 ? (workouts.filter((w) => w.completed).length / workouts.length) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-900 to-purple-700 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Progresso Semanal</p>
                <p className="text-3xl font-bold">{completionPercentage}%</p>
              </div>
              <div className="bg-purple-600 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-purple-800 rounded-full h-2.5">
                <div className="bg-purple-300 h-2.5 rounded-full" style={{ width: `${completionPercentage}%` }}></div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-900 to-green-700 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm">Exercícios Concluídos</p>
                <p className="text-3xl font-bold">
                  {completedExercises}/{totalExercises}
                </p>
              </div>
              <div className="bg-green-600 p-3 rounded-lg">
                <Award className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-green-800 rounded-full h-2.5">
                <div
                  className="bg-green-300 h-2.5 rounded-full"
                  style={{ width: `${totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-900 to-red-700 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-200 text-sm">Calorias Estimadas</p>
                <p className="text-3xl font-bold">{completedExercises * 50}</p>
              </div>
              <div className="bg-red-600 p-3 rounded-lg">
                <Flame className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-red-800 rounded-full h-2.5">
                <div
                  className="bg-red-300 h-2.5 rounded-full"
                  style={{ width: `${completedExercises > 0 ? Math.min((completedExercises * 50) / 500, 100) : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 shadow rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Semana de Treino</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {daysOfWeek.map((day) => (
              <WorkoutDaySummary
                key={day}
                dayOfWeek={day}
                workout={getWorkoutForDay(day)}
                isActive={selectedDay === day}
                onClick={() => setSelectedDay(day)}
              />
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <span className="ml-2 text-gray-300">Carregando seu treino...</span>
          </div>
        ) : error ? (
          <div className="bg-red-900 text-white rounded-xl p-6 text-center">
            <p>{error}</p>
            <button onClick={loadWorkouts} className="mt-4 px-4 py-2 bg-red-700 hover:bg-red-600 rounded-md">
              Tentar Novamente
            </button>
          </div>
        ) : (
          <WorkoutDetails
            workout={getWorkoutForDay(selectedDay)}
            dayOfWeek={selectedDay}
            onToggleExerciseComplete={handleToggleExerciseComplete}
            onCompleteWorkout={handleCompleteWorkout}
            showCompletionMessages={true}
            dailyCompleted={progress.dailyCompleted}
            weeklyCompleted={progress.weeklyCompleted}
            monthlyCompleted={progress.monthlyCompleted}
          />
        )}
      </main>
    </div>
  )
}

export default StudentDashboard
