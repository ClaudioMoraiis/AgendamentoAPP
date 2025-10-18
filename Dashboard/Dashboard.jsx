import React, { useState, useEffect } from 'react';
import LayoutPrincipal from '../LayoutPrincipal/LayoutPrincipal';
import { useAppNavigation } from '../hooks/useAppNavigation';
import './Dashboard.css';

const Dashboard = () => {
  const { navigateTo } = useAppNavigation();
  
  // Estados para os dados do dashboard
  const [stats, setStats] = useState({
    totalAgendamentos: 0,
    agendamentosHoje: 0,
    totalClientes: 0,
    totalServicos: 0,
    receitaMes: 0,
    agendamentosAbertos: 0
  });

  const [agendamentosRecentes, setAgendamentosRecentes] = useState([]);
  const [servicosPopulares, setServicosPopulares] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simular carregamento de dados (substituir por API real)
  useEffect(() => {
    const carregarDados = async () => {
      setLoading(true);
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dados fictícios (substituir por chamadas reais à API)
      setStats({
        totalAgendamentos: 147,
        agendamentosHoje: 8,
        totalClientes: 89,
        totalServicos: 12,
        receitaMes: 4850.00,
        agendamentosAbertos: 23
      });

      setAgendamentosRecentes([
        {
          id: 1,
          cliente: 'João Silva',
          servico: 'Corte de Cabelo',
          data: '2025-10-13',
          hora: '14:30',
          status: 'Confirmado'
        },
        {
          id: 2,
          cliente: 'Maria Santos',
          servico: 'Barba + Corte',
          data: '2025-10-13',
          hora: '15:00',
          status: 'Pendente'
        },
        {
          id: 3,
          cliente: 'Pedro Costa',
          servico: 'Sobrancelha',
          data: '2025-10-13',
          hora: '16:00',
          status: 'Confirmado'
        },
        {
          id: 4,
          cliente: 'Ana Oliveira',
          servico: 'Corte de Cabelo',
          data: '2025-10-14',
          hora: '09:00',
          status: 'Confirmado'
        }
      ]);

      setServicosPopulares([
        { nome: 'Corte de Cabelo', quantidade: 45, percentual: 38 },
        { nome: 'Barba', quantidade: 28, percentual: 24 },
        { nome: 'Corte + Barba', quantidade: 22, percentual: 19 },
        { nome: 'Sobrancelha', quantidade: 15, percentual: 13 },
        { nome: 'Outros', quantidade: 7, percentual: 6 }
      ]);

      setLoading(false);
    };

    carregarDados();
  }, []);

  const handleNavegacao = (destino) => {
    switch (destino) {
      case 'agendamentos':
        navigateTo.adminAgendamentos();
        break;
      case 'clientes':
        navigateTo.adminClientes();
        break;
      case 'servicos':
        navigateTo.adminServicos();
        break;
      case 'profissionais':
        navigateTo.adminProfissionais();
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <LayoutPrincipal paginaAtiva="dashboard">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Carregando dados do dashboard...</p>
        </div>
      </LayoutPrincipal>
    );
  }

  return (
    <LayoutPrincipal paginaAtiva="dashboard">
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Dashboard Administrativo</h1>
          <p>Visão geral do sistema de agendamentos</p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="stats-grid">
          <div className="stat-card primary" onClick={() => handleNavegacao('agendamentos')}>
            <div className="stat-icon">
              <span className="material-symbols-outlined">calendar_month</span>
            </div>
            <div className="stat-content">
              <h3>{stats.totalAgendamentos}</h3>
              <p>Total de Agendamentos</p>
            </div>
            <div className="stat-trend positive">
              <span className="material-symbols-outlined">trending_up</span>
              +12%
            </div>
          </div>

          <div className="stat-card success">
            <div className="stat-icon">
              <span className="material-symbols-outlined">today</span>
            </div>
            <div className="stat-content">
              <h3>{stats.agendamentosHoje}</h3>
              <p>Agendamentos Hoje</p>
            </div>
            <div className="stat-badge urgent">{stats.agendamentosAbertos} pendentes</div>
          </div>

          <div className="stat-card info" onClick={() => handleNavegacao('clientes')}>
            <div className="stat-icon">
              <span className="material-symbols-outlined">group</span>
            </div>
            <div className="stat-content">
              <h3>{stats.totalClientes}</h3>
              <p>Total de Clientes</p>
            </div>
            <div className="stat-trend positive">
              <span className="material-symbols-outlined">trending_up</span>
              +5%
            </div>
          </div>

          <div className="stat-card warning" onClick={() => handleNavegacao('servicos')}>
            <div className="stat-icon">
              <span className="material-symbols-outlined">content_cut</span>
            </div>
            <div className="stat-content">
              <h3>{stats.totalServicos}</h3>
              <p>Serviços Ativos</p>
            </div>
          </div>

          <div className="stat-card revenue">
            <div className="stat-icon">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <div className="stat-content">
              <h3>R$ {stats.receitaMes.toFixed(2).replace('.', ',')}</h3>
              <p>Receita do Mês</p>
            </div>
            <div className="stat-trend positive">
              <span className="material-symbols-outlined">trending_up</span>
              +18%
            </div>
          </div>
        </div>

        {/* Seção Principal com Gráficos e Listas */}
        <div className="dashboard-content">
          {/* Agendamentos Recentes */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Agendamentos Recentes</h2>
              <button 
                className="btn-see-all"
                onClick={() => handleNavegacao('agendamentos')}
              >
                Ver Todos
              </button>
            </div>
            <div className="agendamentos-list">
              {agendamentosRecentes.map(agendamento => (
                <div key={agendamento.id} className="agendamento-item">
                  <div className="agendamento-info">
                    <div className="cliente-name">{agendamento.cliente}</div>
                    <div className="servico-name">{agendamento.servico}</div>
                  </div>
                  <div className="agendamento-details">
                    <div className="data-hora">
                      {agendamento.data.split('-').reverse().join('/')} às {agendamento.hora}
                    </div>
                    <span className={`status-badge ${agendamento.status.toLowerCase()}`}>
                      {agendamento.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Serviços Mais Populares */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Serviços Mais Populares</h2>
              <button 
                className="btn-see-all"
                onClick={() => handleNavegacao('servicos')}
              >
                Gerenciar
              </button>
            </div>
            <div className="servicos-chart">
              {servicosPopulares.map((servico, index) => (
                <div key={index} className="servico-bar">
                  <div className="servico-info">
                    <span className="servico-nome">{servico.nome}</span>
                    <span className="servico-quantidade">{servico.quantidade}</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${servico.percentual}%` }}
                    ></div>
                  </div>
                  <span className="servico-percentual">{servico.percentual}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="quick-actions">
          <h2>Ações Rápidas</h2>
          <div className="actions-grid">
            <button 
              className="action-btn primary"
              onClick={() => handleNavegacao('agendamentos')}
            >
              <span className="material-symbols-outlined">add_circle</span>
              Novo Agendamento
            </button>
            <button 
              className="action-btn success"
              onClick={() => handleNavegacao('clientes')}
            >
              <span className="material-symbols-outlined">person_add</span>
              Cadastrar Cliente
            </button>
            <button 
              className="action-btn info"
              onClick={() => handleNavegacao('servicos')}
            >
              <span className="material-symbols-outlined">add_business</span>
              Novo Serviço
            </button>
            <button 
              className="action-btn warning"
              onClick={() => handleNavegacao('profissionais')}
            >
              <span className="material-symbols-outlined">badge</span>
              Adicionar Profissional
            </button>
          </div>
        </div>
      </div>
    </LayoutPrincipal>
  );
};

export default Dashboard;