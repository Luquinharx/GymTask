import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/layout/Header';
import WorkoutDaySummary, { WorkoutDetails } from '../../components/workout/WorkoutDaySummary';
import { Workout, daysOfWeek, DayOfWeek } from '../../types';
import { mockWorkouts } from '../../data/mockData';

const StudentDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('monday');
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  
  useEffect(() => {
    if (currentUser) {
      // In a real app, this would be an API call to get the student's workouts
      const studentWorkouts = mockWorkouts.filter(
        workout => workout.studentId === currentUser.id
      );
      setWorkouts(studentWorkouts);
    }
  }, [currentUser]);

  const getWorkoutForDay = (day: DayOfWeek): Workout | null => {
    return workouts.find(workout => workout.dayOfWeek === day) || null;
  };

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
        />
      </main>
    </div>
  );
};

export default StudentDashboard;