import { Navigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

/**
 * Componente para redirecionamento de rotas antigas
 * Redireciona automaticamente para as novas rotas padronizadas
 */

// Redirecionamentos para rotas administrativas
export const RedirectToAdminServicos = () => (
  <Navigate to={ROUTES.GERENCIAMENTO_SERVICOS} replace />
);

export const RedirectToAdminClientes = () => (
  <Navigate to={ROUTES.GERENCIAMENTO_CLIENTES} replace />
);

export const RedirectToAdminAgendamentos = () => (
  <Navigate to={ROUTES.GERENCIAMENTO_AGENDAMENTOS} replace />
);

export const RedirectToAdminProfissionais = () => (
  <Navigate to={ROUTES.GERENCIAMENTO_PROFISSIONAIS} replace />
);

// Redirecionamento para rota de agendamento do cliente
export const RedirectToAgendamento = () => (
  <Navigate to={ROUTES.AGENDAMENTO} replace />
);

/**
 * Mapeamento de rotas antigas para novas
 */
export const LEGACY_ROUTE_REDIRECTS = {
  '/gerenciamento-servicos': ROUTES.GERENCIAMENTO_SERVICOS,
  '/gerenciamento-clientes': ROUTES.GERENCIAMENTO_CLIENTES,
  '/gerenciamento-agendamentos': ROUTES.GERENCIAMENTO_AGENDAMENTOS,
  '/gerenciamento-profissionais': ROUTES.GERENCIAMENTO_PROFISSIONAIS,
  '/agendamentoCliente': ROUTES.AGENDAMENTO,
};