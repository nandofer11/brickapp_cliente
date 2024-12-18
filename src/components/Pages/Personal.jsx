import DataTable from 'react-data-table-component';
import axios from 'axios';
//Icons
import * as FaIcons from 'react-icons/fa';
import { useState, useEffect } from 'react';

import config from '../../config';

import { Snackbar } from '@mui/material';
import Alert from '@mui/material/Alert';

const Trabajadores = () => {

    //variables para almacenar el estado de los datos de los trabajadores
    const [personalData, setPersonalData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estados para el formulario
    const [dni, setDni] = useState('');
    const [nombre_completo, setNombreCompleto] = useState('');
    const [ciudad, setCiudad] = useState('');
    const [direccion, setDireccion] = useState('');
    const [celular, setCelular] = useState('');
    const [pago_dia, setPagoDia] = useState('');
    const [fecha_ingreso, setFechaIngreso] = useState('');
    const [estado, setEstado] = useState(1); // Por defecto activo

    // Estados para las alertas
    const [alertMessage, setAlertMessage] = useState(''); // Mensaje a mostrar
    const [showAlert, setShowAlert] = useState(false);   // Controlar visibilidad del Snackbar
    const [alertSeverity, setAlertSeverity] = useState('error'); // Severidad del Alert (success o error)


    const [MostrarModalEliminarTrabajador, setMostrarModalEliminarTrabajador] = useState(false);
    const [idPersonalSeleccionado, setIdPersonalSeleccionado] = useState(null);

    const [isEditing, setIsEditing] = useState(false);
    const [modalTitle, setModalTitle] = useState('');

    const token = localStorage.getItem('token'); //obtener token de localstorage

    // Configuración de los headers con el token
    const configToken = {
        headers: {
            'Authorization': `Bearer ${token}`, // Envía el token en el encabezado
        }
    };

    

    //Función para obtener trabajadores desde endpoint
    const fetchPersonalData = async () => {
        try {
            const response = await axios.get(`${config.apiBaseUrl}personal/`, configToken);

            setPersonalData(response.data); //Guarda datos en el estado
            setLoading(false); //Cambia el estado de loading a false
        } catch (error) {
            console.error("Error al obtener los datos del personal: ", error);
            setLoading(false);
        }
    }

    const validarCamposPersonal = () => {
        if (dni.length !== 8) {
            setAlertMessage('El DNI debe tener 8 dígitos.');
            setAlertSeverity('error');
            setShowAlert(true);
            return false;
        }
        if (celular && celular.length !== 9) {
            setAlertMessage('El celular debe tener 9 dígitos.');
            setAlertSeverity('error');
            setShowAlert(true);
            return false;
        }
        return true; // Todos los campos son válidos
    };


    // Función para manejar la sumisión del formulario de trabajador
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevenir el envío del formulario

        if (!validarCamposPersonal()) {
            return; // Si la validación falla, no continuar
        }
    
        const trabajadorData = {
            dni,
            nombre_completo,
            ciudad,
            direccion,
            celular,
            pago_dia,
            fecha_ingreso,
            estado,
        };
    
        try {
            let response;
    
            if (isEditing) {
                response = await axios.put(`${config.apiBaseUrl}personal/${idPersonalSeleccionado}`, trabajadorData, configToken);
            } else {
                response = await axios.post(`${config.apiBaseUrl}personal/`, trabajadorData, configToken);
            }
    
            if (response.data && response.data.message) {
                setAlertMessage(isEditing ? 'Trabajador actualizado con éxito.' : 'Trabajador agregado exitosamente.');
                setAlertSeverity('success'); // Mensaje de éxito
                setShowAlert(true);
            }
    
            await fetchPersonalData(); // Actualizar la tabla
            const modal = window.bootstrap.Modal.getInstance(document.getElementById('modalTrabajador'));
            modal.hide(); // Cerrar el modal
            resetForm(); // Limpiar los campos
    
        } catch (error) {
            // Manejar mensajes de error específicos del servidor
            const errorMessage = error.response?.data?.message || 'Error desconocido. Intenta nuevamente.';
            setAlertMessage(errorMessage);
            setAlertSeverity('error'); // Mensaje de error
            setShowAlert(true);
        }
    };

    const resetForm = () => {
        setDni('');
        setNombreCompleto('');
        setCiudad('');
        setDireccion('');
        setCelular('');
        setPagoDia('');
        setFechaIngreso();
        setEstado(1); // Por defecto activo
        setIsEditing(false); // Variable que indica que estamos en modo de edición
        // Abre el modal
        // const modal = new bootstrap.Modal(document.getElementById('modalTrabajador'));
        // modal.show();
    };


    const handleEliminar = (id) => {
        setIdPersonalSeleccionado(id);
        setMostrarModalEliminarTrabajador(true); // Mostrar el modal
    };

    const handleEdit = (row) => {
        // Establecer el título del modal y cambiar el estado de edición
        setModalTitle('Editar personal');
        setIsEditing(true); // Modo edición activado

        // Convertir fecha_ingreso a formato 'YYYY-MM-DD'
        const fechaFormateada = new Date(row.fecha_ingreso).toISOString().split('T')[0];


        // Cargar datos del trabajador seleccionado en las variables de estado
        setDni(row.dni);
        setNombreCompleto(row.nombre_completo);
        setCiudad(row.ciudad);
        setDireccion(row.direccion);
        setCelular(row.celular);
        setPagoDia(row.pago_dia);
        setFechaIngreso(fechaFormateada);
        setEstado(row.estado);
        setIdPersonalSeleccionado(row.id_personal);

        // Abre el modal
        const modal = new bootstrap.Modal(document.getElementById('modalTrabajador'));
        modal.show();
    };

    // Función para manejar el evento de agregar un trabajador
    const handleAddTrabajador = () => {
        setDni('');
        setNombreCompleto('');
        setCiudad('');
        setDireccion('');
        setCelular('');
        setPagoDia('');
        setFechaIngreso('');
        setEstado(1); // O el valor por defecto que desees
        setModalTitle('Registrar personal'); // Establecer el título del modal
        setIsEditing(false);
    };

    const handleCloseModal = () => {
        setMostrarModalEliminarTrabajador(false);
        setIdPersonalSeleccionado(null);
    };

    const handleConfirmEliminar = async () => {
        try {
            await axios.delete(`${config.apiBaseUrl}personal/${idPersonalSeleccionado}`, configToken);
            setMostrarModalEliminarTrabajador(false);
            // Mostrar mensaje de éxito
            setAlertMessage('Trabajador eliminado con éxito.');
            setAlertSeverity('success'); // Tipo de alerta
            setShowAlert(true); // Mostrar la alerta
            setTimeout(() => {
                setShowAlert(false); // Ocultar alerta después de 2 segundos
            }, 2000);
            fetchPersonalData(); // Actualizar los datos después de eliminar
        } catch (error) {
            console.error('Error eliminando el personal:', error);
        }
    };

    //useEffect para cargar los datos al montar el componente
    useEffect(() => {
        fetchPersonalData();

        // Obtener la fecha actual cuando se carga el componente
        const today = new Date();
        const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
        const formattedDate = localDate.toISOString().split('T')[0]; // Formato yyyy-mm-dd
        setFechaIngreso(formattedDate);
    }, []);

    // Función para mostrar el badge según el estado del personal
    const renderEstadoBadge = (estado) => {
        if (estado === 1) {
            return <span className="badge bg-success">Activo</span>;
        } else {
            return <span className="badge bg-danger">Inactivo</span>;
        }
    };



    // Configurar columnas para la tabla
    const columns = [
        {
            name: 'DNI',
            selector: row => row.dni,
        },
        {
            name: 'Nombre completo',
            selector: row => row.nombre_completo,
            sortable: true,
        },
        {
            name: 'Ciudad',
            selector: row => row.ciudad,
            sortable: true,
        },
        {
            name: 'Dirección',
            selector: row => row.direccion,
        },
        {
            name: 'Celular',
            selector: row => row.celular,
        },
        {
            name: 'Pago día S/.',
            selector: row => row.pago_dia.toFixed(2), // Formatear a dos decimales
            sortable: false,
        },
        {
            name: 'Fecha ingreso',
            selector: row => new Date(row.fecha_ingreso).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            }),

            sortable: true,
        },
        {
            name: 'Estado',
            selector: row => row.estado,
            cell: row => renderEstadoBadge(row.estado), // Aquí usamos la función que retorna el badge
            sortable: true,
        },
        {
            name: 'Acciones',
            cell: (row) => (
                <div className="d-flex">
                    {/* Botón de Editar */}
                    <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(row)}>
                        <FaIcons.FaUserEdit /> {/* Icono de editar */}
                    </button>

                    {/* Botón de Eliminar */}
                    <button className="btn btn-danger btn-sm" onClick={() => handleEliminar(row.id_personal)}>
                        <FaIcons.FaUserTimes /> {/* Icono de eliminar */}
                    </button>
                </div>
            ),
            ignoreRowClick: true, // Ignorar el click de la fila en esta columna
            // allowOverflow: true,
            button: true, // Indicar que es un botón
        }
    ];


    return (
        <div className='d-flex'>
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

           
            <div className='content'>
                <div className="">
                    {/* Inicio Header Trabajadores */}
                    <div className="d-flex p-2 justify-content-between">
                        <h3 className="">Gestión de Personal</h3>
                        <div className="d-flex">

                            <form className="">
                                <div className="row">
                                    <div className="col-auto">
                                        <label className="col-form-label form-text">Buscar trabajador:</label>
                                    </div>
                                    <div className="col-auto me-3">
                                        <input type="text" placeholder="Buscar por nombre ..." id="inputPassword6" className="form-control" />
                                    </div>
                                </div>
                            </form>
                            <button onClick={handleAddTrabajador} type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modalTrabajador"><FaIcons.FaUserPlus /> Registrar personal</button>
                        </div>

                    </div>
                    {/* Fin Header Trabajadores */}

                    {/* Inicio modal de trabajador */}
                    <div className="modal fade" id="modalTrabajador" aria-labelledby="tituloModalTrabajador" aria-hidden="true">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header bg-primary text-white">
                                    <h1 className="modal-title fs-5" id="tituloModalTrabajador">{modalTitle}</h1>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div className="modal-body">
                                    <form onSubmit={handleSubmit}>
                                        <div className='row'>
                                            <div className='col-4'>
                                                <div className="mb-3">
                                                    <label htmlFor="dni" className="form-label">DNI</label>
                                                    <input type="number" className="form-control" id="dni" value={dni} onChange={(e) => {
                                                        if (e.target.value.length <= 8) {
                                                            setDni(e.target.value)
                                                        }
                                                    }
                                                    }
                                                        required />
                                                         <div id="dniHelp" class="form-text">Max. 8 dígitos.</div>
                                                </div>
                                            </div>
                                            <div className='col-8'>
                                                <div className="mb-3">
                                                    <label htmlFor="nombreCompleto" className="form-label">Nombres y Apellidos</label>
                                                    <input type="text" className="form-control" id="nombreCompleto" value={nombre_completo} onChange={(e) => setNombreCompleto(e.target.value)} required />
                                                </div>
                                            </div>
                                        </div>

                                        <div className='row'>
                                            <div className='col'>
                                                <div className="mb-3">
                                                    <label htmlFor="ciudad" className="form-label">Ciudad</label>
                                                    <input type="text" className="form-control" id="ciudad" value={ciudad} onChange={(e) => setCiudad(e.target.value)} required />
                                                </div>
                                            </div>
                                            <div className='col'>
                                                <div className="mb-3">
                                                    <label htmlFor="direccion" className="form-label">Dirección</label>
                                                    <input type="text" className="form-control" id="direccion" value={direccion} onChange={(e) => setDireccion(e.target.value)} required />
                                                </div>
                                            </div>
                                        </div>

                                        <div className='row'>
                                            <div className='col'>
                                                <div className="mb-3">
                                                    <label htmlFor="celular" className="form-label">Celular <span className='form-text'>(Opcional)</span></label>
                                                    <input type="phone" className="form-control" id="celular" value={celular} onChange={(e) => setCelular(e.target.value)} />
                                                </div>
                                            </div>
                                            <div className='col'>
                                                <div className="mb-3">
                                                    <label htmlFor="pagoDia" className="form-label">Pago por día S/.</label>
                                                    <input placeholder='S/. 00.00' type="number" className="form-control" id="pagoDia" value={pago_dia} onChange={(e) => setPagoDia(e.target.value)} required />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col">
                                                <div className="mb-3">
                                                    <label htmlFor="fechaIngreso" className="form-label">Fecha de ingreso</label>
                                                    <input type="date" className="form-control" id="fechaIngreso"
                                                        value={fecha_ingreso}
                                                        onChange={(e) => setFechaIngreso(e.target.value)} required />
                                                </div>
                                            </div>

                                            {isEditing && ( // Mostrar el select solo si estamos en modo de edición
                                                <div className="col">
                                                    <div className="mb-3">
                                                        <label htmlFor="estado" className="form-label">Estado</label>
                                                        <select className="form-select" id="estado" value={estado} onChange={(e) => setEstado(e.target.value)} required>
                                                            <option value={1}>Activo</option>
                                                            <option value={0}>Inactivo</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            )}

                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                                            <button type="submit" className="btn btn-primary">{isEditing ? 'Actualizar' : 'Guardar'}</button>
                                        </div>
                                    </form>
                                </div>

                            </div>
                        </div>
                    </div>
                    {/* Fin modal de trabajador */}

                    {/* Inicio tabla Trabajadores */}
                    <section className="mt-3">
                        {/* <h1>Lista de personal</h1> */}
                        <DataTable
                            title="Lista de trabajadores"
                            columns={columns}
                            data={personalData}
                            pagination={true}
                            paginationComponentOptions={{
                                rowsPerPageText: 'Filas por página', // Cambia el texto de "Rows per page"
                                rangeSeparatorText: 'de', // Cambia el texto de "of" entre el rango
                                noRowsPerPage: false, // NO mostrar el selector de filas por página, ponlo en true
                                selectAllRowsItem: false // Permitir seleccionar todas las filas, ponlo en true
                            }}
                            progressPending={loading}
                            highlightOnHover={true}
                            responsive={true}
                            noDataComponent={
                                <div style={{ color: '#ff6347', padding: '20px' }}>
                                    No hay registros de trabajadores disponibles.
                                </div>
                            }
                            persistTableHead={true}
                        />
                    </section>
                    {/* Fin tabla Trabajadores */}

                    {/* Inicio modal confirmacion eliminar trabajador */}
                    <div className={`modal ${MostrarModalEliminarTrabajador ? 'show' : ''}`} tabIndex="-1" style={{ display: MostrarModalEliminarTrabajador ? 'block' : 'none' }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header bg-danger text-white">
                                    <h5 className="modal-title">Confirmar Eliminación</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={handleCloseModal}
                                        aria-label="Close"
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <p>¿Estás seguro de que deseas eliminar este registro?</p>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={handleCloseModal}
                                    >
                                        Cerrar
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={handleConfirmEliminar}
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {MostrarModalEliminarTrabajador && <div className="modal-backdrop fade show"></div>} {/* Fondo del modal */}
                </div>
                {/* Fin  modal confirmacion eliminar trabajador */}

            </div>
        </div>
    )
}

export default Trabajadores;