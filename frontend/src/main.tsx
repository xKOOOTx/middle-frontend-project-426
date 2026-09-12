import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router'
import './index.css'

import * as Sentry from "@sentry/react";
import { AuthProvider } from './context/AuthContext.tsx'
import { ProtectedRoute } from './components/ProtectedRoute.tsx'
import { NavBar } from './components/NavBar.tsx'
import { AuthForm } from './pages/AuthForm.tsx'
import { CatalogPage } from './pages/CatalogPage.tsx'

Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    dataCollection: {
        // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
        // https://docs.sentry.io/platforms/javascript/guides/react/configuration/options/#dataCollection
        // userInfo: false,
        // httpBodies: []
    }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
        <AuthProvider>
            <NavBar />
            <Routes>
                <Route path="/" element={<CatalogPage />} />
                <Route path="/account" element={<ProtectedRoute><div>Личный кабинет (скоро)</div></ProtectedRoute>} />
                <Route path="/signup" element={<AuthForm mode={'register'} />} />
                <Route path="/signin" element={<AuthForm mode={'login'} />} />
            </Routes>
        </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
