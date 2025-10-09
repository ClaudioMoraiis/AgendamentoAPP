
import React, { useState } from "react";
import { Link } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Agendamento.css";

const Agendamento = () => {
  const [date, setDate] = useState(new Date());

  // Exemplo de horários disponíveis para a data selecionada

  // TODO: Substituir por dados vindos do backend (serviços)
  // Exemplo: buscar serviços via API e popular o select
  // const [servicos, setServicos] = useState([]);

  // TODO: Substituir por dados vindos do backend (profissionais)
  // Exemplo: buscar profissionais via API e popular o select
  // const [profissionais, setProfissionais] = useState([]);

  // TODO: Substituir por dados vindos do backend (horários disponíveis para a data selecionada)
  const horariosDisponiveis = [
    "09:00",
    "10:00",
    "11:00",
    "14:00",
    "15:00",
    "16:00",
  ];
  const horarioIndisponivel = "14:00";
  const [horarioSelecionado, setHorarioSelecionado] = useState("10:00");

  return (
    <div className="agendamento-root">
    <header className="agendamento-header">
      <div className="agendamento-header-container">
        <div className="agendamento-header-left">
          <svg className="agendamento-logo" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 5C7 3.34315 8.34315 2 10 2H14C15.6569 2 17 3.34315 17 5V7H20V12H4V7H7V5ZM6 14H18V20C18 21.1046 17.1046 22 16 22H8C6.89543 22 6 21.1046 6 20V14Z"></path>
          </svg>
          <h1 className="agendamento-title">Agendamento</h1>
        </div>
        <nav className="agendamento-nav">
          {/* Link para Serviços usando react-router-dom, igual aos outros */}
          <Link className="agendamento-nav-link" to="/servicos">Serviços</Link>
          <a className="agendamento-nav-link active" href="#">Agendamentos</a>
          {/* Link para Meus Agendamentos */}
          <Link className="agendamento-nav-link" to="/meus-agendamentos">Meus Agendamentos</Link>
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
    <main className="agendamento-main">
      <div className="agendamento-card">
        <h2 className="agendamento-section-title">Agendar Horário</h2>
        <div className="agendamento-form-grid">
          <div>
            <label className="agendamento-label" htmlFor="service">Serviço</label>
            <select className="agendamento-select" id="service">
              {/* TODO: Popular opções de serviço dinamicamente com dados do backend */}
              <option>Selecione o serviço</option>
              <option>Corte de Cabelo</option>
              <option>Barba</option>
              <option>Corte e Barba</option>
            </select>
          </div>
          <div>
            <label className="agendamento-label" htmlFor="professional">Profissional</label>
            <select className="agendamento-select" id="professional">
              {/* TODO: Popular opções de profissionais dinamicamente com dados do backend */}
              <option>Selecione o profissional</option>
              <option>João</option>
              <option>Pedro</option>
            </select>
          </div>
        </div>
        <div className="agendamento-calendar-card">
          <Calendar
            onChange={setDate}
            value={date}
            locale="pt-BR"
            className="agendamento-calendar-component"
          />
        </div>
        <div>
          <h3 className="agendamento-section-title">
            Horários Disponíveis para {date.toLocaleDateString("pt-BR")}
          </h3>
          <div className="agendamento-horarios">
            {/* TODO: Popular horários disponíveis dinamicamente com dados do backend para a data selecionada */}
            {horariosDisponiveis.map((hora) => (
              <button
                key={hora}
                className={`agendamento-horario-btn${horarioSelecionado === hora ? " selected" : ""}${hora === horarioIndisponivel ? " disabled" : ""}`}
                disabled={hora === horarioIndisponivel}
                onClick={() => setHorarioSelecionado(hora)}
              >
                {hora}
              </button>
            ))}
          </div>
        </div>
        <div className="agendamento-footer">
          {/* TODO: Ao clicar, enviar dados do agendamento para o backend */}
          <button className="agendamento-agendar-btn">
            Agendar Horário
          </button>
        </div>
        <div className="agendamento-confirmacao">
          <h3 className="agendamento-section-title">Confirmação de Agendamento</h3>
          <div className="agendamento-confirmacao-msg">
            <svg className="agendamento-confirmacao-icon" fill="currentColor" viewBox="0 0 20 20">
              <path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd"></path>
            </svg>
            {/* TODO: Exibir mensagem de confirmação com dados vindos do backend após agendar */}
            <p className="agendamento-confirmacao-text">
              Seu horário foi agendado com sucesso para o dia {date.toLocaleDateString("pt-BR")} às {horarioSelecionado}.
            </p>
          </div>
          <div className="agendamento-confirmacao-actions">
            <button className="agendamento-cancelar-btn">Cancelar</button>
            <button className="agendamento-reagendar-btn">Reagendar</button>
          </div>
        </div>
      </div>
    </main>
  </div>
  );
};

export default Agendamento;