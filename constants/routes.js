// Constantes de rotas centralizadas
export const ROUTES = {
  // Rotas públicas
  HOME: '/',
  LOGIN: '/',
  CADASTRO: '/cadastro',
  RECUPERAR_SENHA: '/recuperar-senha',
  ALTERAR_SENHA: '/alterar-senha',
  
  // Rotas do cliente
  SERVICOS: '/servicos',
  AGENDAMENTO: '/agendamento',
  MEUS_AGENDAMENTOS: '/meus-agendamentos',
  
  // Rotas administrativas
  DASHBOARD: '/admin/dashboard',
  GERENCIAMENTO_SERVICOS: '/admin/servicos',
  GERENCIAMENTO_CLIENTES: '/admin/clientes',
  GERENCIAMENTO_AGENDAMENTOS: '/admin/agendamentos',
  GERENCIAMENTO_PROFISSIONAIS: '/admin/profissionais',
};

// Configuração da navegação para diferentes tipos de usuários
export const NAVIGATION_ITEMS = {
  CLIENT: [
    {
      label: 'Serviços',
      path: ROUTES.SERVICOS,
      icon: '🔧'
    },
    {
      label: 'Agendamentos',
      path: ROUTES.AGENDAMENTO,
      icon: '📅'
    },
    {
      label: 'Meus Agendamentos',
      path: ROUTES.MEUS_AGENDAMENTOS,
      icon: '📋'
    }
  ],
  ADMIN: [
    {
      label: 'Dashboard',
      path: ROUTES.DASHBOARD,
      icon: 'dashboard'
    },
    {
      label: 'Serviços',
      path: ROUTES.GERENCIAMENTO_SERVICOS,
      icon: 'content_cut'
    },
    {
      label: 'Clientes',
      path: ROUTES.GERENCIAMENTO_CLIENTES,
      icon: 'group'
    },
    {
      label: 'Agendamentos',
      path: ROUTES.GERENCIAMENTO_AGENDAMENTOS,
      icon: 'calendar_month'
    },
    {
      label: 'Profissionais',
      path: ROUTES.GERENCIAMENTO_PROFISSIONAIS,
      icon: 'person'
    }
  ]
};