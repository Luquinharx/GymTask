import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/layout/Header';
import { Dumbbell, Users, CalendarDays, BarChart } from 'lucide-react';
import { getStudents, mockExercises, mockWorkouts } from '../../data/mockData';

const AdminDashboard: React.FC = () => {
  const students = getStudents();
  const exerciseCount = mockExercises.length;
  const workoutCount = mockWorkouts.length;

  const AdminCard = ({ 
    title, 
    value, 
    icon, 
    color, 
    link 
  }: { 
    title: string; 
    value: number | string; 
    icon: React.ReactNode; 
    color: string; 
    link: string;
  }) => (
    <Link 
      to={link}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-1 text-3xl font-semibold">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </Link>
  );
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Painel do Professor" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Visão Geral</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AdminCard
              title="Alunos"
              value={students.length}
              icon={<Users className="h-6 w-6 text-white" />}
              color="bg-blue-600"
              link="/admin"
            />
            <AdminCard
              title="Exercícios"
              value={exerciseCount}
              icon={<Dumbbell className="h-6 w-6 text-white" />}
              color="bg-purple-600"
              link="/admin/exercises"
            />
            <AdminCard
              title="Treinos"
              value={workoutCount}
              icon={<CalendarDays className="h-6 w-6 text-white" />}
              color="bg-green-600"
              link="/admin/workouts"
            />
            <AdminCard
              title="Última Atualização"
              value="Hoje"
              icon={<BarChart className="h-6 w-6 text-white" />}
              color="bg-orange-600"
              link="/admin"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Gerenciar Exercícios</h3>
              <Link
                to="/admin/exercises"
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Ver Todos
              </Link>
            </div>
            <p className="text-gray-600">
              Adicione, edite ou remova exercícios do catálogo. Atualmente existem {exerciseCount} exercícios disponíveis.
            </p>
            <div className="mt-4">
              <Link
                to="/admin/exercises"
                className="text-blue-600 hover:text-blue-800 font-medium text-sm inline-flex items-center"
              >
                <Dumbbell className="h-4 w-4 mr-1" />
                Gerenciar Exercícios
              </Link>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Gerenciar Treinos</h3>
              <Link
                to="/admin/workouts"
                className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                Ver Todos
              </Link>
            </div>
            <p className="text-gray-600">
              Crie e atribua treinos personalizados para seus alunos. Gerencie os treinos semanais de cada aluno.
            </p>
            <div className="mt-4">
              <Link
                to="/admin/workouts"
                className="text-purple-600 hover:text-purple-800 font-medium text-sm inline-flex items-center"
              >
                <CalendarDays className="h-4 w-4 mr-1" />
                Gerenciar Treinos
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;