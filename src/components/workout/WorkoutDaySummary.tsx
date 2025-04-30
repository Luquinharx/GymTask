"use client"

import type React from "react"
import { useState } from "react"
import { type Workout, daysOfWeekLabels, type DayOfWeek } from "../../types"
import ExerciseCard from "../exercise/ExerciseCard"
import { getExerciseById } from "../../data/mockData"
import { Check, Download, Award, Calendar, CalendarCheck } from "lucide-react"
import html2canvas from "html2canvas"

interface WorkoutDaySummaryProps {
  workout: Workout | null
  dayOfWeek: DayOfWeek
  isActive: boolean
  onClick: () => void
}

const WorkoutDaySummary: React.FC<WorkoutDaySummaryProps> = ({ workout, dayOfWeek, isActive, onClick }) => {
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
                ? "bg-green-100 text-gray-900 hover:bg-green-200"
                : "bg-white text-gray-900 hover:bg-blue-50"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
        }
      `}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <h3 className={`font-semibold ${isActive ? "text-white" : isCompleted ? "text-green-800" : "text-gray-900"}`}>
          {daysOfWeekLabels[dayOfWeek]}
        </h3>
        {isCompleted && <Check className="h-4 w-4 text-green-600" />}
      </div>
      {hasWorkout ? (
        <div className="mt-1">
          <span className={`text-sm ${isActive ? "text-blue-100" : isCompleted ? "text-green-700" : "text-blue-600"}`}>
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

export const WorkoutDetails: React.FC<WorkoutDetailsProps> = ({
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

  if (!workout) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <h3 className="text-xl font-semibold text-gray-400">Nenhum treino para {daysOfWeekLabels[dayOfWeek]}</h3>
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
        backgroundColor: "#ffffff",
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

  return (
    <div className="space-y-4">
      {/* Mensagens de conclusão */}
      {showCompletionMessages && (
        <>
          {dailyCompleted && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md flex items-center">
              <Award className="h-6 w-6 text-green-500 mr-3" />
              <div>
                <p className="font-medium text-green-800">Parabéns! Você concluiu o treino de hoje!</p>
                <p className="text-green-700 text-sm">Continue assim para alcançar seus objetivos.</p>
              </div>
            </div>
          )}

          {weeklyCompleted && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md flex items-center">
              <Calendar className="h-6 w-6 text-blue-500 mr-3" />
              <div>
                <p className="font-medium text-blue-800">Incrível! Você completou todos os treinos da semana!</p>
                <p className="text-blue-700 text-sm">Sua dedicação está rendendo frutos.</p>
              </div>
            </div>
          )}

          {monthlyCompleted && (
            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-md flex items-center">
              <CalendarCheck className="h-6 w-6 text-purple-500 mr-3" />
              <div>
                <p className="font-medium text-purple-800">Extraordinário! Você completou todos os treinos do mês!</p>
                <p className="text-purple-700 text-sm">Sua consistência é admirável!</p>
              </div>
            </div>
          )}
        </>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold">Treino de {daysOfWeekLabels[dayOfWeek]}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {completedCount}/{workout.exercises.length} exercícios concluídos
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={exportWorkoutImage}
              disabled={exportLoading}
              className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center disabled:bg-blue-300"
            >
              <Download className="h-4 w-4 mr-1" />
              {exportLoading ? "Exportando..." : "Exportar"}
            </button>
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
        <div id="workout-export" className="p-6 bg-white">
          <div className="mb-4 pb-4 border-b">
            <h2 className="text-xl font-bold text-center">GymTask - Treino de {daysOfWeekLabels[dayOfWeek]}</h2>
            <p className="text-center text-gray-600">{formattedDate}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workout.exercises.map((workoutExercise) => {
              const exercise = getExerciseById(workoutExercise.exerciseId)
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
        </div>

        {/* Progresso do treino */}
        {someExercisesCompleted && !workout.completed && (
          <div className="p-4 bg-gray-50 border-t">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${(completedCount / workout.exercises.length) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center">
              {completedCount} de {workout.exercises.length} exercícios concluídos
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default WorkoutDaySummary
