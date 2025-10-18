import React from 'react';
import HeaderNavigation from '../HeaderNavigation/HeaderNavigation';
import { getPageTitle } from '../../hooks/useAppNavigation';
import { useLocation } from 'react-router-dom';
import './PageLayout.css';

const PageLayout = ({ 
  children, 
  userType = 'CLIENT', 
  showHeader = true,
  pageTitle = null,
  showPageTitle = true,
  onLogout = null,
  className = ''
}) => {
  const location = useLocation();
  const title = pageTitle || getPageTitle(location.pathname);

  return (
    <div className={`page-layout ${className}`}>
      {showHeader && (
        <HeaderNavigation 
          userType={userType}
          onLogout={onLogout}
        />
      )}
      
      <main className="page-content">
        {showPageTitle && (
          <div className="page-title-section">
            <h1 className="page-title">{title}</h1>
          </div>
        )}
        
        <div className="page-body">
          {children}
        </div>
      </main>
    </div>
  );
};

export default PageLayout;