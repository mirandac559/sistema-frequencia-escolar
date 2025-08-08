import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from './LoginForm';
import ClassManagement from './ClassManagement';
import StudentManagement from './StudentManagement';
import UserManagement from './UserManagement';
import AttendanceRegister from './AttendanceRegister';
import Reports from './Reports';
import { 
  GraduationCap, 
  Users, 
  Calendar, 
  BarChart3, 
  Settings, 
  LogOut,
  BookOpen,
  UserCheck,
  FileText,
  UserPlus
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout, loading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState({
    classes: [],
    students: [],
    stats: { totalClasses: 0, totalStudents: 0, totalTeachers: 0 }
  });

  const API_BASE_URL = '/api';

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Buscar turmas
      const classesResponse = await fetch(`${API_BASE_URL}/classes`, {
        credentials: 'include'
      });
      
      if (classesResponse.ok) {
        const classesData = await classesResponse.json();
        
        // Buscar estudantes
        const studentsResponse = await fetch(`${API_BASE_URL}/students`, {
          credentials: 'include'
        });
        
        if (studentsResponse.ok) {
          const studentsData = await studentsResponse.json();
          
          // Buscar estatísticas
          const statsResponse = await fetch(`${API_BASE_URL}/attendance/statistics`, {
            credentials: 'include'
          });
          
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            
            setDashboardData({
              classes: classesData,
              students: studentsData,
              stats: {
                totalClasses: classesData.length,
                totalStudents: studentsData.length,
                totalTeachers: statsData.totalTeachers || 1
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    }
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    fetchDashboardData(); // Recarregar dados quando volta ao dashboard
  };

  const updateClassesData = (updatedClasses) => {
    setDashboardData(prev => ({
      ...prev,
      classes: updatedClasses,
      stats: {
        ...prev.stats,
        totalClasses: updatedClasses.length
      }
    }));
  };

  const updateStudentsData = (updatedStudents) => {
    setDashboardData(prev => ({
      ...prev,
      students: updatedStudents,
      stats: {
        ...prev.stats,
        totalStudents: updatedStudents.length
      }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  if (currentView === 'classes') {
    return (
      <ClassManagement 
        initialClasses={dashboardData.classes}
        onUpdateClasses={updateClassesData}
        onBack={handleBackToDashboard}
      />
    );
  }

  if (currentView === 'students') {
    return (
      <StudentManagement 
        initialStudents={dashboardData.students}
        initialClasses={dashboardData.classes}
        onUpdateStudents={updateStudentsData}
        onBack={handleBackToDashboard}
      />
    );
  }

  if (currentView === 'users') {
    return <UserManagement onBack={handleBackToDashboard} />;
  }

  if (currentView === 'attendance') {
    return <AttendanceRegister onBack={handleBackToDashboard} />;
  }

  if (currentView === 'reports') {
    return <Reports onBack={handleBackToDashboard} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-xl font-semibold text-gray-900">
                Sistema de Frequência Escolar
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user.role === 'admin' ? 'Administrador do Sistema' : 'Professor'}
              </span>
              <span className="text-sm font-medium text-gray-900">{user.username}</span>
              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Bem-vindo, {user.role === 'admin' ? 'Administrador do Sistema' : 'Professor'}!
            </h2>
            <p className="text-gray-600">Gerencie o sistema de frequência escolar.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BookOpen className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total de Turmas
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {dashboardData.stats.totalClasses}
                      </dd>
                      <dd className="text-sm text-gray-500">
                        Todas as turmas
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total de Alunos
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {dashboardData.stats.totalStudents}
                      </dd>
                      <dd className="text-sm text-gray-500">
                        Alunos cadastrados
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserCheck className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Professores Ativos
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {dashboardData.stats.totalTeachers}
                      </dd>
                      <dd className="text-sm text-gray-500">
                        Professores cadastrados
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Turmas Section */}
          {dashboardData.classes.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Turmas</h3>
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {dashboardData.classes.map((turma) => (
                    <li key={turma.id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <BookOpen className="h-6 w-6 text-blue-500" />
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-blue-600">
                                {turma.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                Ano: {turma.year} • Prof. {turma.teacher}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Users className="flex-shrink-0 mr-1.5 h-4 w-4" />
                            {turma.student_count || 5} alunos
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            {turma.description}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Ações Rápidas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <button
                onClick={() => setCurrentView('attendance')}
                className="relative group bg-blue-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-blue-600 text-white">
                    <Calendar className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Registrar Frequência
                  </h3>
                </div>
              </button>

              <button
                onClick={() => setCurrentView('reports')}
                className="relative group bg-yellow-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-yellow-500 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-yellow-600 text-white">
                    <BarChart3 className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Ver Relatórios
                  </h3>
                </div>
              </button>

              {user.role === 'admin' && (
                <>
                  <button
                    onClick={() => setCurrentView('users')}
                    className="relative group bg-purple-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-purple-500 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <div>
                      <span className="rounded-lg inline-flex p-3 bg-purple-600 text-white">
                        <UserPlus className="h-6 w-6" />
                      </span>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Gerenciar Usuários
                      </h3>
                    </div>
                  </button>

                  <button
                    onClick={() => setCurrentView('classes')}
                    className="relative group bg-teal-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-teal-500 rounded-lg hover:bg-teal-100 transition-colors"
                  >
                    <div>
                      <span className="rounded-lg inline-flex p-3 bg-teal-600 text-white">
                        <BookOpen className="h-6 w-6" />
                      </span>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Gerenciar Turmas
                      </h3>
                    </div>
                  </button>

                  <button
                    onClick={() => setCurrentView('students')}
                    className="relative group bg-pink-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-pink-500 rounded-lg hover:bg-pink-100 transition-colors"
                  >
                    <div>
                      <span className="rounded-lg inline-flex p-3 bg-pink-600 text-white">
                        <Users className="h-6 w-6" />
                      </span>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Gerenciar Estudantes
                      </h3>
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
