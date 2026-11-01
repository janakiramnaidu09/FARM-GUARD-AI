import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext.js';
import { LanguageProvider } from '../context/LanguageContext.js';
import { FarmProvider } from '../context/FarmContext.js';
import { AppRoutes } from './routes.js';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <FarmProvider>
            <AppRoutes />
          </FarmProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
};

