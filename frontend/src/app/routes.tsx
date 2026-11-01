import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell.js';
import { ProtectedRoute } from '../components/common/ProtectedRoute.js';

import { LandingPage } from '../pages/LandingPage.js';
import { LoginPage } from '../pages/LoginPage.js';
import { SignupPage } from '../pages/SignupPage.js';
import { DashboardPage } from '../pages/DashboardPage.js';
import { FarmsPage } from '../pages/FarmsPage.js';
import { FarmDetailPage } from '../pages/FarmDetailPage.js';
import { DiseaseCheckPage } from '../pages/DiseaseCheckPage.js';
import { SoilPage } from '../pages/SoilPage.js';
import { WeatherPage } from '../pages/WeatherPage.js';
import { RecommendationsPage } from '../pages/RecommendationsPage.js';
import { AssistantPage } from '../pages/AssistantPage.js';
import { HistoryPage } from '../pages/HistoryPage.js';
import { SettingsPage } from '../pages/SettingsPage.js';
import { PrivacyPage } from '../pages/PrivacyPage.js';
import { NotFoundPage } from '../pages/NotFoundPage.js';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<AppShell />}>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />

        {/* Protected Farmer Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/farms"
          element={
            <ProtectedRoute>
              <FarmsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/farms/:farmId"
          element={
            <ProtectedRoute>
              <FarmDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/disease-check"
          element={
            <ProtectedRoute>
              <DiseaseCheckPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/soil"
          element={
            <ProtectedRoute>
              <SoilPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/weather"
          element={
            <ProtectedRoute>
              <WeatherPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recommendations"
          element={
            <ProtectedRoute>
              <RecommendationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assistant"
          element={
            <ProtectedRoute>
              <AssistantPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* 404 Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

