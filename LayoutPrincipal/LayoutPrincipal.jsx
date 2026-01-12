import React, { useState } from "react";
import { ROUTES } from "../constants/routes";
import { useAppNavigation } from "../hooks/useAppNavigation";
import { apiService } from "../services/api";
import { useChat } from "../contexts/ChatContext";
import ChatNotificationToast from "../components/ChatNotificationToast/ChatNotificationToast";
import ChatNotificationBadge from "../components/ChatNotificationBadge/ChatNotificationBadge";
import "./LayoutPrincipal.css";

export default function LayoutPrincipal({ children, paginaAtiva = "dashboard" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const { navigateTo } = useAppNavigation();
  const { notificacoes, removerNotificacao } = useChat();

  // Verifica se é admin
  const userType = localStorage.getItem('tipoUsuario');
  const userEmail = localStorage.getItem('userEmail') || '';
  const role = localStorage.getItem('role');
  const isAdmin = userType === 'ADMIN' || 
                  userEmail.toUpperCase() === 'ADM@GMAIL.COM' ||
                  role === 'admin';

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    // Atualiza status para OFFLINE antes de fazer logout
    const usuarioId = localStorage.getItem('usuarioId');
    if (usuarioId) {
      try {
        await apiService.usuarios.atualizarStatusOnline(usuarioId, false);
        console.log('🔴 Status atualizado para OFFLINE (logout)');
      } catch (error) {
        console.warn('⚠️ Erro ao atualizar status offline no logout:', error);
      }
    }
    
    // Limpa os dados do localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    localStorage.removeItem("usuarioId");
    
    // Usa replace para não permitir voltar com as setas do navegador
    window.location.replace(ROUTES.LOGIN);
  };

  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 900;
      setIsMobile(mobile);
      if (!mobile) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navegacao = [
    // Opções para ADMIN
    { key: "dashboard", label: "Dashboard", icon: "dashboard", href: ROUTES.DASHBOARD, adminOnly: true },
    { key: "servicos", label: "Gerenciar Serviços", icon: "content_cut", href: ROUTES.GERENCIAMENTO_SERVICOS, adminOnly: true },
    { key: "clientes", label: "Clientes", icon: "group", href: ROUTES.GERENCIAMENTO_CLIENTES, adminOnly: true },
    { key: "agendamentos", label: "Gerenciar Agendamentos", icon: "calendar_month", href: ROUTES.GERENCIAMENTO_AGENDAMENTOS, adminOnly: true },
    { key: "profissionais", label: "Profissionais", icon: "person", href: ROUTES.GERENCIAMENTO_PROFISSIONAIS, adminOnly: true },
    { key: "especialidades", label: "Especialidades", icon: "category", href: ROUTES.GERENCIAMENTO_ESPECIALIDADES, adminOnly: true },
    { key: "horarios", label: "Horários", icon: "schedule", href: ROUTES.GERENCIAMENTO_HORARIOS, adminOnly: true },
    { key: "chat", label: "Chat", icon: "chat", href: ROUTES.CHAT, adminOnly: true },
    
    // Opções para CLIENTE
    { key: "servicos-cliente", label: "Serviços", icon: "content_cut", href: ROUTES.SERVICOS, clientOnly: true },
    { key: "agendamento-cliente", label: "Agendamentos", icon: "calendar_month", href: ROUTES.AGENDAMENTO, clientOnly: true },
    { key: "meus-agendamentos", label: "Meus Agendamentos", icon: "event_note", href: ROUTES.MEUS_AGENDAMENTOS, clientOnly: true },
    { key: "chat-cliente", label: "Chat", icon: "chat", href: ROUTES.CHAT_CLIENTE, clientOnly: true },
  ];

  // Filtra navegação baseado no tipo de usuário
  const navegacaoFiltrada = navegacao.filter(item => {
    if (isAdmin) {
      return item.adminOnly; // Admin vê apenas items adminOnly
    } else {
      return item.clientOnly; // Cliente vê apenas items clientOnly
    }
  });

  return (
    <div className="layout-root">
      {/* Botão hamburguer (mobile) */}
      {isMobile && (
        <button
          className={`layout-menu-btn ${menuOpen ? "hidden-btn" : ""}`}
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      )}

      {/* Overlay para menu */}
      {isMobile && menuOpen && (
        <div className="layout-sidebar-overlay" onClick={closeMenu}></div>
      )}

      {/* Sidebar */}
      <aside
        className={`layout-sidebar${isMobile && menuOpen ? " open" : ""}`}
        aria-hidden={isMobile && !menuOpen}
      >
        <div className="layout-sidebar-content">
          {isMobile && (
            <button
              className="layout-menu-close-btn"
              onClick={closeMenu}
              aria-label="Fechar menu"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
          
          <h1 className="layout-logo">BarberApp</h1>
          
          <nav className="layout-nav">
            {navegacaoFiltrada.map((item) => (
              <a
                key={item.key}
                className={`layout-nav-link ${paginaAtiva === item.key ? "active" : ""}`}
                href={item.href}
                onClick={closeMenu}
                style={{ position: 'relative' }}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.label}
                {(item.key === 'chat' || item.key === 'chat-cliente') && <ChatNotificationBadge />}
              </a>
            ))}
            
            {/* Botão de Logout */}
            <button
              className="layout-nav-link logout-btn"
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                fontSize: 'inherit',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
                marginTop: 'auto',
                padding: '12px 16px'
              }}
            >
              <span className="material-symbols-outlined">logout</span>
              Sair
            </button>
          </nav>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="layout-main">
        {children}
      </main>

      {/* Notificações de Chat */}
      {notificacoes.map(notificacao => (
        <ChatNotificationToast
          key={notificacao.id}
          notification={notificacao}
          onClose={() => removerNotificacao(notificacao.id)}
        />
      ))}
    </div>
  );
}