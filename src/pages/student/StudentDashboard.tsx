"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import Header from "../../components/layout/Header"
import WorkoutDaySummary, { WorkoutDetails } from "../../components/workout/WorkoutDaySummary"
import { type Workout, daysOfWeek, type DayOfWeek, type WorkoutProgress } from "../../types"
import { mockWorkouts } from "../../data/mockData"

const StudentDashboard: React.FC = () => {
  const { currentUser } = useAuth()
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>("monday")
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [progress, setProgress] = useState<WorkoutProgress>({
    dailyCompleted: false,
    weeklyCompleted: false,
    monthlyCompleted: false,
  })

  useEffect(() => {
    if (currentUser) {
      // Em uma aplicação real, isso seria uma chamada de API para obter os treinos do aluno
      const studentWorkouts = mockWorkouts.filter((workout) => workout.studentId === currentUser.id)
      setWorkouts(studentWorkouts)
    }
  }, [currentUser])

  const getWorkoutForDay = (day: DayOfWeek): Workout | null => {
    return workouts.find((workout) => workout.dayOfWeek === day) || null
  }

  const handleToggleExerciseComplete = (workoutId: string, exerciseId: string, completed: boolean) => {
    setWorkouts((prevWorkouts) =>
      prevWorkouts.map((workout) => {
        if (workout.id === workoutId) {
          return {
            ...workout,
            exercises: workout.exercises.map((exercise) => {
              if (exercise.id === exerciseId) {
                return { ...exercise, completed }
              }
              return exercise
            }),
          }
        }
        return workout
      }),
    )
  }

  const handleCompleteWorkout = (workoutId: string) => {
    const today = new Date().toISOString()

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

    // Verificar se todos os treinos da semana foram concluídos
    const updatedWorkouts = workouts.map((w) => (w.id === workoutId ? { ...w, completed: true } : w))
    const allWorkoutsCompleted = updatedWorkouts.every((w) => w.completed)

    // Atualizar progresso
    setProgress((prev) => {
      const newProgress = { ...prev }

      // Marcar treino diário como concluído
      newProgress.dailyCompleted = true
      newProgress.lastDailyCompletedDate = today

      // Verificar se todos os treinos da semana foram concluídos
      if (allWorkoutsCompleted) {
        newProgress.weeklyCompleted = true
        newProgress.lastWeeklyCompletedDate = today

        // Verificar se é o final do mês para marcar como concluído mensalmente
        const currentDate = new Date()
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
        if (currentDate.getDate() >= lastDayOfMonth - 2) {
          // Considerando os últimos dias do mês
          newProgress.monthlyCompleted = true
          newProgress.lastMonthlyCompletedDate = today
        }
      }

      return newProgress
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Meus Treinos" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Semana de Treino</h2>

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
      </main>
    </div>
  )
}

export default StudentDashboard
