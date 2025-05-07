"use client"

import type React from "react"
import { useState } from "react"
import type { Exercise, WorkoutExercise } from "../../types"
import { Check, Video } from "lucide-react"

interface ExerciseCardProps {
  exercise: Exercise
  workoutExercise?: WorkoutExercise
  showDetails?: boolean
  onEdit?: () => void
  onDelete?: () => void
  onToggleComplete?: (id: string, completed: boolean) => void
  isStudentView?: boolean
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  workoutExercise,
  showDetails = false,
  onEdit,
  onDelete,
  onToggleComplete,
  isStudentView = false,
}) => {
  const [showVideo, setShowVideo] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  // Substituir a parte de renderização do card para incluir a imagem e destacar séries/repetições
  return (
    <div className={`rounded-lg overflow-hidden shadow-md ${isStudentView ? "bg-gray-700" : "bg-gray-800"}`}>
      {exercise.imageUrl && (
        <div className="w-full h-48 overflow-hidden">
          <img
            src={exercise.imageUrl || "/placeholder.svg"}
            alt={exercise.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg?height=200&width=200"
              e.currentTarget.alt = "Imagem não disponível"
            }}
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-white">{exercise.name}</h3>
            <p className="text-sm text-gray-400">{exercise.muscleGroup}</p>

            {workoutExercise && (
              <div className="mt-2 bg-blue-900 rounded-md p-2 inline-block">
                <p className="text-blue-100 font-semibold">
                  {workoutExercise.sets} séries x {workoutExercise.reps} repetições
                </p>
              </div>
            )}
          </div>

          {workoutExercise && onToggleComplete && (
            <button
              onClick={() => onToggleComplete(workoutExercise.id, !workoutExercise.completed)}
              className={`rounded-full h-8 w-8 flex items-center justify-center ${
                workoutExercise.completed ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-500"
              } transition-colors`}
            >
              {workoutExercise.completed ? (
                <Check className="h-5 w-5 text-white" />
              ) : (
                <div className="h-3 w-3 rounded-full bg-gray-800"></div>
              )}
            </button>
          )}
        </div>

        {showDetails && (
          <div className="mt-3">
            {exercise.instructions && <p className="text-sm text-gray-300 mt-2">{exercise.instructions}</p>}

            {workoutExercise && workoutExercise.notes && (
              <div className="mt-2 p-2 bg-gray-800 rounded">
                <p className="text-xs text-gray-400">Observações:</p>
                <p className="text-sm text-gray-300">{workoutExercise.notes}</p>
              </div>
            )}

            {exercise.videoUrl && (
              <div className="mt-3">
                <a
                  href={exercise.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 text-sm flex items-center hover:text-blue-300"
                >
                  <Video className="h-4 w-4 mr-1" />
                  Ver vídeo demonstrativo
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ExerciseCard
