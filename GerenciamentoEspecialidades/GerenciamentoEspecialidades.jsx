import React, { useState, useEffect } from "react";
import "./GerenciamentoEspecialidades.css";
import LayoutPrincipal from "../LayoutPrincipal/LayoutPrincipal";
import { apiService } from "../services/api";

export default function GerenciamentoEspecialidades() {
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [novaEspecialidade, setNovaEspecialidade] = useState({ nome: "" });
  const [especialidadeEditando, setEspecialidadeEditando] = useState({ id: null, nome: "" });
  
  // Estados para notificações
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  // Função para mostrar notificação
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 4000);
  };

  // Carrega as especialidades da API quando o componente monta
  useEffect(() => {
    carregarEspecialidades();
  }, []);

  const carregarEspecialidades = async () => {
    try {
      setLoading(true);
      const response = await apiService.especialidades.listar();
      console.log('✅ Especialidades carregadas:', response);
      setEspecialidades(response || []);
    } catch (error) {
      console.error('❌ Erro ao carregar especialidades:', error);
      const errorMessage = error.message || 'Erro ao carregar especialidades. Tente novamente.';
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => setModalOpen(true);
  const closeModal = () => { 
    setModalOpen(false); 
    setNovaEspecialidade({ nome: "" }); 
  };
  
  const abrirModalEditar = (especialidade) => {
    setEspecialidadeEditando({ 
      id: especialidade.id,
      nome: especialidade.nome
    });
    setModalEditarOpen(true);
  };
  
  const closeModalEditar = () => { 
    setModalEditarOpen(false); 
    setEspecialidadeEditando({ id: null, nome: "" }); 
  };

  const salvarEspecialidade = async (e) => {
    e.preventDefault();
    if (!novaEspecialidade.nome || novaEspecialidade.nome.trim() === "") {
      showNotification("Preencha o nome da especialidade antes de salvar!", "error");
      return;
    }
    
    try {
      const especialidadeData = {
        nome: novaEspecialidade.nome.trim()
      };
      
      console.log('➕ Criando especialidade:', especialidadeData);
      await apiService.especialidades.criar(especialidadeData);
      showNotification('Especialidade criada com sucesso!', 'success');
      await carregarEspecialidades();
      closeModal();
    } catch (error) {
      console.error('❌ Erro ao criar especialidade:', error);
      const errorMessage = error.message || 'Erro ao criar especialidade. Tente novamente.';
      showNotification(errorMessage, 'error');
    }
  };

  const salvarEdicaoEspecialidade = async (e) => {
    e.preventDefault();
    if (!especialidadeEditando.nome || especialidadeEditando.nome.trim() === "") {
      showNotification("Preencha o nome da especialidade antes de salvar!", "error");
      return;
    }
    
    try {
      const especialidadeData = {
        nome: especialidadeEditando.nome.trim()
      };
      
      console.log('🔄 Atualizando especialidade ID:', especialidadeEditando.id);
      console.log('📝 Dados enviados:', especialidadeData);
      
      await apiService.especialidades.atualizar(especialidadeEditando.id, especialidadeData);
      showNotification('Especialidade atualizada com sucesso!', 'success');
      await carregarEspecialidades();
      closeModalEditar();
    } catch (error) {
      console.error('❌ Erro ao atualizar especialidade:', error);
      const errorMessage = error.message || 'Erro ao atualizar especialidade. Tente novamente.';
      showNotification(errorMessage, 'error');
    }
  };

  const excluirEspecialidade = async () => {
    if (window.confirm("Tem certeza que deseja excluir esta especialidade?")) {
      try {
        await apiService.especialidades.deletar(especialidadeEditando.id);
        showNotification('Especialidade excluída com sucesso!', 'success');
        await carregarEspecialidades();
        closeModalEditar();
      } catch (error) {
        console.error('❌ Erro ao excluir especialidade:', error);
        const errorMessage = error.message || 'Erro ao excluir especialidade. Tente novamente.';
        showNotification(errorMessage, 'error');
      }
    }
  };

  return (
    <LayoutPrincipal paginaAtiva="especialidades">
      {/* Notificação Toast */}
      {notification.show && (
        <div 
          className={`notification-toast ${notification.type}`}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '16px 24px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
            minWidth: '300px',
            fontSize: '14px',
            fontWeight: '500',
            backgroundColor: notification.type === 'success' ? '#10b981' : '#ef4444',
            color: 'white',
            border: `1px solid ${notification.type === 'success' ? '#059669' : '#dc2626'}`,
            animation: 'slideInRight 0.3s ease-out'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined">
              {notification.type === 'success' ? 'check_circle' : 'error'}
            </span>
            {notification.message}
          </div>
        </div>
      )}
      
      <div className="ge-main">
        <div className="ge-main-content">
          <div className="ge-header">
            <h2>Especialidades</h2>
            <button className="ge-btn-primary" onClick={openModal}>
              <span className="material-symbols-outlined">add</span>
              Nova especialidade
            </button>
          </div>
          <div className="ge-table-card">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="2" style={{ textAlign: 'center', padding: '20px' }}>
                      Carregando especialidades...
                    </td>
                  </tr>
                ) : especialidades.length === 0 ? (
                  <tr>
                    <td colSpan="2" style={{ textAlign: 'center', padding: '20px' }}>
                      Nenhuma especialidade encontrada
                    </td>
                  </tr>
                ) : (
                  especialidades.map((e) => (
                    <tr key={e.id}>
                      <td>{e.nome}</td>
                      <td>
                        <button 
                          className="ge-link-edit" 
                          onClick={() => abrirModalEditar(e)}
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      {/* Modal de nova especialidade */}
      {modalOpen && (
        <div className="ge-modal-overlay" onClick={closeModal}>
          <div
            className="ge-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Nova Especialidade</h3>
            <form onSubmit={salvarEspecialidade}>
              <label>Nome da especialidade</label>
              <input
                type="text"
                value={novaEspecialidade.nome}
                onChange={(e) =>
                  setNovaEspecialidade({ ...novaEspecialidade, nome: e.target.value })
                }
                placeholder="Ex: Corte infantil"
                required
              />

              <div className="ge-modal-buttons">
                <button type="button" onClick={closeModal} className="cancelar">
                  Cancelar
                </button>
                <button type="submit" className="salvar">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de editar especialidade */}
      {modalEditarOpen && (
        <div className="ge-modal-overlay" onClick={closeModalEditar}>
          <div
            className="ge-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Editar Especialidade</h3>
            <form onSubmit={salvarEdicaoEspecialidade}>
              <label>Nome da especialidade</label>
              <input
                type="text"
                value={especialidadeEditando.nome}
                onChange={(e) =>
                  setEspecialidadeEditando({ ...especialidadeEditando, nome: e.target.value })
                }
                placeholder="Ex: Corte infantil"
                required
              />

              <div className="ge-modal-buttons">
                <button 
                  type="button" 
                  onClick={excluirEspecialidade} 
                  className="excluir"
                >
                  Excluir
                </button>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="button" onClick={closeModalEditar} className="cancelar">
                    Cancelar
                  </button>
                  <button type="submit" className="salvar">
                    Salvar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </LayoutPrincipal>
  );
}
