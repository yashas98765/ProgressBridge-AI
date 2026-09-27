import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { MainLayout } from './layouts/MainLayout';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { DataIngestionPage } from './pages/DataIngestionPage';
import { SchedulePage } from './pages/SchedulePage';
import { ProgressEventsPage } from './pages/ProgressEventsPage';
import { MatchReviewPage } from './pages/MatchReviewPage';
import { TimeAgentPage } from './pages/TimeAgentPage';
import { ScheduleUpdatesPage } from './pages/ScheduleUpdatesPage';
import { DelayAnalyticsPage } from './pages/DelayAnalyticsPage';
import { ProjectMemoryPage } from './pages/ProjectMemoryPage';
import { AuditTrailPage } from './pages/AuditTrailPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="ingestion" element={<DataIngestionPage />} />
            <Route path="schedule" element={<SchedulePage />} />
            <Route path="events" element={<ProgressEventsPage />} />
            <Route path="match-review" element={<MatchReviewPage />} />
            <Route path="time-agent" element={<TimeAgentPage />} />
            <Route path="schedule-updates" element={<ScheduleUpdatesPage />} />
            <Route path="analytics" element={<DelayAnalyticsPage />} />
            <Route path="project-memory" element={<ProjectMemoryPage />} />
            <Route path="audit" element={<AuditTrailPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
