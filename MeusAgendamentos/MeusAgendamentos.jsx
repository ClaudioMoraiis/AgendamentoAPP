import React, { useState } from "react";
import PageLayout from "../components/PageLayout/PageLayout";
import { ROUTES } from "../constants/routes";
import "./MeusAgendamentos.css";

const dadosFicticios = [
  {
    id: 1,
    servico: "Corte de Cabelo",
    profissional: "João",
    data: "2025-10-15",
    hora: "10:00",
    situacao: "Aberto",
  },
  {
    id: 2,
    servico: "Barba",
    profissional: "Pedro",
    data: "2025-10-10",
    hora: "14:00",
    situacao: "Fechado",
  },
  {
    id: 3,
    servico: "Corte e Barba",
    profissional: "João",
    data: "2025-10-20",
    hora: "09:00",
    situacao: "Aberto",
  },
];

const MeusAgendamentos = () => {
  // TODO: Substituir por dados vindos do backend do cliente logado
  const [agendamentos] = useState(dadosFicticios);
  const [filtroData, setFiltroData] = useState("");
  const [filtroSituacao, setFiltroSituacao] = useState("");

  // Filtro por data e situação
  const agendamentosFiltrados = agendamentos.filter((ag) => {
    const matchData = filtroData ? ag.data === filtroData : true;
    const matchSituacao = filtroSituacao ? ag.situacao === filtroSituacao : true;
    return matchData && matchSituacao;
  });

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
      <div className="meusagend-filtros">
        {/* TODO: Substituir por campos controlados e buscar do backend */}
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
          <option value="Aberto">Aberto</option>
          <option value="Fechado">Fechado</option>
        </select>
      </div>
        <div className="meusagend-card-list">
          {agendamentosFiltrados.length === 0 ? (
            <p className="meusagend-vazio">Nenhum agendamento encontrado.</p>
          ) : (
            agendamentosFiltrados.map((ag) => (
              <div className={`meusagend-card ${ag.situacao.toLowerCase()}`} key={ag.id}>
                {/* Ícone do serviço */}
                <div style={{fontSize: '2.1rem', marginRight: '1.2rem', zIndex: 1}}>
                  {ag.servico.includes('Barba') ? '🧔' : '💇'}
                </div>
                <div>
                  <strong>Serviço:</strong> {ag.servico}
                </div>
                <div>
                  <strong>Profissional:</strong> {ag.profissional}
                </div>
                <div>
                  <strong>Data:</strong> {ag.data.split('-').reverse().join('/')}
                </div>
                <div>
                  <strong>Hora:</strong> {ag.hora}
                </div>
                <div>
                  <strong>Valor:</strong> R$ {ag.preco ? ag.preco.toFixed(2).replace('.', ',') : '--'}
                </div>
                {/* Badge de status */}
                <div className="status-badge">
                  {ag.situacao === 'Aberto' ? '🟢' : '🔴'} {ag.situacao}
                </div>
                {/* Botão de ação apenas para agendamentos abertos */}
                {ag.situacao === 'Aberto' && (
                  <button className={`action-btn ${ag.situacao.toLowerCase()}`}>Cancelar</button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default MeusAgendamentos;
