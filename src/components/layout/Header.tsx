import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Dumbbell, LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to={currentUser?.role === 'admin' ? '/admin' : '/student'}>
                <Dumbbell className="h-8 w-8 text-blue-600" />
              </Link>
              <h1 className="ml-2 text-xl font-bold text-gray-900">{title}</h1>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-4 hidden sm:block">
                Olá, {currentUser?.name}
              </span>
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-full">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="ml-4 px-3 py-1 border border-transparent text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center"
            >
              <LogOut className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;