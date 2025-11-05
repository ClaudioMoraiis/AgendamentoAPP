import React, { useState, useEffect } from "react";
import "./GerenciamentoServicos.css";
import LayoutPrincipal from "../LayoutPrincipal/LayoutPrincipal";
import { apiService } from "../services/api";

export default function GerenciamentoServicos() {
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [novoServico, setNovoServico] = useState({ nome: "", duracao: "", valor: "" });
  const [servicoEditando, setServicoEditando] = useState({ id: null, nome: "", duracao: "", valor: "" });
  
  // Estados para notificações
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  // Função para mostrar notificação
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 4000); // Remove após 4 segundos
  };

  // Carrega os serviços da API quando o componente monta
  useEffect(() => {
    carregarServicos();
  }, []);

  const carregarServicos = async () => {
    try {
      setLoading(true);
      const response = await apiService.servicos.listar();
      console.log('✅ Serviços carregados:', response);
      setServicos(response || []);
    } catch (error) {
      console.error('❌ Erro ao carregar serviços:', error);
      const errorMessage = error.message || 'Erro ao carregar serviços. Tente novamente.';
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => setModalOpen(true);
  const closeModal = () => { 
    setModalOpen(false); 
    setNovoServico({ nome: "", duracao: "", valor: "" }); 
  };
  
  const abrirModalEditar = (servico) => {
    setServicoEditando({ 
      id: servico.id, // usa o ID do backend
      nome: servico.nome, 
      duracao: servico.duracao, 
      valor: servico.valor 
    });
    setModalEditarOpen(true);
  };
  
  const closeModalEditar = () => { 
    setModalEditarOpen(false); 
    setServicoEditando({ id: null, nome: "", duracao: "", valor: "" }); 
  };
  const salvarServico = async (e) => {
    e.preventDefault();
    if (!novoServico.nome || !novoServico.duracao || !novoServico.valor) {
      showNotification("Preencha todos os campos antes de salvar!", "error");
      return;
    }
    
    try {
      const servicoData = {
        nome: novoServico.nome.toUpperCase(),
        duracao: novoServico.duracao.toUpperCase(),
        valor: parseFloat(novoServico.valor)
      };
      
      await apiService.servicos.criar(servicoData);
      showNotification('Serviço criado com sucesso!', 'success');
      await carregarServicos(); // Recarrega a lista
      closeModal();
    } catch (error) {
      console.error('❌ Erro ao criar serviço:', error);
      const errorMessage = error.message || 'Erro ao criar serviço. Tente novamente.';
      showNotification(errorMessage, 'error');
    }
  };

  const salvarEdicaoServico = async (e) => {
    e.preventDefault();
    if (!servicoEditando.nome || !servicoEditando.duracao || !servicoEditando.valor) {
      showNotification("Preencha todos os campos antes de salvar!", "error");
      return;
    }
    
    try {
      const servicoData = {
        nome: servicoEditando.nome,
        duracao: servicoEditando.duracao,
        preco: parseFloat(servicoEditando.valor)
      };
      
      console.log('🔄 Atualizando serviço ID:', servicoEditando.id);
      console.log('📝 Dados enviados:', servicoData);
      
      await apiService.servicos.atualizar(servicoEditando.id, servicoData);
      showNotification('Serviço atualizado com sucesso!', 'success');
      await carregarServicos(); // Recarrega a lista
      closeModalEditar();
    } catch (error) {
      console.error('❌ Erro ao atualizar serviço:', error);
      const errorMessage = error.message || 'Erro ao atualizar serviço. Tente novamente.';
      showNotification(errorMessage, 'error');
    }
  };

  const excluirServico = async () => {
    if (window.confirm("Tem certeza que deseja excluir este serviço?")) {
      try {
        await apiService.servicos.deletar(servicoEditando.id);
        showNotification('Serviço excluído com sucesso!', 'success');
        await carregarServicos(); // Recarrega a lista
        closeModalEditar();
      } catch (error) {
        console.error('❌ Erro ao excluir serviço:', error);
        const errorMessage = error.message || 'Erro ao excluir serviço. Tente novamente.';
        showNotification(errorMessage, 'error');
      }
    }
  };

  return (
    <LayoutPrincipal paginaAtiva="servicos">
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
      
      <div className="gs-main">
        <div className="gs-main-content">
          <div className="gs-header">
            <h2>Serviços</h2>
            <button className="gs-btn-primary" onClick={openModal}>
              <span className="material-symbols-outlined">add</span>
              Novo serviço
            </button>
          </div>
          <div className="gs-table-card">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Duração</th>
                  <th>Valor</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                      Carregando serviços...
                    </td>
                  </tr>
                ) : servicos.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                      Nenhum serviço encontrado
                    </td>
                  </tr>
                ) : (
                  servicos.map((s) => (
                    <tr key={s.id}>
                      <td>{s.nome}</td>
                      <td>{s.duracao}</td>
                      <td>R$ {typeof s.valor === 'number' ? s.valor.toFixed(2) : s.valor}</td>
                      <td>
                        <button 
                          className="gs-link-edit" 
                          onClick={() => abrirModalEditar(s)}
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

      {/* Modal de novo serviço */}
      {modalOpen && (
        <div className="gs-modal-overlay" onClick={closeModal}>
          <div
            className="gs-modal"
            onClick={(e) => e.stopPropagation()} // evita fechar ao clicar dentro
          >
            <h3>Novo Serviço</h3>
            <form onSubmit={salvarServico}>
              <label>Nome do serviço</label>
              <input
                type="text"
                value={novoServico.nome}
                onChange={(e) =>
                  setNovoServico({ ...novoServico, nome: e.target.value })
                }
                placeholder="Ex: Corte de cabelo"
                required
              />

              <label>Duração</label>
              <input
                type="text"
                value={novoServico.duracao}
                onChange={(e) =>
                  setNovoServico({ ...novoServico, duracao: e.target.value })
                }
                placeholder="Ex: 30 minutos"
                required
              />

              <label>Preço</label>
              <input
                type="text"
                value={novoServico.valor}
                onChange={(e) =>
                  setNovoServico({ ...novoServico, valor: e.target.value })
                }
                placeholder="Ex: R$ 50,00"
                required
              />

              <div className="gs-modal-buttons">
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

      {/* Modal de editar serviço */}
      {modalEditarOpen && (
        <div className="gs-modal-overlay" onClick={closeModalEditar}>
          <div
            className="gs-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Editar Serviço</h3>
            <form onSubmit={salvarEdicaoServico}>
              <label>Nome do serviço</label>
              <input
                type="text"
                value={servicoEditando.nome}
                onChange={(e) =>
                  setServicoEditando({ ...servicoEditando, nome: e.target.value })
                }
                placeholder="Ex: Corte de cabelo"
                required
              />

              <label>Duração</label>
              <input
                type="text"
                value={servicoEditando.duracao}
                onChange={(e) =>
                  setServicoEditando({ ...servicoEditando, duracao: e.target.value })
                }
                placeholder="Ex: 30 minutos"
                required
              />

              <label>Preço</label>
              <input
                type="text"
                value={servicoEditando.valor}
                onChange={(e) =>
                  setServicoEditando({ ...servicoEditando, valor: e.target.value })
                }
                placeholder="Ex: R$ 50,00"
                required
              />

              <div className="gs-modal-buttons">
                <button 
                  type="button" 
                  onClick={excluirServico} 
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
