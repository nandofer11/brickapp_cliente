import React, {useEffect, useState} from 'react';
import './Login.css';
import '../../App.css';
import Axios from 'axios';
import video from '../../assets/video2.mp4'
import logo from '../../assets/images/logo.png'

import {useNavigate} from 'react-router-dom'

const Login = () => {
  // Hook useState para almacenar inputs
  const [usuario, setUsuario] = useState('');
  const [contraseña, setContraseña] = useState('');
  
  // Mostrar mensaje al usuario
  const [loginStatus, setLoginStatus] =  useState('');
  const [statusHolder, setStatusHolder] = useState('mensaje')

  const navigateTo = useNavigate();

  const iniciarSesion = (e)=>{
    e.preventDefault();

     // Restablecer el mensaje antes de intentar iniciar sesión
  setLoginStatus('');

    Axios.post('http://localhost:3002/api/login',{
      //Valores a enviar a la ruta en el servidor
      LoginUsuario: usuario,
      LoginContraseña: contraseña
    }).then((response)=>{
      console.log(response);
      // Capturar la respuesta 
      // Capturar un error si las credenciales son incorrectas
      if(response.data.message || usuario == '' || contraseña == ''){
        navigateTo('/');
        setLoginStatus('Los credenciales no coinciden.')
      }else{
        navigateTo('/admin/dashboard');
      }
    })
  }

  useEffect(()=>{
    if(loginStatus !== ''){
      setStatusHolder('mostrarMensaje'); //mostrar mensaje
      setTimeout(()=>{
        setStatusHolder('mensaje') // ocultar despues de 4s
      }, 4000)
    }
  }, [loginStatus])

  // Limpiar el formulario al enviar
  const onSubmit = ()=>{
    setUsuario('')
    setContraseña('')
  }

  return (
    <div className='container-fluid wrapper_login align-content-center'>
      <div className='row justify-content-center'>
        <div className="col-12 d-none d-md-block col-md-8 col-lg-7 login_bg p-0">
          <video src={video} autoPlay muted loop></video>
          {/* <div className="login_text m-3 p-2 text-white">
            <h4 className="h4">Sistema Automatizado</h4>
            <p className="lead">para la Gestión de operaciones en Industrias Ladrilleras.</p>
          </div> */}
        </div>
        <div className="col-12 col-md-4 col-lg-4 bg-white align-content-center login_form p-5">
          <main className="text-center">
            <form id="loginForm" action='' onSubmit={onSubmit}>
              <a href="/">
                <img className="mb-4" src={logo} alt="brickapp logo" />
              </a>
              <h1 className="h4 mb-4 fw-normal">Iniciar sesión</h1>
             <span className={statusHolder}>{loginStatus}</span>
              <div className="form-floating">
                <input type="text" className="form-control" id="inputUser" placeholder="Ingrese su usuario" 
                  onChange={(event)=>{setUsuario(event.target.value)}}
                />
                <label>Usuario</label>
              </div>
              <div className="form-floating">
                <input type="password" className="form-control" id="inputContraseña" placeholder="Ingresa tu contraseña"
                onChange={(event)=>{setContraseña(event.target.value)}}
                />
                <label>Contraseña</label>
              </div>
              <button className="btn btn-primary w-100 py-2 mt-3" type="submit" onClick={iniciarSesion}>Ingresar</button>
              <p className="mt-5 mb-3 text-body-secondary">&copy; Brickapp 2024 - Versión 1.0</p>
            </form>
          </main>
        </div>
      </div>

    </div>
  )
}

export default Login