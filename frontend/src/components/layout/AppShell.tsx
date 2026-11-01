import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header.js';
import { Sidebar } from './Sidebar.js';
import { MobileNav } from './MobileNav.js';
import { useAuth } from '../../context/AuthContext.js';

export const AppShell: React.FC = () => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {user && <Sidebar />}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8 min-w-0">
          <Outlet />
        </main>
      </div>
      {user && <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />}
    </div>
  );
};

