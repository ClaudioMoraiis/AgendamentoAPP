import React, { useState } from "react";
import { Link } from "react-router-dom";
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

  return (
    <div className="meusagend-root">
      <header className="agendamento-header">
        <div className="agendamento-header-container">
          <div className="agendamento-header-left">
            <svg className="agendamento-logo" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 5C7 3.34315 8.34315 2 10 2H14C15.6569 2 17 3.34315 17 5V7H20V12H4V7H7V5ZM6 14H18V20C18 21.1046 17.1046 22 16 22H8C6.89543 22 6 21.1046 6 20V14Z"></path>
            </svg>
            <h1 className="agendamento-title">Agendamento</h1>
          </div>
          <nav className="agendamento-nav">
            <Link className="agendamento-nav-link" to="/servicos">Serviços</Link>
            <Link className="agendamento-nav-link" to="/agendamento">Agendamentos</Link>
            <Link className="agendamento-nav-link active" to="/meus-agendamentos">Meus Agendamentos</Link>
          </nav>
          <div className="agendamento-header-right">
            <button className="agendamento-bell-btn">
              <svg className="agendamento-bell-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </button>
            <div className="agendamento-avatar" />
          </div>
        </div>
      </header>
      <h1 className="meusagend-title">Meus Agendamentos</h1>
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
  );
};

export default MeusAgendamentos;
