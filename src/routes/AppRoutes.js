import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import PrivateRoute from '../components/PrivateRoute';

// Import pages
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ProductsPage from '../pages/ProductsPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import CartPage from '../pages/CartPage';
import ProfilePage from '../pages/ProfilePage';
import AdminPage from '../pages/AdminPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/products" element={<MainLayout><ProductsPage /></MainLayout>} />
      <Route path="/category/:slug" element={<MainLayout><ProductsPage /></MainLayout>} />
      <Route path="/product/:slug" element={<MainLayout><ProductDetailPage /></MainLayout>} />
      <Route path="/cart" element={<MainLayout><CartPage /></MainLayout>} />
      
      {/* Protected routes */}
      <Route 
        path="/profile" 
        element={
          <PrivateRoute>
            <MainLayout><ProfilePage /></MainLayout>
          </PrivateRoute>
        } 
      />
      
      {/* Admin routes */}
      <Route 
        path="/admin/*" 
        element={
          <PrivateRoute requiredRole="admin">
            <MainLayout><AdminPage /></MainLayout>
          </PrivateRoute>
        } 
      />
      
      {/* Fallback route */}
      <Route path="*" element={<MainLayout><div>404 - Trang không tồn tại</div></MainLayout>} />
    </Routes>
  );
};

export default AppRoutes;
