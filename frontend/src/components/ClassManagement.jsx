import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, Edit, Trash2, BookOpen, Users, Calendar } from 'lucide-react';

const ClassManagement = ({ initialClasses = [], onUpdateClasses, onBack }) => {
  const [classes, setClasses] = useState(initialClasses);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    year: new Date().getFullYear().toString(),
    teacher: '',
    description: ''
  });

  const API_BASE_URL = '/api';

  useEffect(() => {
    setClasses(initialClasses);
  }, [initialClasses]);

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.teacher.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.grade || !formData.teacher) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const url = editingClass 
        ? `${API_BASE_URL}/classes/${editingClass.id}`
        : `${API_BASE_URL}/classes`;
      
      const method = editingClass ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedClass = await response.json();
        
        let updatedClasses;
        if (editingClass) {
          updatedClasses = classes.map(cls => 
            cls.id === editingClass.id ? updatedClass : cls
          );
        } else {
          updatedClasses = [...classes, updatedClass];
        }
        
        setClasses(updatedClasses);
        
        // Sincronizar com o Dashboard
        if (onUpdateClasses) {
          onUpdateClasses(updatedClasses);
        }
        
        resetForm();
        alert(editingClass ? 'Turma atualizada com sucesso!' : 'Turma criada com sucesso!');
      } else {
        const errorData = await response.json();
        alert(`Erro: ${errorData.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao salvar turma:', error);
      alert('Erro ao salvar turma. Tente novamente.');
    }
  };

  const handleEdit = (cls) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name,
      grade: cls.grade,
      year: cls.year.toString(),
      teacher: cls.teacher,
      description: cls.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (cls) => {
    if (!confirm(`Tem certeza que deseja excluir a turma "${cls.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/classes/${cls.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        const updatedClasses = classes.filter(c => c.id !== cls.id);
        setClasses(updatedClasses);
        
        // Sincronizar com o Dashboard
        if (onUpdateClasses) {
          onUpdateClasses(updatedClasses);
        }
        
        alert('Turma excluída com sucesso!');
      } else {
        const errorData = await response.json();
        alert(`Erro: ${errorData.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao excluir turma:', error);
      alert('Erro ao excluir turma. Tente novamente.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      grade: '',
      year: new Date().getFullYear().toString(),
      teacher: '',
      description: ''
    });
    setEditingClass(null);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-xl font-semibold text-gray-900">
                Gerenciar Turmas
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
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
                        {classes.length}
                      </dd>
                      <dd className="text-sm text-gray-500">
                        Turmas cadastradas
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
                        {classes.reduce((total, cls) => total + (cls.student_count || 5), 0)}
                      </dd>
                      <dd className="text-sm text-gray-500">
                        Em todas as turmas
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
                    <Calendar className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Professores Ativos
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {new Set(classes.map(cls => cls.teacher)).size}
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

          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Buscar turmas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Turma
            </button>
          </div>

          {/* Classes List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {filteredClasses.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma turma encontrada</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'Tente ajustar sua busca.' : 'Comece criando uma nova turma.'}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredClasses.map((cls) => (
                  <li key={cls.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <BookOpen className="h-6 w-6 text-blue-500" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-blue-600">
                              {cls.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              Ano: {cls.year} • Prof. {cls.teacher}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {cls.grade}
                          </span>
                          <div className="flex items-center text-sm text-gray-500">
                            <Users className="flex-shrink-0 mr-1.5 h-4 w-4" />
                            {cls.student_count || 5} alunos
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          {cls.description}
                        </p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(cls)}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(cls)}
                            className="inline-flex items-center px-3 py-1 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingClass ? 'Editar Turma' : 'Nova Turma'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Fechar</span>
                  ✕
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                {editingClass ? 'Modifique as informações da turma.' : 'Preencha as informações da nova turma.'}
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Turma A"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Série *
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.grade}
                    onChange={(e) => setFormData({...formData, grade: e.target.value})}
                  >
                    <option value="">Selecione a série</option>
                    <option value="1º Ano">1º Ano</option>
                    <option value="2º Ano">2º Ano</option>
                    <option value="3º Ano">3º Ano</option>
                    <option value="4º Ano">4º Ano</option>
                    <option value="5º Ano">5º Ano</option>
                    <option value="6º Ano">6º Ano</option>
                    <option value="7º Ano">7º Ano</option>
                    <option value="8º Ano">8º Ano</option>
                    <option value="9º Ano">9º Ano</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ano
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                  >
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Professor *
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.teacher}
                    onChange={(e) => setFormData({...formData, teacher: e.target.value})}
                  >
                    <option value="">Selecione o professor</option>
                    <option value="Professor Exemplo">Professor Exemplo</option>
                    <option value="Maria Silva">Maria Silva</option>
                    <option value="João Santos">João Santos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="Descrição opcional"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {editingClass ? 'Salvar Alterações' : 'Criar Turma'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassManagement;
