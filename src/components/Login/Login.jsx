import React, { useEffect, useState } from 'react';
import './Login.css';
import '../../App.css';
import Axios from 'axios';
import video from '../../assets/video2.mp4'
import logo from '../../assets/images/logo.png'
import config from '../../config';

import { useNavigate } from 'react-router-dom'

const Login = () => {
  // Estado para inputs y mensajes
  const [usuario, setUsuario] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [loginStatus, setLoginStatus] = useState('');
  const [statusHolder, setStatusHolder] = useState('mensaje');
  const navigate = useNavigate();

  const iniciarSesion = async (e) => {
    e.preventDefault();
    setLoginStatus(''); // Resetear mensaje de error

    try {
      const response = await fetch(`${config.apiBaseUrl}auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario: usuario,         // Cambiado a "usuario" para coincidir con el JSON
          contraseña: contraseña,   // Cambiado a "contraseña" para coincidir con el JSON
        }),
      });

      const data = await response.json();

      if (data.message || usuario === '' || contraseña === '') {
        setLoginStatus('Las credenciales no coinciden.');
        setStatusHolder('mostrarMensaje');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (error) {
      setLoginStatus('Error en la conexión con el servidor');
      setStatusHolder('mostrarMensaje');
      console.error(error);
    }
  };

  // Ocultar mensaje de error después de 4 segundos
  useEffect(() => {
    if (loginStatus !== '') {
      const timeout = setTimeout(() => {
        setStatusHolder('mensaje'); // Ocultar mensaje
      }, 4000);
      return () => clearTimeout(timeout);
    }
  }, [loginStatus]);

  return (
    <div className="container-fluid wrapper_login align-content-center">
      <div className="row justify-content-center">
        <div className="col-12 d-none d-md-block col-md-8 col-lg-7 login_bg p-0">
          <video src={video} autoPlay muted loop></video>
        </div>
        <div className="col-12 col-md-4 col-lg-4 bg-white align-content-center login_form p-5">
          <main className="text-center">
            <form onSubmit={iniciarSesion}>
              <a href="/">
                <img className="mb-4" src={logo} alt="brickapp logo" />
              </a>
              <h1 className="h4 mb-4 fw-normal">Iniciar sesión</h1>
              <span className={statusHolder}>{loginStatus}</span>
              <div className="form-floating">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ingrese su usuario"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                />
                <label>Usuario</label>
              </div>
              <div className="form-floating">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Ingresa tu contraseña"
                  value={contraseña}
                  onChange={(e) => setContraseña(e.target.value)}
                />
                <label>Contraseña</label>
              </div>
              <button className="btn btn-primary w-100 py-2 mt-3" type="submit">
                Ingresar
              </button>
              <p className="mt-5 mb-3 text-body-secondary">&copy; Brickapp 2024 - Versión 1.0</p>
            </form>
          </main>
        </div>
      </div>
    </div>
  )
}

export default Login