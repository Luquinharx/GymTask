import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import { mockWorkouts, getStudents, getExerciseById, mockExercises } from '../../data/mockData';
import { Workout, WorkoutExercise, User, daysOfWeek, daysOfWeekLabels, Exercise } from '../../types';
import { Plus, X, Trash2, Edit } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const WorkoutManagement: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>(mockWorkouts);
  const [students, setStudents] = useState<User[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    studentId: '',
    dayOfWeek: 'monday' as const,
    exercises: [] as WorkoutExercise[],
  });
  
  useEffect(() => {
    // In a real app, this would be API calls
    setStudents(getStudents());
    setExercises(mockExercises);
  }, []);
  
  const resetForm = () => {
    setFormData({
      studentId: selectedStudent || '',
      dayOfWeek: 'monday',
      exercises: [],
    });
    setCurrentWorkout(null);
  };
  
  const filterWorkoutsByStudent = () => {
    if (!selectedStudent) return workouts;
    return workouts.filter(workout => workout.studentId === selectedStudent);
  };
  
  const openModal = (workout?: Workout) => {
    if (workout) {
      setFormData({
        studentId: workout.studentId,
        dayOfWeek: workout.dayOfWeek,
        exercises: [...workout.exercises],
      });
      setCurrentWorkout(workout);
    } else {
      resetForm();
    }
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleAddExercise = () => {
    const newExercise: WorkoutExercise = {
      id: uuidv4(),
      exerciseId: '',
      sets: 3,
      reps: 12,
      notes: '',
    };
    
    setFormData(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise],
    }));
  };
  
  const handleRemoveExercise = (id: string) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.filter(ex => ex.id !== id),
    }));
  };
  
  const handleExerciseChange = (
    id: string,
    field: keyof WorkoutExercise,
    value: string | number
  ) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex => {
        if (ex.id === id) {
          return { ...ex, [field]: value };
        }
        return ex;
      }),
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.studentId) {
      alert('Por favor, selecione um aluno');
      return;
    }
    
    if (formData.exercises.length === 0) {
      alert('Por favor, adicione pelo menos um exercício');
      return;
    }
    
    if (formData.exercises.some(ex => !ex.exerciseId)) {
      alert('Por favor, selecione todos os exercícios');
      return;
    }
    
    // Check if workout for this day already exists
    const existingWorkoutIndex = workouts.findIndex(
      w => 
        w.studentId === formData.studentId && 
        w.dayOfWeek === formData.dayOfWeek &&
        (!currentWorkout || w.id !== currentWorkout.id)
    );
    
    if (existingWorkoutIndex !== -1 && !currentWorkout) {
      if (confirm('Já existe um treino para este dia. Deseja substituí-lo?')) {
        // Replace existing workout
        const newWorkouts = [...workouts];
        newWorkouts[existingWorkoutIndex] = {
          ...newWorkouts[existingWorkoutIndex],
          exercises: formData.exercises,
        };
        setWorkouts(newWorkouts);
        closeModal();
        return;
      } else {
        return; // User canceled
      }
    }
    
    const newWorkout: Workout = {
      id: currentWorkout ? currentWorkout.id : uuidv4(),
      studentId: formData.studentId,
      dayOfWeek: formData.dayOfWeek,
      exercises: formData.exercises,
    };
    
    if (currentWorkout) {
      // Update existing workout
      setWorkouts(prev =>
        prev.map(w => (w.id === currentWorkout.id ? newWorkout : w))
      );
    } else {
      // Create new workout
      setWorkouts(prev => [...prev, newWorkout]);
    }
    
    closeModal();
  };
  
  const handleDeleteWorkout = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este treino?')) {
      setWorkouts(prev => prev.filter(w => w.id !== id));
    }
  };
  
  const getStudentName = (id: string) => {
    const student = students.find(s => s.id === id);
    return student ? student.name : 'Aluno Desconhecido';
  };
  
  const getExerciseName = (id: string) => {
    const exercise = getExerciseById(id);
    return exercise ? exercise.name : 'Exercício Desconhecido';
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Gerenciamento de Treinos" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Treinos Semanais</h2>
          
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-4">
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="block w-full sm:w-64 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">Todos os Alunos</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
            
            <button
              onClick={() => openModal()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-5 w-5 mr-1" />
              Novo Treino
            </button>
          </div>
        </div>
        
        {filterWorkoutsByStudent().length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-500">
              {selectedStudent
                ? 'Nenhum treino encontrado para este aluno.'
                : 'Nenhum treino cadastrado.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {selectedStudent ? (
              // Group workouts by day for selected student
              daysOfWeek.map((day) => {
                const workout = filterWorkoutsByStudent().find(
                  w => w.dayOfWeek === day
                );
                
                if (!workout) return null;
                
                return (
                  <div key={day} className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">
                        {daysOfWeekLabels[day]}
                      </h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openModal(workout)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="Editar"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteWorkout(workout.id)}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Excluir"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <div className="px-6 py-4">
                      <div className="border rounded-md overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Exercício
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Séries
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Repetições
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Observações
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {workout.exercises.map((ex) => (
                              <tr key={ex.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {getExerciseName(ex.exerciseId)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {ex.sets}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {ex.reps}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                  {ex.notes || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              }).filter(Boolean)
            ) : (
              // Group workouts by student
              students.map((student) => {
                const studentWorkouts = filterWorkoutsByStudent().filter(
                  w => w.studentId === student.id
                );
                
                if (studentWorkouts.length === 0) return null;
                
                return (
                  <div key={student.id} className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">
                        {student.name}
                      </h3>
                    </div>
                    <div className="px-6 py-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {daysOfWeek.map(day => {
                          const workout = studentWorkouts.find(
                            w => w.dayOfWeek === day
                          );
                          
                          return (
                            <div key={day} className="border rounded-md p-4">
                              <div className="flex justify-between items-center mb-3">
                                <h4 className="font-medium">{daysOfWeekLabels[day]}</h4>
                                {workout ? (
                                  <div className="flex space-x-1">
                                    <button
                                      onClick={() => openModal(workout)}
                                      className="p-1 text-blue-600 hover:text-blue-800"
                                      title="Editar"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteWorkout(workout.id)}
                                      className="p-1 text-red-600 hover:text-red-800"
                                      title="Excluir"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setFormData({
                                        studentId: student.id,
                                        dayOfWeek: day,
                                        exercises: [],
                                      });
                                      openModal();
                                    }}
                                    className="p-1 text-blue-600 hover:text-blue-800"
                                    title="Adicionar"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                              
                              {workout ? (
                                <div className="text-sm text-gray-600">
                                  <p>{workout.exercises.length} exercícios</p>
                                  <ul className="mt-2 list-disc list-inside text-xs">
                                    {workout.exercises.slice(0, 3).map((ex) => (
                                      <li key={ex.id} className="truncate">
                                        {getExerciseName(ex.exerciseId)}
                                      </li>
                                    ))}
                                    {workout.exercises.length > 3 && (
                                      <li className="text-gray-500">
                                        + {workout.exercises.length - 3} mais
                                      </li>
                                    )}
                                  </ul>
                                </div>
                              ) : (
                                <p className="text-sm text-gray-400">Sem treino</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              }).filter(Boolean)
            )}
          </div>
        )}
      </main>
      
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">
                {currentWorkout ? 'Editar Treino' : 'Novo Treino'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="px-6 py-4">
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">
                      Aluno
                    </label>
                    <select
                      id="studentId"
                      name="studentId"
                      required
                      value={formData.studentId}
                      onChange={handleInputChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      disabled={!!currentWorkout} // Can't change student for existing workout
                    >
                      <option value="" disabled>
                        Selecione um aluno
                      </option>
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="dayOfWeek" className="block text-sm font-medium text-gray-700">
                      Dia da Semana
                    </label>
                    <select
                      id="dayOfWeek"
                      name="dayOfWeek"
                      required
                      value={formData.dayOfWeek}
                      onChange={handleInputChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      disabled={!!currentWorkout} // Can't change day for existing workout
                    >
                      {daysOfWeek.map((day) => (
                        <option key={day} value={day}>
                          {daysOfWeekLabels[day]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-base font-medium text-gray-900">Exercícios</h4>
                    <button
                      type="button"
                      onClick={handleAddExercise}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar Exercício
                    </button>
                  </div>
                  
                  {formData.exercises.length === 0 ? (
                    <div className="border border-dashed border-gray-300 rounded-md p-6 text-center">
                      <p className="text-gray-500">
                        Nenhum exercício adicionado. Clique em "Adicionar Exercício" para começar.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.exercises.map((exercise, index) => (
                        <div key={exercise.id} className="border rounded-md p-4 bg-gray-50">
                          <div className="flex justify-between items-center mb-3">
                            <h5 className="text-sm font-medium text-gray-700">
                              Exercício {index + 1}
                            </h5>
                            <button
                              type="button"
                              onClick={() => handleRemoveExercise(exercise.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div className="sm:col-span-2">
                              <label htmlFor={`exercise-${exercise.id}`} className="block text-xs font-medium text-gray-700">
                                Exercício
                              </label>
                              <select
                                id={`exercise-${exercise.id}`}
                                value={exercise.exerciseId}
                                onChange={(e) =>
                                  handleExerciseChange(exercise.id, 'exerciseId', e.target.value)
                                }
                                required
                                className="mt-1 block w-full pl-3 pr-10 py-1.5 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                              >
                                <option value="" disabled>
                                  Selecione um exercício
                                </option>
                                {exercises.map((ex) => (
                                  <option key={ex.id} value={ex.id}>
                                    {ex.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            
                            <div>
                              <label htmlFor={`sets-${exercise.id}`} className="block text-xs font-medium text-gray-700">
                                Séries
                              </label>
                              <input
                                type="number"
                                id={`sets-${exercise.id}`}
                                value={exercise.sets}
                                onChange={(e) =>
                                  handleExerciseChange(exercise.id, 'sets', parseInt(e.target.value))
                                }
                                min="1"
                                required
                                className="mt-1 block w-full pl-3 pr-3 py-1.5 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                              />
                            </div>
                            
                            <div>
                              <label htmlFor={`reps-${exercise.id}`} className="block text-xs font-medium text-gray-700">
                                Repetições
                              </label>
                              <input
                                type="number"
                                id={`reps-${exercise.id}`}
                                value={exercise.reps}
                                onChange={(e) =>
                                  handleExerciseChange(exercise.id, 'reps', parseInt(e.target.value))
                                }
                                min="1"
                                required
                                className="mt-1 block w-full pl-3 pr-3 py-1.5 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                              />
                            </div>
                            
                            <div className="sm:col-span-4">
                              <label htmlFor={`notes-${exercise.id}`} className="block text-xs font-medium text-gray-700">
                                Observações
                              </label>
                              <input
                                type="text"
                                id={`notes-${exercise.id}`}
                                value={exercise.notes || ''}
                                onChange={(e) =>
                                  handleExerciseChange(exercise.id, 'notes', e.target.value)
                                }
                                className="mt-1 block w-full pl-3 pr-3 py-1.5 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {currentWorkout ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutManagement;