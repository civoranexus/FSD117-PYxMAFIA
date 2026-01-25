import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from '../pages/HomePage.jsx'
import LoginPage from '../pages/LoginPage.jsx'
import RegisterPage from '../pages/RegisterPage.jsx'
import AboutPage from '../pages/AboutPage.jsx'
import VendorPage from '../pages/VendorPage.jsx'
import ProductPage from '../pages/ProductPage.jsx'
import VendorProductFormPage from '../pages/VendorProductFormPage.jsx'
import AdminDashboardPage from '../pages/AdminDashboardPage.jsx'
import VendorProductDetailsPage from '../pages/VendorProductDetailsPage.jsx'

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product" element={<ProductPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/:role" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/vendor-dashboard" element={<VendorPage />} />
        <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
        <Route path="/vendor/products/new" element={<VendorProductFormPage />} />
        <Route path="/vendor/products/edit" element={<VendorProductFormPage />} />
        <Route path="/vendor/products/:id" element={<VendorProductDetailsPage />} />
      </Routes>
    </Router>
  )
}

export default AppRouter
