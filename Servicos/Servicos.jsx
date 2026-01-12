import React, { useEffect, useState } from "react";
import LayoutPrincipal from "../LayoutPrincipal/LayoutPrincipal";
import { useAppNavigation } from "../hooks/useAppNavigation";
import { ROUTES } from "../constants/routes";
import { apiService } from "../services/api";
import "./Servicos.css";

const Servicos = () => {
  const { navigateTo } = useAppNavigation();
  
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Buscar serviços do backend
  useEffect(() => {
    carregarServicos();
  }, []);

  const carregarServicos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.servicos.listar();
      console.log('✅ Serviços carregados:', response);
      
      // Processar serviços (garantir que preco seja número)
      const servicosProcessados = (response || []).map(s => ({
        id: s.id,
        nome: s.nome,
        descricao: s.descricao || '',
        preco: typeof s.valor === 'number' ? s.valor : parseFloat(s.valor || 0),
        duracao: s.duracao || ''
      }));
      
      setServicos(servicosProcessados);
    } catch (err) {
      console.error('❌ Erro ao carregar serviços:', err);
      setError('Erro ao carregar serviços. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
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

  const handleAgendar = (servico) => {
    // TODO: Pode passar dados do serviço via state ou query params
    console.log('Agendando serviço:', servico.nome);
    navigateTo.agendamento();
  };

  return (
    <LayoutPrincipal paginaAtiva="servicos-cliente">
      <div className="servicos-content">
        {loading ? (
          <div className="servicos-loading">
            <div className="loading-spinner"></div>
            <p>Carregando serviços...</p>
          </div>
        ) : error ? (
          <div className="servicos-error">
            <span className="material-symbols-outlined">error</span>
            <p>{error}</p>
            <button onClick={carregarServicos} className="btn-retry">
              Tentar Novamente
            </button>
          </div>
        ) : servicos.length === 0 ? (
          <div className="servicos-empty">
            <span className="material-symbols-outlined">content_cut</span>
            <p>Nenhum serviço disponível no momento</p>
          </div>
        ) : (
          <div className="servicos-list">
            {servicos.map((servico) => (
              <div className="servico-card" key={servico.id}>
                <div className="servico-icone">
                  {servico.nome.toLowerCase().includes('barba') ? '🧔' : 
                   servico.nome.toLowerCase().includes('sobrancelha') ? '👁️' : 
                   servico.nome.toLowerCase().includes('unha') ? '💅' : 
                   servico.nome.toLowerCase().includes('cabelo') ? '💇' : '✂️'}
                </div>
                <h2 className="servico-nome">{servico.nome}</h2>
                {servico.descricao && (
                  <p className="servico-descricao">{servico.descricao}</p>
                )}
                {servico.duracao && (
                  <p className="servico-duracao">
                    <span className="material-symbols-outlined">schedule</span>
                    Duração: {servico.duracao}
                  </p>
                )}
                <div className="servico-footer">
                  <span className="servico-preco">
                    R$ {servico.preco.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </LayoutPrincipal>
  );
};

export default Servicos;
