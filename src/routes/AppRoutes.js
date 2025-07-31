import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import PrivateRoute from '../components/PrivateRoute';
import AdminRoute from '../components/AdminRoute';

// Import pages
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ProductsPage from '../pages/ProductsPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import CartPage from '../pages/CartPage';
import ProfilePage from '../pages/ProfilePage';
import AdminPage from '../pages/AdminPage';
import OrderHistoryPage from '../pages/OrderHistoryPage';
import OrderDetailPage from '../pages/OrderDetailPage';
import CheckoutPage from '../pages/CheckoutPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/test" element={<div>Test Page</div>} />
        <Route path="/checkout" element={<CheckoutPage />} />
        
        {/* Protected routes */}
        <Route 
          path="/profile" 
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/orders" 
          element={
            <PrivateRoute>
              <OrderHistoryPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/orders/:orderCode" 
          element={
            <PrivateRoute>
              <OrderDetailPage />
            </PrivateRoute>
          } 
        />

        {/* Admin routes */}
        <Route 
          path="/admin/*" 
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          } 
        />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
