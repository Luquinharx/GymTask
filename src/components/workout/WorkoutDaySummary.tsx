import React from 'react';
import { Workout, daysOfWeekLabels, DayOfWeek } from '../../types';
import ExerciseCard from '../exercise/ExerciseCard';
import { getExerciseById } from '../../data/mockData';

interface WorkoutDaySummaryProps {
  workout: Workout | null;
  dayOfWeek: DayOfWeek;
  isActive: boolean;
  onClick: () => void;
}

const WorkoutDaySummary: React.FC<WorkoutDaySummaryProps> = ({
  workout,
  dayOfWeek,
  isActive,
  onClick
}) => {
  const hasWorkout = workout !== null;
  const exerciseCount = workout?.exercises.length || 0;

  return (
    <div 
      className={`
        cursor-pointer rounded-lg p-4 transition-all duration-200
        ${isActive 
          ? 'bg-blue-600 text-white shadow-md' 
          : hasWorkout 
            ? 'bg-white text-gray-900 hover:bg-blue-50' 
            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
        }
      `}
      onClick={onClick}
    >
      <h3 className={`font-semibold ${isActive ? 'text-white' : 'text-gray-900'}`}>
        {daysOfWeekLabels[dayOfWeek]}
      </h3>
      {hasWorkout ? (
        <div className="mt-1">
          <span className={`text-sm ${isActive ? 'text-blue-100' : 'text-blue-600'}`}>
            {exerciseCount} {exerciseCount === 1 ? 'exercício' : 'exercícios'}
          </span>
        </div>
      ) : (
        <p className="text-sm mt-1">Sem treino</p>
      )}
    </div>
  );
};

interface WorkoutDetailsProps {
  workout: Workout | null;
  dayOfWeek: DayOfWeek;
}

export const WorkoutDetails: React.FC<WorkoutDetailsProps> = ({ workout, dayOfWeek }) => {
  if (!workout) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <h3 className="text-xl font-semibold text-gray-400">Nenhum treino para {daysOfWeekLabels[dayOfWeek]}</h3>
        <p className="text-gray-400 mt-2">Aproveite o descanso!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h3 className="text-xl font-semibold">Treino de {daysOfWeekLabels[dayOfWeek]}</h3>
        <p className="text-sm text-gray-600 mt-1">
          {workout.exercises.length} {workout.exercises.length === 1 ? 'exercício' : 'exercícios'}
        </p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workout.exercises.map((workoutExercise) => {
            const exercise = getExerciseById(workoutExercise.exerciseId);
            if (!exercise) return null;
            
            return (
              <ExerciseCard
                key={workoutExercise.id}
                exercise={exercise}
                workoutExercise={workoutExercise}
                showDetails={true}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WorkoutDaySummary;