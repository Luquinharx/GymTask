"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Header from "../../components/layout/Header"
import { Dumbbell, Users, CalendarDays, BarChart, Activity, ChevronRight, Award, TrendingUp } from "lucide-react"
import { getAllStudents } from "../../services/studentService"
import { getAllExercises } from "../../services/exerciseService"
import { getAllWorkouts } from "../../services/workoutService"

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    studentCount: 0,
    exerciseCount: 0,
    workoutCount: 0,
    lastUpdate: "Hoje",
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)

        // Carregar dados reais do Firestore
        const students = await getAllStudents()
        const exercises = await getAllExercises()
        const workouts = await getAllWorkouts()

        // Atualizar estatísticas
        setStats({
          studentCount: students.length,
          exerciseCount: exercises.length,
          workoutCount: workouts.length,
          lastUpdate: new Date().toLocaleDateString("pt-BR"),
        })
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const AdminCard = ({
    title,
    value,
    icon,
    color,
    link,
    isLoading = false,
  }: {
    title: string
    value: number | string
    icon: React.ReactNode
    color: string
    link: string
    isLoading?: boolean
  }) => (
    <Link
      to={link}
      className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {isLoading ? (
            <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
          ) : (
            <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
      </div>
      <div className="mt-4 flex items-center text-sm text-gray-500">
        <span>Ver detalhes</span>
        <ChevronRight className="h-4 w-4 ml-1" />
      </div>
    </Link>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Painel do Professor" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Visão Geral</h2>
          <p className="text-gray-500 mb-6">Bem-vindo ao seu painel de controle. Aqui está o resumo da sua academia.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AdminCard
              title="Alunos"
              value={stats.studentCount}
              icon={<Users className="h-6 w-6 text-white" />}
              color="bg-gradient-to-br from-blue-500 to-blue-700"
              link="/admin/students"
              isLoading={isLoading}
            />
            <AdminCard
              title="Exercícios"
              value={stats.exerciseCount}
              icon={<Dumbbell className="h-6 w-6 text-white" />}
              color="bg-gradient-to-br from-purple-500 to-purple-700"
              link="/admin/exercises"
              isLoading={isLoading}
            />
            <AdminCard
              title="Treinos"
              value={stats.workoutCount}
              icon={<CalendarDays className="h-6 w-6 text-white" />}
              color="bg-gradient-to-br from-green-500 to-green-700"
              link="/admin/workouts"
              isLoading={isLoading}
            />
            <AdminCard
              title="Última Atualização"
              value={stats.lastUpdate}
              icon={<Activity className="h-6 w-6 text-white" />}
              color="bg-gradient-to-br from-orange-500 to-orange-700"
              link="/admin"
              isLoading={isLoading}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Gerenciar Alunos</h3>
              <Link
                to="/admin/students"
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-colors shadow-sm"
              >
                Ver Todos
              </Link>
            </div>
            <p className="text-gray-600">
              Cadastre novos alunos e gerencie os existentes. Envie credenciais de acesso por email.
            </p>
            <div className="mt-6 flex items-center justify-between">
              <Link
                to="/admin/students"
                className="text-blue-600 hover:text-blue-800 font-medium text-sm inline-flex items-center"
              >
                <Users className="h-4 w-4 mr-1" />
                Gerenciar Alunos
              </Link>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {isLoading ? "..." : stats.studentCount} alunos
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Gerenciar Exercícios</h3>
              <Link
                to="/admin/exercises"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-purple-800 transition-colors shadow-sm"
              >
                Ver Todos
              </Link>
            </div>
            <p className="text-gray-600">
              Adicione, edite ou remova exercícios do catálogo. Organize por grupos musculares e adicione instruções
              detalhadas.
            </p>
            <div className="mt-6 flex items-center justify-between">
              <Link
                to="/admin/exercises"
                className="text-purple-600 hover:text-purple-800 font-medium text-sm inline-flex items-center"
              >
                <Dumbbell className="h-4 w-4 mr-1" />
                Gerenciar Exercícios
              </Link>
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {isLoading ? "..." : stats.exerciseCount} exercícios
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Gerenciar Treinos</h3>
              <Link
                to="/admin/workouts"
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg text-sm font-medium hover:from-green-700 hover:to-green-800 transition-colors shadow-sm"
              >
                Ver Todos
              </Link>
            </div>
            <p className="text-gray-600">
              Crie e atribua treinos personalizados para seus alunos. Gerencie os treinos semanais e acompanhe o
              progresso.
            </p>
            <div className="mt-6 flex items-center justify-between">
              <Link
                to="/admin/workouts"
                className="text-green-600 hover:text-green-800 font-medium text-sm inline-flex items-center"
              >
                <CalendarDays className="h-4 w-4 mr-1" />
                Gerenciar Treinos
              </Link>
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {isLoading ? "..." : stats.workoutCount} treinos
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Desempenho Recente</h3>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Últimos 7 dias
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-green-100 p-2 rounded-lg mr-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Taxa de Conclusão</p>
                    <p className="text-xs text-gray-500">Treinos concluídos pelos alunos</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-gray-900">78%</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <Award className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Alunos Ativos</p>
                    <p className="text-xs text-gray-500">Alunos que treinaram esta semana</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-gray-900">{Math.round(stats.studentCount * 0.85)}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-2 rounded-lg mr-3">
                    <BarChart className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Novos Treinos</p>
                    <p className="text-xs text-gray-500">Treinos criados esta semana</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-gray-900">12</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/admin/analytics"
                className="text-blue-600 hover:text-blue-800 font-medium text-sm inline-flex items-center"
              >
                Ver análise completa
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Ações Rápidas</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/admin/students?action=new"
                className="flex items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
              >
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Novo Aluno</p>
                  <p className="text-xs text-gray-500">Adicionar aluno ao sistema</p>
                </div>
              </Link>

              <Link
                to="/admin/exercises?action=new"
                className="flex items-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
              >
                <div className="bg-purple-100 p-2 rounded-lg mr-3">
                  <Dumbbell className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Novo Exercício</p>
                  <p className="text-xs text-gray-500">Adicionar exercício ao catálogo</p>
                </div>
              </Link>

              <Link
                to="/admin/workouts?action=new"
                className="flex items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
              >
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <CalendarDays className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Novo Treino</p>
                  <p className="text-xs text-gray-500">Criar treino para um aluno</p>
                </div>
              </Link>

              <Link
                to="/admin/templates"
                className="flex items-center p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors"
              >
                <div className="bg-orange-100 p-2 rounded-lg mr-3">
                  <Activity className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Templates</p>
                  <p className="text-xs text-gray-500">Gerenciar templates de treino</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard
