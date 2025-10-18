import React, { useState } from 'react';
import PageLayout from '../components/PageLayout/PageLayout';
import { useAppNavigation } from '../hooks/useAppNavigation';
import { ROUTES } from '../constants/routes';
import './ExemploPagina.css';

/**
 * Exemplo de página usando o sistema de navegação padronizado
 * 
 * Esta página demonstra:
 * - Uso do PageLayout para estrutura consistente
 * - Hook useAppNavigation para navegação programática
 * - Constantes ROUTES para links tipados
 * - Integração com sistema de logout
 */
const ExemploPagina = () => {
  const { navigateTo } = useAppNavigation();
  const [dados, setDados] = useState([
    { id: 1, titulo: 'Exemplo 1', descricao: 'Demonstração do sistema padronizado' },
    { id: 2, titulo: 'Exemplo 2', descricao: 'Navegação programática' },
    { id: 3, titulo: 'Exemplo 3', descricao: 'Layout responsivo' }
  ]);

  const handleLogout = () => {
    // Limpeza de dados do usuário
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    
    // Redirecionamento usando navegação tipada
    navigateTo.login();
  };

  const handleNavigation = (route) => {
    // Exemplos de navegação programática
    switch (route) {
      case 'servicos':
        navigateTo.servicos();
        break;
      case 'agendamento':
        navigateTo.agendamento();
        break;
      case 'meus-agendamentos':
        navigateTo.meusAgendamentos();
        break;
      default:
        navigateTo.back();
    }
  };

  return (
    <PageLayout 
      userType="CLIENT" 
      onLogout={handleLogout}
      pageTitle="Exemplo - Sistema Padronizado"
    >
      <div className="exemplo-content">
        <div className="exemplo-intro">
          <h2>🎯 Sistema de Navegação Padronizado</h2>
          <p>
            Esta página demonstra como usar o novo sistema de navegação 
            padronizado da aplicação.
          </p>
        </div>

        <div className="exemplo-features">
          <div className="feature-card">
            <h3>🧭 Navegação Consistente</h3>
            <p>Header padronizado com navegação automática baseada no tipo de usuário.</p>
            <div className="feature-buttons">
              <button onClick={() => handleNavigation('servicos')}>
                Ir para Serviços
              </button>
              <button onClick={() => handleNavigation('agendamento')}>
                Novo Agendamento
              </button>
            </div>
          </div>

          <div className="feature-card">
            <h3>🛣️ Rotas Centralizadas</h3>
            <p>Todas as rotas definidas em constantes para evitar erros de digitação.</p>
            <div className="routes-example">
              <code>ROUTES.SERVICOS = "{ROUTES.SERVICOS}"</code><br/>
              <code>ROUTES.AGENDAMENTO = "{ROUTES.AGENDAMENTO}"</code><br/>
              <code>ROUTES.MEUS_AGENDAMENTOS = "{ROUTES.MEUS_AGENDAMENTOS}"</code>
            </div>
          </div>

          <div className="feature-card">
            <h3>⚡ Hook de Navegação</h3>
            <p>Navegação programática com funções tipadas.</p>
            <div className="hook-example">
              <code>const {"{ navigateTo }"} = useAppNavigation();</code><br/>
              <code>navigateTo.servicos(); // Vai para /servicos</code><br/>
              <code>navigateTo.back(); // Volta uma página</code>
            </div>
            <button onClick={() => navigateTo.back()}>
              Voltar (Exemplo)
            </button>
          </div>
        </div>

        <div className="exemplo-data">
          <h3>📋 Lista de Exemplos</h3>
          <div className="dados-grid">
            {dados.map(item => (
              <div key={item.id} className="dado-card">
                <h4>{item.titulo}</h4>
                <p>{item.descricao}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="exemplo-actions">
          <button 
            className="btn-primary"
            onClick={() => navigateTo.meusAgendamentos()}
          >
            Ver Meus Agendamentos
          </button>
          <button 
            className="btn-secondary"
            onClick={() => handleNavigation('back')}
          >
            Voltar
          </button>
        </div>
      </div>
    </PageLayout>
  );
};

export default ExemploPagina;