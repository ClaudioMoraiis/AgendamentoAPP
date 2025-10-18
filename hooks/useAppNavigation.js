import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

/**
 * Hook customizado para navegação com rotas tipadas
 */
export const useAppNavigation = () => {
  const navigate = useNavigate();

  const navigateTo = {
    // Rotas públicas
    login: () => navigate(ROUTES.LOGIN),
    cadastro: () => navigate(ROUTES.CADASTRO),
    recuperarSenha: () => navigate(ROUTES.RECUPERAR_SENHA),
    alterarSenha: () => navigate(ROUTES.ALTERAR_SENHA),
    
    // Rotas do cliente
    servicos: () => navigate(ROUTES.SERVICOS),
    agendamento: () => navigate(ROUTES.AGENDAMENTO),
    meusAgendamentos: () => navigate(ROUTES.MEUS_AGENDAMENTOS),
    
    // Rotas administrativas
    dashboard: () => navigate(ROUTES.DASHBOARD),
    adminServicos: () => navigate(ROUTES.GERENCIAMENTO_SERVICOS),
    adminClientes: () => navigate(ROUTES.GERENCIAMENTO_CLIENTES),
    adminAgendamentos: () => navigate(ROUTES.GERENCIAMENTO_AGENDAMENTOS),
    adminProfissionais: () => navigate(ROUTES.GERENCIAMENTO_PROFISSIONAIS),
    
    // Navegação genérica
    back: () => navigate(-1),
    forward: () => navigate(1),
    replace: (path) => navigate(path, { replace: true }),
  };

  return { navigateTo };
};

/**
 * Função utilitária para verificar se uma rota está ativa
 */
export const isActiveRoute = (currentPath, targetPath) => {
  return currentPath === targetPath;
};

/**
 * Função utilitária para obter o nome da página baseado na rota
 */
export const getPageTitle = (pathname) => {
  const routeTitles = {
    [ROUTES.LOGIN]: 'Login',
    [ROUTES.CADASTRO]: 'Cadastro',
    [ROUTES.RECUPERAR_SENHA]: 'Recuperar Senha',
    [ROUTES.ALTERAR_SENHA]: 'Alterar Senha',
    [ROUTES.SERVICOS]: 'Serviços',
    [ROUTES.AGENDAMENTO]: 'Novo Agendamento',
    [ROUTES.MEUS_AGENDAMENTOS]: 'Meus Agendamentos',
    [ROUTES.DASHBOARD]: 'Dashboard',
    [ROUTES.GERENCIAMENTO_SERVICOS]: 'Gerenciar Serviços',
    [ROUTES.GERENCIAMENTO_CLIENTES]: 'Gerenciar Clientes',
    [ROUTES.GERENCIAMENTO_AGENDAMENTOS]: 'Gerenciar Agendamentos',
    [ROUTES.GERENCIAMENTO_PROFISSIONAIS]: 'Gerenciar Profissionais',
  };

  return routeTitles[pathname] || 'Agendamento';
};