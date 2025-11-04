import React, { useState } from "react";
import { ROUTES } from "../constants/routes";
import { useAppNavigation } from "../hooks/useAppNavigation";
import "./LayoutPrincipal.css";

export default function LayoutPrincipal({ children, paginaAtiva = "dashboard" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const { navigateTo } = useAppNavigation();

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    // Limpa os dados do localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    
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
    { key: "dashboard", label: "Dashboard", icon: "dashboard", href: ROUTES.DASHBOARD },
    { key: "servicos", label: "Serviços", icon: "content_cut", href: ROUTES.GERENCIAMENTO_SERVICOS },
    { key: "clientes", label: "Clientes", icon: "group", href: ROUTES.GERENCIAMENTO_CLIENTES },
    { key: "agendamentos", label: "Agendamentos", icon: "calendar_month", href: ROUTES.GERENCIAMENTO_AGENDAMENTOS },
    { key: "profissionais", label: "Profissionais", icon: "person", href: ROUTES.GERENCIAMENTO_PROFISSIONAIS },
  ];

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
            {navegacao.map((item) => (
              <a
                key={item.key}
                className={`layout-nav-link ${paginaAtiva === item.key ? "active" : ""}`}
                href={item.href}
                onClick={closeMenu}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.label}
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
    </div>
  );
}