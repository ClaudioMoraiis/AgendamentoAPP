import React, { useState, useEffect } from 'react';
import LayoutPrincipal from '../LayoutPrincipal/LayoutPrincipal';
import { useAppNavigation } from '../hooks/useAppNavigation';
import { apiService } from '../services/api';
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
    agendamentosAbertos: 0,
    crescimentoAgendamentos: 0,
    crescimentoClientes: 0,
    crescimentoReceita: 0
  });

  const [agendamentosRecentes, setAgendamentosRecentes] = useState([]);
  const [servicosPopulares, setServicosPopulares] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados reais das APIs
  useEffect(() => {
    const carregarDados = async () => {
      setLoading(true);
      
      try {
        // Carregar dados em paralelo
        const [agendamentos, usuarios, servicos] = await Promise.all([
          apiService.agendamentos.listar().catch(err => { console.error('Erro ao carregar agendamentos:', err); return []; }),
          apiService.usuarios.listar().catch(err => { console.error('Erro ao carregar usuários:', err); return []; }),
          apiService.servicos.listar().catch(err => { console.error('Erro ao carregar serviços:', err); return []; })
        ]);

        console.log('📊 Dados carregados:', { agendamentos, usuarios, servicos });

        // Processar agendamentos
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        const agendamentosHoje = agendamentos.filter(a => {
          if (!a.data) return false;
          const dataAgendamento = new Date(a.data);
          dataAgendamento.setHours(0, 0, 0, 0);
          return dataAgendamento.getTime() === hoje.getTime();
        });

        const agendamentosPendentes = agendamentos.filter(a => 
          a.status && a.status.toLowerCase() === 'pendente'
        );

        // Calcular métricas do mês atual e anterior
        const mesAtual = hoje.getMonth();
        const anoAtual = hoje.getFullYear();
        
        // Mês anterior
        const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1;
        const anoAnterior = mesAtual === 0 ? anoAtual - 1 : anoAtual;

        // Agendamentos do mês atual e anterior
        const agendamentosMesAtual = agendamentos.filter(a => {
          if (!a.data) return false;
          const dataAgendamento = new Date(a.data);
          return dataAgendamento.getMonth() === mesAtual && 
                 dataAgendamento.getFullYear() === anoAtual;
        });

        const agendamentosMesAnterior = agendamentos.filter(a => {
          if (!a.data) return false;
          const dataAgendamento = new Date(a.data);
          return dataAgendamento.getMonth() === mesAnterior && 
                 dataAgendamento.getFullYear() === anoAnterior;
        });

        // Receita do mês atual (agendamentos concluídos)
        const receitaMes = agendamentosMesAtual
          .filter(a => a.status && a.status.toLowerCase() === 'concluido')
          .reduce((total, a) => {
            const valor = typeof a.valor === 'string' 
              ? parseFloat(a.valor.replace('R$', '').replace(',', '.').trim())
              : a.valor;
            return total + (isNaN(valor) ? 0 : valor);
          }, 0);

        // Receita do mês anterior (agendamentos concluídos)
        const receitaMesAnterior = agendamentosMesAnterior
          .filter(a => a.status && a.status.toLowerCase() === 'concluido')
          .reduce((total, a) => {
            const valor = typeof a.valor === 'string' 
              ? parseFloat(a.valor.replace('R$', '').replace(',', '.').trim())
              : a.valor;
            return total + (isNaN(valor) ? 0 : valor);
          }, 0);

        // Clientes cadastrados no mês atual e anterior
        const clientesMesAtual = usuarios.filter(u => {
          if (!u.dataCadastro && !u.createdAt) return false;
          const dataCadastro = new Date(u.dataCadastro || u.createdAt);
          return dataCadastro.getMonth() === mesAtual && 
                 dataCadastro.getFullYear() === anoAtual;
        }).length;

        const clientesMesAnterior = usuarios.filter(u => {
          if (!u.dataCadastro && !u.createdAt) return false;
          const dataCadastro = new Date(u.dataCadastro || u.createdAt);
          return dataCadastro.getMonth() === mesAnterior && 
                 dataCadastro.getFullYear() === anoAnterior;
        }).length;

        // Calcular crescimento percentual
        const calcularCrescimento = (atual, anterior) => {
          if (anterior === 0) return atual > 0 ? 100 : 0;
          return Math.round(((atual - anterior) / anterior) * 100);
        };

        const crescimentoAgendamentos = calcularCrescimento(
          agendamentosMesAtual.length,
          agendamentosMesAnterior.length
        );

        const crescimentoClientes = calcularCrescimento(
          clientesMesAtual,
          clientesMesAnterior
        );

        const crescimentoReceita = calcularCrescimento(
          receitaMes,
          receitaMesAnterior
        );

        // Atualizar estatísticas
        setStats({
          totalAgendamentos: agendamentos.length,
          agendamentosHoje: agendamentosHoje.length,
          totalClientes: usuarios.length,
          totalServicos: servicos.length,
          receitaMes: receitaMes,
          agendamentosAbertos: agendamentosPendentes.length,
          crescimentoAgendamentos,
          crescimentoClientes,
          crescimentoReceita
        });

        // Processar agendamentos recentes (últimos 5, ordenados por data)
        const agendamentosOrdenados = [...agendamentos]
          .sort((a, b) => {
            const dataA = new Date(a.data + ' ' + a.horarioInicio);
            const dataB = new Date(b.data + ' ' + b.horarioInicio);
            return dataB - dataA;
          })
          .slice(0, 5)
          .map(a => ({
            id: a.id,
            cliente: a.usuarioNome || a.cliente || 'Cliente',
            servico: a.servico || 'Serviço',
            data: a.data || '',
            hora: a.horarioInicio || '',
            status: a.status || 'Pendente'
          }));

        setAgendamentosRecentes(agendamentosOrdenados);

        // Processar serviços mais populares
        const servicosContagem = {};
        agendamentos.forEach(a => {
          const nomeServico = a.servico || 'Outros';
          servicosContagem[nomeServico] = (servicosContagem[nomeServico] || 0) + 1;
        });

        const totalAgendamentos = agendamentos.length || 1;
        const servicosPopularesArray = Object.entries(servicosContagem)
          .map(([nome, quantidade]) => ({
            nome,
            quantidade,
            percentual: Math.round((quantidade / totalAgendamentos) * 100)
          }))
          .sort((a, b) => b.quantidade - a.quantidade)
          .slice(0, 5);

        setServicosPopulares(servicosPopularesArray);

      } catch (error) {
        console.error('❌ Erro ao carregar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
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
            {stats.crescimentoAgendamentos !== 0 && (
              <div className={`stat-trend ${stats.crescimentoAgendamentos > 0 ? 'positive' : 'negative'}`}>
                <span className="material-symbols-outlined">
                  {stats.crescimentoAgendamentos > 0 ? 'trending_up' : 'trending_down'}
                </span>
                {stats.crescimentoAgendamentos > 0 ? '+' : ''}{stats.crescimentoAgendamentos}%
              </div>
            )}
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
            {stats.crescimentoClientes !== 0 && (
              <div className={`stat-trend ${stats.crescimentoClientes > 0 ? 'positive' : 'negative'}`}>
                <span className="material-symbols-outlined">
                  {stats.crescimentoClientes > 0 ? 'trending_up' : 'trending_down'}
                </span>
                {stats.crescimentoClientes > 0 ? '+' : ''}{stats.crescimentoClientes}%
              </div>
            )}
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
            {stats.crescimentoReceita !== 0 && (
              <div className={`stat-trend ${stats.crescimentoReceita > 0 ? 'positive' : 'negative'}`}>
                <span className="material-symbols-outlined">
                  {stats.crescimentoReceita > 0 ? 'trending_up' : 'trending_down'}
                </span>
                {stats.crescimentoReceita > 0 ? '+' : ''}{stats.crescimentoReceita}%
              </div>
            )}
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
                      {agendamento.data ? (
                        agendamento.data.includes('-') 
                          ? agendamento.data.split('-').reverse().join('/')
                          : agendamento.data
                      ) : 'Data não disponível'} às {agendamento.hora || 'N/A'}
                    </div>
                    <span className={`status-badge ${(agendamento.status || 'pendente').toLowerCase()}`}>
                      {agendamento.status || 'Pendente'}
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