import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

function Layout() {
  const location = useLocation();
  const isHeroPage = location.pathname === '/';

  return (
    <div className="min-h-screen flex">
      {!isHeroPage && <Sidebar />}
      <div className="flex-1 relative">
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;
