import React, { useEffect, useState, useContext } from 'react';
import '../../App.css';
import axios from 'axios';
import video from '../../assets/video2.mp4';
import logo from '../../assets/images/logo.png';
import config from '../../config';
import { Link, useNavigate } from 'react-router-dom';

import { Snackbar } from '@mui/material';
import Alert from '@mui/material/Alert';

const Registro = () => {

    const token = localStorage.getItem('token'); //obtener token de localstorage

    // Configuración de los headers con el token
    const configToken = {
        headers: {
            'Authorization': `Bearer ${token}`, // Envía el token en el encabezado
        }
    };


    const [step, setStep] = useState(1); // Maneja el paso del formulario (1: Empresa, 2: Usuario)
    const [empresaData, setEmpresaData] = useState({
        razon_social: '',
        ruc: '',
        ciudad: '',
        direccion: ''
    });
    const [usuarioData, setUsuarioData] = useState({
        nombre_completo: '',
        usuario: '',
        contraseña: '',
        confirmar_contraseña: ''
    });

    const navigate = useNavigate();

    const [alertMessage, setAlertMessage] = useState(''); // Mensaje a mostrar
    const [showAlert, setShowAlert] = useState(false);   // Controlar visibilidad del Snackbar
    const [alertSeverity, setAlertSeverity] = useState('error'); // Severidad del Alert (success o error)

    const [empresaId, setEmpresaId] = useState(null); // Almacenar el id_empresa

    // Validación de los datos
    const validateEmpresa = () => {
        if (!empresaData.razon_social) {
            setAlertMessage('La razón social es obligatoria.');
            setAlertSeverity('error'); // Cambiar severidad según el caso
            setShowAlert(true);
            return false;
        }
        if (!empresaData.ruc || empresaData.ruc.length !== 11) {
            setAlertMessage('El RUC debe tener 11 dígitos.');
            setAlertSeverity('error');
            setShowAlert(true);
            return false;
        }
        if (!empresaData.ciudad) {
            setAlertMessage('La ciudad es obligatoria.');
            setAlertSeverity('error');
            setShowAlert(true);
            return false;
        }
        if (!empresaData.direccion) {
            setAlertMessage('La dirección es obligatoria.');
            setAlertSeverity('error');
            setShowAlert(true);
            return false;
        }
        setShowAlert(false); // Ocultar alerta si no hay errores
        return true;
    };

    const validateUsuario = () => {
        if (!usuarioData.nombre_completo) {
            setAlertMessage('El nombre completo es obligatorio.');
            setAlertSeverity('error');
            setShowAlert(true);
            return false;
        }
        if (!usuarioData.usuario) {
            setAlertMessage('El usuario es obligatorio.');
            setAlertSeverity('error');
            setShowAlert(true);
            return false;
        }
        if (!usuarioData.contraseña || usuarioData.contraseña.length < 3) {
            setAlertMessage('La contraseña debe tener al menos 3 caracteres.');
            setAlertSeverity('error');
            setShowAlert(true);
            return false;
        }
        if (usuarioData.contraseña !== usuarioData.confirmar_contraseña) {
            setAlertMessage('Las contraseñas no coinciden.');
            setAlertSeverity('error');
            setShowAlert(true);
            return false;
        }
        setShowAlert(false); // Ocultar alerta si no hay errores
        return true;
    };

    const handleEmpresaSubmit = async (e) => {
        e.preventDefault();
        if (!validateEmpresa()) return;

        try {
            const response = await axios.post(`${config.apiBaseUrl}empresa/`, empresaData);
            setAlertMessage('Empresa registrada con éxito.');
            setAlertSeverity('success'); // Cambiar severidad a éxito
            setShowAlert(true);
            const { id_empresa } = response.data; // Extraer id_empresa del response
            setEmpresaId(id_empresa); // Guardar el id_empresa en el estado
            setStep(2); // Ir al form de usuario después del registro exitoso
        } catch (err) {
            setAlertMessage('Error al registrar la empresa.');
            setAlertSeverity('error');
            setShowAlert(true);
        }
    };

    const handleUsuarioSubmit = async (e) => {
        e.preventDefault();
        if (!validateUsuario()) return

        try {
            if (!empresaId) {
                setAlertMessage('El ID de la empresa no está disponible. Registra una empresa primero.');
                setAlertSeverity('error');
                setShowAlert(true);
                return;
            }
            // Registrar el usuario
            const response = await axios.post(`${config.apiBaseUrl}usuario/`, {
                ...usuarioData,
                rol_id_rol: 5, // Rol de Administrador
                empresa_id_empresa: empresaId, //Usar id de la empresa previamente registrada
            });

            // Iniciar sesión automáticamente
            const loginResponse = await axios.post(`${config.apiBaseUrl}auth/login`, {
                usuario: usuarioData.usuario,
                contraseña: usuarioData.contraseña,
            });

            const { token, user } = loginResponse.data;

            // Almacenar token y datos del usuario en localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            // Mensaje de éxito
            setAlertMessage('Usuario registrado con éxito.');
            setAlertSeverity('success'); // Mensaje de éxito
            setShowAlert(true);

            // Redirigir a la ruta protegida /admin/inicio
            setTimeout(() => {
                navigate('/admin/inicio'); // Redirigir al dashboard después de registrar
            }, 2000);
        } catch {
            setAlertMessage('Error al registrar el usuario.');
            setAlertSeverity('error'); // Mensaje de error
            setShowAlert(true);
        }
    };

    // Ocultar mensaje de error después de 4 segundos
    useEffect(() => {

    }, []);

    const handleCloseSnackbar = () => {
        setShowError(false);
    };

    return (
        <div className="container-fluid wrapper_login align-content-center">
            {/* Snackbar para alerts */}
            <Snackbar
                open={showAlert}
                autoHideDuration={3000}
                onClose={() => setShowAlert(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity={alertSeverity} onClose={() => setShowAlert(false)}>
                    {alertMessage}
                </Alert>
            </Snackbar>
            <div className="row justify-content-center">

                <div className="col-12 d-none d-md-block col-md-8 col-lg-7 login_bg p-0">
                    <video src={video} autoPlay muted loop></video>
                </div>
                <div className="col-12 col-md-4 col-lg-4 bg-white align-content-center login_form p-5">
                    <main className="">
                        <div className='text-center'>
                            <Link to={'/'}>
                                <img className="mb-4" src={logo} alt="brickapp logo" />
                            </Link>
                            <h1 className="h4 mb-4 fw-normal">Registrar empresa y usuario</h1>
                        </div>
                        {step === 1 ? (
                            <form onSubmit={handleEmpresaSubmit}>
                                <div class="mb-2">
                                    <label for="inputRazonSocial" class="form-label">Razón social</label>
                                    <input type="text" class="form-control" id="inputRazonSocial" required
                                        value={empresaData.razon_social}
                                        onChange={(e) => setEmpresaData({ ...empresaData, razon_social: e.target.value })}
                                    />
                                    {/* <div id="emailHelp" class="form-text">We'll never share your email with anyone else.</div> */}
                                </div>

                                <div class="mb-2">
                                    <label for="inputRuc" class="form-label">RUC</label>
                                    <input
                                        required
                                        type="number"
                                        className="form-control"
                                        id="inputRuc"
                                        value={empresaData.ruc}
                                        onChange={(e) => {
                                            // Limitar a 11 dígitos
                                            const value = e.target.value;
                                            if (value.length <= 11) {
                                                setEmpresaData({ ...empresaData, ruc: value });
                                            }
                                        }}
                                        onInput={(e) => {
                                            // Evitar valores mayores a 11 dígitos al pegar
                                            const value = e.target.value.slice(0, 11);
                                            setEmpresaData({ ...empresaData, ruc: value });
                                        }}
                                    />
                                    <div id="rucHelp" class="form-text">Debe contener 11 dígitos.</div>
                                </div>

                                <div class="mb-2">
                                    <label for="inputCiudad" class="form-label">Ciudad</label>
                                    <input type="text" class="form-control" id="inputCiudad" required
                                        value={empresaData.ciudad}
                                        onChange={(e) => setEmpresaData({ ...empresaData, ciudad: e.target.value })}
                                    />
                                    {/* <div id="emailHelp" class="form-text">We'll never share your email with anyone else.</div> */}
                                </div>

                                <div class="mb-2">
                                    <label for="inputDireccion" class="form-label">Dirección</label>
                                    <input type="text" class="form-control" id="inputDireccion" required
                                        value={empresaData.direccion}
                                        onChange={(e) => setEmpresaData({ ...empresaData, direccion: e.target.value })}
                                    />
                                    {/* <div id="emailHelp" class="form-text">We'll never share your email with anyone else.</div> */}
                                </div>

                                <div class="mb-2">
                                    <label for="inputTelefono" class="form-label">Teléfono <span className='form-text'>(Opcional)</span></label>
                                    <input type="text" class="form-control" id="inputTelefono"
                                        value={empresaData.telefono}
                                        onChange={(e) => setEmpresaData({ ...empresaData, telefono: e.target.value })}
                                    />
                                    {/* <div id="emailHelp" class="form-text">We'll never share your email with anyone else.</div> */}
                                </div>

                                <button className="btn btn-primary w-100 py-2 mt-3" type="submit">
                                    Continuar
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleUsuarioSubmit}>
                                <div className="mb-2">
                                    <label for="inputNombre" className="form-label">Nombre y Apellidos</label>
                                    <input
                                        required
                                        className="form-control mb-2"
                                        type="text"
                                        placeholder="Nombre Completo"
                                        value={usuarioData.nombre_completo}
                                        onChange={(e) => setUsuarioData({ ...usuarioData, nombre_completo: e.target.value })}
                                    />
                                </div>

                                <div className="mb-2">
                                    <label for="inputUsuario" className="form-label">Usuario</label>
                                    <input
                                        required
                                        className="form-control mb-2"
                                        type="text"
                                        placeholder="Usuario"
                                        value={usuarioData.usuario}
                                        onChange={(e) => setUsuarioData({ ...usuarioData, usuario: e.target.value })}
                                    />
                                </div>

                                <div className="mb-2">
                                    <label for="inputContraseña" className="form-label">Contraseña</label>
                                    <input
                                        required
                                        className="form-control mb-2"
                                        type="password"
                                        placeholder="Contraseña"
                                        value={usuarioData.contraseña}
                                        onChange={(e) => setUsuarioData({ ...usuarioData, contraseña: e.target.value })}
                                    />
                                </div>

                                <div className="mb-2">
                                    <label for="inputConfirmarContraseña" className="form-label">Confirmar contraseña</label>
                                    <input
                                        required
                                        className="form-control mb-2"
                                        type="password"
                                        placeholder="Confirmar Contraseña"
                                        value={usuarioData.confirmar_contraseña}
                                        onChange={(e) =>
                                            setUsuarioData({ ...usuarioData, confirmar_contraseña: e.target.value })
                                        }
                                    />
                                </div>

                                <button className="btn btn-primary w-100 py-2 mt-3" type="submit">
                                    Registrar
                                </button>
                            </form>
                        )}
                        <p className="mt-5 mb-3 text-body-secondary text-center">&copy; Brickapp 2024 - Versión 1.0</p>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Registro;
