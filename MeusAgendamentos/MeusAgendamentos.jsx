import React, { useState, useEffect } from "react";
import PageLayout from "../components/PageLayout/PageLayout";
import { ROUTES } from "../constants/routes";
import { apiService } from "../services/api";
import "./MeusAgendamentos.css";

const MeusAgendamentos = () => {
  const [agendamentos, setAgendamentos] = useState([]);
  const [filtroData, setFiltroData] = useState("");
  const [filtroSituacao, setFiltroSituacao] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalCancelar, setModalCancelar] = useState({ aberto: false, agendamentoId: null, agendamentoInfo: null });
  const [cancelando, setCancelando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState("");

  useEffect(() => {
    carregarAgendamentos();
  }, []);

  const carregarAgendamentos = async () => {
    setLoading(true);
    setError("");
    
    try {
      const usuarioId = localStorage.getItem("usuarioId");
      if (!usuarioId) {
        setError("Usuário não identificado. Faça login novamente.");
        setLoading(false);
        return;
      }
      
      const response = await apiService.agendamentos.listarPorCliente(usuarioId);
      setAgendamentos(response || []);
    } catch (err) {
      console.error("Erro ao carregar agendamentos:", err);
      setError(err.message || "Erro ao carregar agendamentos");
    } finally {
      setLoading(false);
    }
  };

  // Filtro por data e situação
  const agendamentosFiltrados = agendamentos.filter((ag) => {
    const matchData = filtroData ? ag.data === filtroData : true;
    const matchSituacao = filtroSituacao ? ag.status === filtroSituacao : true;
    return matchData && matchSituacao;
  });

  const abrirModalCancelar = (agendamento) => {
    setModalCancelar({
      aberto: true,
      agendamentoId: agendamento.id,
      agendamentoInfo: agendamento
    });
  };

  const fecharModalCancelar = () => {
    setModalCancelar({ aberto: false, agendamentoId: null, agendamentoInfo: null });
  };

  const confirmarCancelamento = async () => {
    setCancelando(true);
    setError("");
    
    try {
      const response = await apiService.agendamentos.cancelar(modalCancelar.agendamentoId);
      
      // Extrai mensagem de sucesso da resposta
      let mensagem = "Agendamento cancelado com sucesso!";
      if (typeof response === 'string') {
        mensagem = response;
      } else if (response?.message || response?.mensagem || response?.Sucesso) {
        mensagem = response.message || response.mensagem || response.Sucesso;
      }
      
      setMensagemSucesso(mensagem);
      fecharModalCancelar();
      
      // Recarrega a lista imediatamente
      await carregarAgendamentos();
      
      // Remove a mensagem após 3 segundos
      setTimeout(() => {
        setMensagemSucesso("");
      }, 3000);
      
    } catch (err) {
      console.error("Erro ao cancelar agendamento:", err);
      setError(err.message || "Erro ao cancelar agendamento");
      fecharModalCancelar();
    } finally {
      setCancelando(false);
    }
  };

  const handleLogout = () => {
    // Limpa os dados do localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    
    // Usa replace para não permitir voltar com as setas do navegador
    window.location.replace(ROUTES.LOGIN);
  };

  return (
    <PageLayout userType="CLIENT" onLogout={handleLogout}>
      <div className="meusagend-content">
        {mensagemSucesso && (
          <div className="meusagend-sucesso">
            <span className="material-symbols-outlined">check_circle</span>
            <span>{mensagemSucesso}</span>
          </div>
        )}
        
        {error && (
          <div className="meusagend-error">
            <span className="material-symbols-outlined">error</span>
            <span>{error}</span>
            <button onClick={carregarAgendamentos} className="meusagend-retry-btn">Tentar Novamente</button>
          </div>
        )}
        
        <div className="meusagend-filtros">
          <input
            type="date"
            value={filtroData}
            onChange={e => setFiltroData(e.target.value)}
            className="meusagend-input"
            placeholder="Filtrar por data"
          />
          <select
            value={filtroSituacao}
            onChange={e => setFiltroSituacao(e.target.value)}
            className="meusagend-input"
          >
            <option value="">Todas as Situações</option>
            <option value="CONFIRMADO">Confirmado</option>
            <option value="CANCELADO">Cancelado</option>
            <option value="CONCLUIDO">Concluído</option>
          </select>
        </div>
        
        {loading ? (
          <div className="meusagend-loading">
            <div className="meusagend-spinner"></div>
            <p>Carregando agendamentos...</p>
          </div>
        ) : (
          <div className="meusagend-card-list">
            {agendamentosFiltrados.length === 0 ? (
              <p className="meusagend-vazio">Nenhum agendamento encontrado.</p>
            ) : (
              agendamentosFiltrados.map((ag) => (
                <div className={`meusagend-card ${ag.status.toLowerCase()}`} key={ag.id}>
                  <div style={{fontSize: '2.1rem', marginRight: '1.2rem', zIndex: 1}}>
                    {ag.servico.toUpperCase().includes('BARBA') ? '🧔' : '💇'}
                  </div>
                  <div>
                    <strong>Serviço:</strong> {ag.servico}
                  </div>
                  <div>
                    <strong>Profissional:</strong> {ag.nomeProfissional}
                  </div>
                  <div>
                    <strong>Data:</strong> {ag.data.split('-').reverse().join('/')}
                  </div>
                  <div>
                    <strong>Horário:</strong> {ag.horarioInicio.substring(0, 5)} - {ag.horarioFim.substring(0, 5)}
                  </div>
                  <div>
                    <strong>Valor:</strong> R$ {ag.valor.toFixed(2).replace('.', ',')}
                  </div>
                  <div className="status-badge">
                    {ag.status === 'CONFIRMADO' ? '🟢' : ag.status === 'CONCLUIDO' ? '🔵' : '🔴'} {ag.status}
                  </div>
                  {ag.status === 'CONFIRMADO' && (
                    <button 
                      className={`action-btn ${ag.status.toLowerCase()}`}
                      onClick={() => abrirModalCancelar(ag)}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Cancelamento */}
      {modalCancelar.aberto && (
        <div className="modal-overlay" onClick={fecharModalCancelar}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="material-symbols-outlined modal-icon-warning">warning</span>
              <h3>Confirmar Cancelamento</h3>
            </div>
            
            <div className="modal-body">
              <p>Tem certeza que deseja cancelar este agendamento?</p>
              {modalCancelar.agendamentoInfo && (
                <div className="modal-agendamento-info">
                  <p><strong>Serviço:</strong> {modalCancelar.agendamentoInfo.servico}</p>
                  <p><strong>Profissional:</strong> {modalCancelar.agendamentoInfo.nomeProfissional}</p>
                  <p><strong>Data:</strong> {modalCancelar.agendamentoInfo.data.split('-').reverse().join('/')}</p>
                  <p><strong>Horário:</strong> {modalCancelar.agendamentoInfo.horarioInicio.substring(0, 5)}</p>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button 
                className="modal-btn-cancelar" 
                onClick={fecharModalCancelar}
                disabled={cancelando}
              >
                Não, manter
              </button>
              <button 
                className="modal-btn-confirmar" 
                onClick={confirmarCancelamento}
                disabled={cancelando}
              >
                {cancelando ? "Cancelando..." : "Sim, cancelar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default MeusAgendamentos;
