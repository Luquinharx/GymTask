"use client"

import type React from "react"
import { useNavigate, Link } from "react-router-dom"
import { Dumbbell, LogOut, User, Menu, X, Bell } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { useState } from "react"

interface HeaderProps {
  title: string
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const isAdmin = currentUser?.role === "admin"
  const isStudent = currentUser?.role === "student"

  return (
    <header
      className={`${isStudent ? "bg-gray-800 text-white" : "bg-white text-gray-900"} shadow-lg sticky top-0 z-30`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to={isAdmin ? "/admin" : "/student"} className="flex items-center">
                <Dumbbell className={`h-8 w-8 ${isStudent ? "text-blue-400" : "text-blue-600"}`} />
                <span className="ml-2 text-xl font-bold">GymTask</span>
              </Link>
              <div className="hidden md:block ml-6 border-l border-gray-300 h-6"></div>
              <h1 className="hidden md:block ml-6 text-xl font-bold">{title}</h1>
            </div>

            {/* Desktop Navigation */}
            {isAdmin && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
                <Link
                  to="/admin"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors flex items-center"
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/students"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors flex items-center"
                >
                  Alunos
                </Link>
                <Link
                  to="/admin/exercises"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors flex items-center"
                >
                  Exercícios
                </Link>
                <Link
                  to="/admin/workouts"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors flex items-center"
                >
                  Treinos
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center">
            <div className="flex items-center">
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className={`p-2 rounded-full ${isStudent ? "hover:bg-gray-700" : "hover:bg-gray-100"} transition-colors relative`}
                >
                  <Bell className={`h-5 w-5 ${isStudent ? "text-gray-300" : "text-gray-600"}`} />
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <h3 className="text-sm font-medium text-gray-900">Notificações</h3>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      <div className="px-4 py-2 hover:bg-gray-50 cursor-pointer">
                        <p className="text-sm font-medium text-gray-900">Novo treino disponível</p>
                        <p className="text-xs text-gray-500">Há 5 minutos</p>
                      </div>
                      <div className="px-4 py-2 hover:bg-gray-50 cursor-pointer">
                        <p className="text-sm font-medium text-gray-900">Treino concluído</p>
                        <p className="text-xs text-gray-500">Há 2 horas</p>
                      </div>
                    </div>
                    <Link
                      to="/notifications"
                      className="block px-4 py-2 text-center text-sm text-blue-600 hover:bg-gray-50"
                    >
                      Ver todas as notificações
                    </Link>
                  </div>
                )}
              </div>

              {/* Profile dropdown */}
              <div className="ml-4 relative">
                <button
                  className={`flex items-center ${isStudent ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"} text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
                >
                  <User className="h-5 w-5" />
                  <span className="ml-2 hidden md:inline-block">{currentUser?.name}</span>
                </button>
              </div>

              <button
                onClick={handleLogout}
                className={`ml-4 px-3 py-2 rounded-md text-sm font-medium ${isStudent ? "text-gray-300 hover:text-white hover:bg-gray-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"} transition-colors`}
              >
                <LogOut className="h-4 w-4 mr-1 inline-block align-middle" />
                <span className="align-middle">Sair</span>
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state. */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/admin"
              className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            >
              Dashboard
            </Link>
            <Link
              to="/admin/students"
              className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            >
              Alunos
            </Link>
            <Link
              to="/admin/exercises"
              className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            >
              Exercícios
            </Link>
            <Link
              to="/admin/workouts"
              className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            >
              Treinos
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-700">
            <div className="flex items-center px-5 sm:px-6">
              <div className="ml-3">
                <div className="text-base font-medium text-white">{currentUser?.name}</div>
                <div className="text-sm font-medium text-gray-400">{currentUser?.email}</div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="ml-auto bg-gray-800 flex-shrink-0 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
              >
                <span className="sr-only">Close panel</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-3 px-2 space-y-1 sm:px-3">
              <button
                onClick={handleLogout}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
