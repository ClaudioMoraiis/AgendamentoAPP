import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Servicos.css";

const Servicos = () => {
  // TODO: Substituir por chamada ao backend para buscar serviços
  const [servicos, setServicos] = useState([
    { id: 1, nome: "Corte de Cabelo", descricao: "Corte masculino, feminino ou infantil.", preco: 40 },
    { id: 2, nome: "Barba", descricao: "Barba completa com toalha quente.", preco: 25 },
    { id: 3, nome: "Corte e Barba", descricao: "Pacote corte + barba.", preco: 60 },
    { id: 4, nome: "Sobrancelha", descricao: "Design de sobrancelha.", preco: 15 },
  ]);

  // TODO: Use useEffect para buscar serviços do backend futuramente
  // useEffect(() => {
  //   fetch('/api/servicos')
  //     .then(res => res.json())
  //     .then(data => setServicos(data));
  // }, []);

  return (
    <div className="servicos-root">
      <header className="agendamento-header">
        <div className="agendamento-header-container">
          <div className="agendamento-header-left">
            <svg className="agendamento-logo" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 5C7 3.34315 8.34315 2 10 2H14C15.6569 2 17 3.34315 17 5V7H20V12H4V7H7V5ZM6 14H18V20C18 21.1046 17.1046 22 16 22H8C6.89543 22 6 21.1046 6 20V14Z"></path>
            </svg>
            <h1 className="agendamento-title">Agendamento</h1>
          </div>
          <nav className="agendamento-nav">
            <Link className="agendamento-nav-link active" to="/servicos">Serviços</Link>
            <Link className="agendamento-nav-link" to="/agendamento">Agendamentos</Link>
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
      <h1 className="servicos-title">Serviços Disponíveis</h1>
      <div className="servicos-list">
        {servicos.map((servico) => (
          <div className="servico-card" key={servico.id}>
            <div className="servico-icone">
              {servico.nome.includes('Barba') ? '🧔' : servico.nome.includes('Sobrancelha') ? '👁️' : '💇'}
            </div>
            <h2 className="servico-nome">{servico.nome}</h2>
            <p className="servico-descricao">{servico.descricao}</p>
            <span className="servico-preco">R$ {servico.preco},00</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Servicos;
