"use client"

import type React from "react"
import { useState } from "react"
import type { Exercise, WorkoutExercise } from "../../types"
import { Check, X, Video } from "lucide-react"

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

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {exercise.imageUrl && (
        <div className="h-40 overflow-hidden relative">
          <img
            src={exercise.imageUrl || "/placeholder.svg"}
            alt={exercise.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          {exercise.videoUrl && (
            <button
              onClick={() => setShowVideo(true)}
              className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
              title="Ver vídeo"
            >
              <Video className="h-5 w-5" />
            </button>
          )}
        </div>
      )}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{exercise.name}</h3>
            <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full mt-1">
              {exercise.muscleGroup}
            </span>
          </div>

          {isStudentView && workoutExercise && onToggleComplete ? (
            <button
              onClick={() => onToggleComplete(workoutExercise.id, !workoutExercise.completed)}
              className={`p-2 rounded-full ${
                workoutExercise.completed
                  ? "bg-green-100 text-green-600 hover:bg-green-200"
                  : "bg-gray-100 text-gray-400 hover:bg-gray-200"
              }`}
              title={workoutExercise.completed ? "Marcar como não concluído" : "Marcar como concluído"}
            >
              {workoutExercise.completed ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
            </button>
          ) : (
            (onEdit || onDelete) && (
              <div className="flex space-x-2">
                {onEdit && (
                  <button onClick={onEdit} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Editar
                  </button>
                )}
                {onDelete && (
                  <button onClick={onDelete} className="text-red-600 hover:text-red-800 text-sm font-medium">
                    Excluir
                  </button>
                )}
              </div>
            )
          )}
        </div>

        {workoutExercise && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="bg-gray-50 p-2 rounded">
              <span className="text-xs text-gray-500">Séries</span>
              <p className="font-semibold">{workoutExercise.sets}</p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <span className="text-xs text-gray-500">Repetições</span>
              <p className="font-semibold">{workoutExercise.reps}</p>
            </div>
          </div>
        )}

        {workoutExercise?.notes && (
          <div className="mt-2">
            <p className="text-sm text-gray-600 italic">
              <span className="font-medium">Observações:</span> {workoutExercise.notes}
            </p>
          </div>
        )}

        {showDetails && (
          <div className="mt-3">
            <h4 className="text-sm font-medium text-gray-700">Instruções:</h4>
            <p className="text-sm text-gray-600 mt-1">{exercise.instructions}</p>
          </div>
        )}
      </div>

      {/* Modal de vídeo */}
      {showVideo && exercise.videoUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">{exercise.name} - Vídeo Demonstrativo</h3>
              <button onClick={() => setShowVideo(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="aspect-video">
                <iframe
                  src={exercise.videoUrl}
                  title={`Vídeo de ${exercise.name}`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExerciseCard
