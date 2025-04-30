import React from 'react';
import { Exercise, WorkoutExercise } from '../../types';

interface ExerciseCardProps {
  exercise: Exercise;
  workoutExercise?: WorkoutExercise;
  showDetails?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  workoutExercise,
  showDetails = false,
  onEdit,
  onDelete
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {exercise.imageUrl && (
        <div className="h-40 overflow-hidden">
          <img
            src={exercise.imageUrl}
            alt={exercise.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
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
          
          {(onEdit || onDelete) && (
            <div className="flex space-x-2">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Editar
                </button>
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Excluir
                </button>
              )}
            </div>
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
    </div>
  );
};

export default ExerciseCard;