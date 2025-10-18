
import React, { useState } from "react";
import HeaderNavigation from "../components/HeaderNavigation/HeaderNavigation";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Agendamento.css";

const Agendamento = () => {
  const [date, setDate] = useState(new Date());

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

  const handleLogout = () => {
    // TODO: Implementar logout
    console.log('Logout realizado');
  };

  return (
    <div className="agendamento-root">
      <HeaderNavigation 
        userType="CLIENT" 
        onLogout={handleLogout}
      />
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