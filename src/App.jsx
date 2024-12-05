// src/App.jsx
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Landing from './components/Landing/Landing';
import Login from './components/Login/Login';
import Registro from './components/Registro/Registro';
import FullLayout from './layouts/FullLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import Inicio from './components/Pages/Inicio';
import Monitor from './components/Pages/Monitor';
import Coccion from './components/Pages/Coccion';
import Personal from './components/Pages/Personal';
import Inventario from './components/Pages/Inventario';
import Reportes from './components/Pages/Reportes';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          {/* Rutas protegidas envueltas en el componente FullLayout */}
          {/* <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<FullLayout />}>
              <Route path="inicio" element={<Inicio />} />
              <Route path="monitor" element={<Monitor />} />
              <Route path="coccion" element={<Coccion />} />
              <Route path="personal" element={<Personal />} />
              <Route path="inventario" element={<Inventario />} />
              <Route path="reportes" element={<Reportes />} />
            </Route>
          </Route> */}
          <Route >
            <Route path="/admin" element={<FullLayout />}>
              <Route path="inicio" element={<Inicio />} />
              <Route path="monitor" element={<Monitor />} />
              <Route path="coccion" element={<Coccion />} />
              <Route path="personal" element={<Personal />} />
              <Route path="inventario" element={<Inventario />} />
              <Route path="reportes" element={<Reportes />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
