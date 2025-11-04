import React, { useEffect, useState } from "react";
import PageLayout from "../components/PageLayout/PageLayout";
import { useAppNavigation } from "../hooks/useAppNavigation";
import { ROUTES } from "../constants/routes";
import "./Servicos.css";

const Servicos = () => {
  const { navigateTo } = useAppNavigation();
  
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

  const handleLogout = () => {
    // Limpa os dados do localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    
    // Usa replace para não permitir voltar com as setas do navegador
    window.location.replace(ROUTES.LOGIN);
  };

  const handleAgendar = (servico) => {
    // TODO: Pode passar dados do serviço via state ou query params
    console.log('Agendando serviço:', servico.nome);
    navigateTo.agendamento();
  };

  return (
    <PageLayout userType="CLIENT" onLogout={handleLogout}>
      <div className="servicos-content">
        <div className="servicos-list">
          {servicos.map((servico) => (
            <div className="servico-card" key={servico.id}>
              <div className="servico-icone">
                {servico.nome.includes('Barba') ? '🧔' : servico.nome.includes('Sobrancelha') ? '👁️' : '💇'}
              </div>
              <h2 className="servico-nome">{servico.nome}</h2>
              <p className="servico-descricao">{servico.descricao}</p>
              <div className="servico-footer">
                <span className="servico-preco">R$ {servico.preco},00</span>
                <button 
                  className="servico-btn-agendar"
                  onClick={() => handleAgendar(servico)}
                >
                  Agendar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default Servicos;
