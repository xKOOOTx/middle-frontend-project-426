import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router'
import './index.css'
import { Flex, Layout } from 'antd'

import * as Sentry from "@sentry/react";
import { AuthProvider } from './context/AuthContext.tsx'
import { CartProvider } from './context/CartContext.tsx'
import { ProtectedRoute } from './components/ProtectedRoute.tsx'
import { NavBar } from './components/NavBar.tsx'
import { AuthForm } from './pages/AuthForm.tsx'
import { CatalogPage } from './pages/CatalogPage.tsx'
import { PromoPage } from './pages/PromoPage.tsx'
import { ProductPage } from './pages/ProductPage'
import { CartPage } from './pages/CartPage'

const { Header, Content, Footer } = Layout;

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
        <CartProvider>
            <AuthProvider>
                <Layout style={{ minHeight: '100vh', background: '#fff' }}>
                    <Header style={{ background: '#fff', height: 'auto', padding: 0, lineHeight: 'normal' }}>
                        <NavBar />
                    </Header>
                    <Content style={{ background: '#fff', margin: '16px 0' }}>
                        <Routes>
                            <Route path={'/'} element={<PromoPage />} />
                            <Route path="/products/:slug" element={<ProductPage />} />
                            <Route path="/catalog" element={<CatalogPage />} />
                            <Route path="/account" element={<ProtectedRoute><div>Личный кабинет (скоро)</div></ProtectedRoute>} />
                            <Route path="/signup" element={<AuthForm mode={'register'} />} />
                            <Route path="/signin" element={<AuthForm mode={'login'} />} />
                            <Route path="/cart" element={<CartPage />} />
                        </Routes>
                    </Content>
                    <Footer style={{ background: '#fff' }}>
                        <Flex justify={'space-between'}>
                            <p>Магазин комплектующих для ПК — учебный проект Хекслета</p>
                            <Link to={'/catalog'} style={{color: '#9AA0A6'}}>Каталог</Link>
                        </Flex>
                    </Footer>
                </Layout>
            </AuthProvider>
        </CartProvider>
    </BrowserRouter>
  </StrictMode>,
)
