import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAVIGATION_ITEMS } from '../../constants/routes';
import './HeaderNavigation.css';

const HeaderNavigation = ({ 
  userType = 'CLIENT', 
  showUserActions = true,
  onLogout = null 
}) => {
  const location = useLocation();
  const navigationItems = NAVIGATION_ITEMS[userType] || NAVIGATION_ITEMS.CLIENT;

  return (
    <header className="header-navigation">
      <div className="header-container">
        {/* Logo e Título */}
        <div className="header-left">
          <svg className="header-logo" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 5C7 3.34315 8.34315 2 10 2H14C15.6569 2 17 3.34315 17 5V7H20V12H4V7H7V5ZM6 14H18V20C18 21.1046 17.1046 22 16 22H8C6.89543 22 6 21.1046 6 20V14Z"></path>
          </svg>
          <h1 className="header-title">Agendamento</h1>
        </div>

        {/* Navegação */}
        <nav className="header-nav">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              className={`header-nav-link ${
                location.pathname === item.path ? 'active' : ''
              }`}
              to={item.path}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Ações do usuário */}
        {showUserActions && (
          <div className="header-right">
            <button className="header-bell-btn" title="Notificações">
              <svg className="header-bell-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2"
                />
              </svg>
            </button>
            
            {onLogout && (
              <button 
                className="header-logout-btn" 
                onClick={onLogout}
                title="Sair"
              >
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default HeaderNavigation;