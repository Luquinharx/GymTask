import React, { useState } from 'react';
import Header from '../../components/layout/Header';
import ExerciseCard from '../../components/exercise/ExerciseCard';
import { Exercise } from '../../types';
import { mockExercises } from '../../data/mockData';
import { Plus, X, Search } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const ExerciseManagement: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>(mockExercises);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>(mockExercises);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    muscleGroup: string;
    instructions: string;
    imageUrl: string;
  }>({
    name: '',
    muscleGroup: '',
    instructions: '',
    imageUrl: '',
  });
  
  const resetForm = () => {
    setFormData({
      name: '',
      muscleGroup: '',
      instructions: '',
      imageUrl: '',
    });
    setCurrentExercise(null);
  };
  
  const openModal = (exercise?: Exercise) => {
    if (exercise) {
      setFormData({
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
        instructions: exercise.instructions,
        imageUrl: exercise.imageUrl || '',
      });
      setCurrentExercise(exercise);
    } else {
      resetForm();
    }
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newExercise: Exercise = {
      id: currentExercise ? currentExercise.id : uuidv4(),
      name: formData.name,
      muscleGroup: formData.muscleGroup,
      instructions: formData.instructions,
      imageUrl: formData.imageUrl || undefined,
    };
    
    if (currentExercise) {
      // Update existing exercise
      setExercises((prev) =>
        prev.map((ex) => (ex.id === currentExercise.id ? newExercise : ex))
      );
    } else {
      // Create new exercise
      setExercises((prev) => [...prev, newExercise]);
    }
    
    closeModal();
    applySearch(searchTerm, currentExercise ? 
      exercises.map(ex => ex.id === currentExercise.id ? newExercise : ex) : 
      [...exercises, newExercise]
    );
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este exercício?')) {
      const updatedExercises = exercises.filter((ex) => ex.id !== id);
      setExercises(updatedExercises);
      applySearch(searchTerm, updatedExercises);
    }
  };
  
  const applySearch = (term: string, exerciseList: Exercise[] = exercises) => {
    if (!term.trim()) {
      setFilteredExercises(exerciseList);
      return;
    }
    
    const filtered = exerciseList.filter(
      (ex) =>
        ex.name.toLowerCase().includes(term.toLowerCase()) ||
        ex.muscleGroup.toLowerCase().includes(term.toLowerCase())
    );
    
    setFilteredExercises(filtered);
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    applySearch(term);
  };
  
  const muscleGroups = [
    'Peito', 'Costas', 'Pernas', 'Ombros', 'Bíceps', 
    'Tríceps', 'Abdômen', 'Glúteos', 'Antebraço', 'Panturrilha'
  ];
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Gerenciamento de Exercícios" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Exercícios</h2>
          
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-4">
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar exercícios..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            
            <button
              onClick={() => openModal()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-5 w-5 mr-1" />
              Novo Exercício
            </button>
          </div>
        </div>
        
        {filteredExercises.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-500">Nenhum exercício encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                showDetails={true}
                onEdit={() => openModal(exercise)}
                onDelete={() => handleDelete(exercise.id)}
              />
            ))}
          </div>
        )}
      </main>
      
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">
                {currentExercise ? 'Editar Exercício' : 'Novo Exercício'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nome do Exercício
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="muscleGroup" className="block text-sm font-medium text-gray-700">
                    Grupo Muscular
                  </label>
                  <select
                    id="muscleGroup"
                    name="muscleGroup"
                    required
                    value={formData.muscleGroup}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="" disabled>
                      Selecione um grupo muscular
                    </option>
                    {muscleGroups.map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">
                    Instruções
                  </label>
                  <textarea
                    id="instructions"
                    name="instructions"
                    rows={3}
                    required
                    value={formData.instructions}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                    URL da Imagem (opcional)
                  </label>
                  <input
                    type="url"
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="https://..."
                  />
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
                  {currentExercise ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseManagement;