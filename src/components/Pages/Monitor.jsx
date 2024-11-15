import { LineChart } from '@mui/x-charts';


import { useState, useEffect } from 'react';
import axios from 'axios';

import config from '../../config';


import "../../App.css"
import * as FaIcons from 'react-icons/fa';

const Monitor = () => {

    const token = localStorage.getItem('token'); // Obtener token de localstorage
    const configToken = {
        headers: {
            'Authorization': `Bearer ${token}`, // Envía el token en el encabezado
        }
    };

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Estados para las alertas
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState(''); // 'success' o 'danger'
    const [showAlert, setShowAlert] = useState(false);

    //Para modales
    const [showModalSeleccionarCoccion, setModalSeleccionarCoccion] = useState(false);


    const [coccionEnCurso, setCoccionEnCurso] = useState(null);

    // Para controlar si mostrar el monitor
    const [showMonitor, setShowMonitor] = useState(false);

    const [currentProcess, setCurrentProcess] = useState('humeada'); // Estado para el proceso actual
    const [registros, setRegistros] = useState([]); // Estado para los registros de temperatura


    // Función para consultar la cocción en curso
    const handleVerCoccion = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await axios.get(`${config.apiBaseUrl}coccion/horno/H2/encurso`, configToken);
            if (response.data) {
                setCoccionEnCurso(response.data);
                // Obtener registros de temperatura
                await obtenerRegistrosCoccion(response.data.id_coccion);
            } else {
                setCoccionEnCurso(null);
            }
        } catch (error) {
            console.error('Error al consultar la base de datos:', error);
            setError('Error al consultar los datos');
        } finally {
            setIsLoading(false);
            setModalSeleccionarCoccion(true);
        }
    };

    // Función para transformar los registros
    const transformarRegistros = (registros) => {
        return registros.map((registro) => ({
            x: registro.hora,       // Usar la hora como el eje X
            y: registro.temperatura // Usar la temperatura como el eje Y
        }));
    };

    // Función para obtener registros de temperatura
    const obtenerRegistrosCoccion = async (idCoccion) => {
        try {
            const response = await axios.get(`${config.apiBaseUrl}coccion/${idCoccion}/registros`, configToken);
            console.log("Registros de temperatura:", response.data); // Mostrar datos en consola
            const datosTransformados = transformarRegistros(response.data);
            setRegistros(datosTransformados); // Guardar los registros en el estado, si es necesario
        } catch (error) {
            console.error('Error al obtener registros de cocción:', error);
        }
    };

    const iniciarCoccion = async () => {
        if (!coccionEnCurso) {
            setAlertMessage('Debes seleccionar una cocción en curso.');
            setAlertType('danger');
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 3000);
            return;
        }

        try {
            const response = await axios.put(`${config.apiBaseUrl}coccion/iniciarcoccion/${coccionEnCurso.id_coccion}`, {}, configToken);

            if (response.status === 200) {
                setAlertMessage('Cocción iniciada con éxito');
                setAlertType('success');
                setShowAlert(true);
                setTimeout(() => setShowAlert(false), 3000);

                // Muestra el monitor
                setShowMonitor(true);
                setModalSeleccionarCoccion(false);
                obtenerRegistrosCoccion()
            }
        } catch (error) {
            setAlertMessage('Error al iniciar la cocción');
            setAlertType('danger');
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 3000);
            console.error('Error:', error);
        }
    };

    // Función para cambiar al subproceso "quema"
    const cambiarProcesoQuema = async () => {
        if (!coccionEnCurso) return;

        try {
            const response = await axios.put(`${config.apiBaseUrl}coccion/cambiar_quema/${coccionEnCurso.id_coccion}`, {
                quema: 1,
                hora_inicio_quema: new Date().toISOString()
            }, configToken);

            if (response.status === 200) {
                setAlertMessage('Proceso de quema iniciado con éxito');
                setAlertType('success');
                setShowAlert(true);
                setTimeout(() => setShowAlert(false), 3000);

                setCurrentProcess('quema');
            }
        } catch (error) {
            setAlertMessage('Error al cambiar al proceso de quema');
            setAlertType('danger');
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 3000);
            console.error('Error:', error);
        }
    };

    // Funcion para finalizar el proceso de coccion
    const finalizarCoccion = async () => {
        // if (!coccionEnCurso) {
        //     setAlertMessage('Debes seleccionar una cocción en curso.');
        //     setAlertType('danger');
        //     setShowAlert(true);
        //     setTimeout(() => setShowAlert(false), 3000);
        //     return;
        // }

        try {
            const response = await axios.put(`${config.apiBaseUrl}coccion/finalizar_coccion/${coccionEnCurso.id_coccion}`, {}, configToken);

            if (response.status === 200) {
                setAlertMessage('Cocción finalizada con éxito');
                setAlertType('success');
                setShowAlert(true);
                setTimeout(() => setShowAlert(false), 3000);

                setCoccionEnCurso(null); // Opcional: Si deseas limpiar el estado después de finalizar la cocción
                setShowMonitor(false); // Opcional: Ocultar el monitor después de finalizar la cocción
            }
        } catch (error) {
            setAlertMessage('Error al finalizar la cocción');
            setAlertType('danger');
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 3000);
            console.error('Error:', error);
        }
    };


    useEffect(() => {
        handleVerCoccion();// Llamar a la función para obtener la cocción en curso

    }, []);

    // Filtrar y mapear los datos
    const filteredDataset = registros
        .filter((registro) => registro.sensor_id_sensor === 1) // Filtra por sensor_id_sensor
        .map((registro) => ({
            x: registro.hora, // Usa la hora como el eje X
            y: registro.temperatura, // Usa la temperatura como el eje Y
        }));

    return (
        <div className='d-flex'>
            <div className='content container'>
                <h3>Monitoreo del proceso</h3>
                <div className="d-flex justify-content-between align-items-star border border-light-subtle p-2">
                    <div>
                        <p>Información cocción:</p>
                        {
                            isLoading ? (
                                <p>Cargando...</p>
                            ) : coccionEnCurso ? (
                                <div>
                                    <p className='mb-0'><strong> Horno: </strong> {coccionEnCurso.prefijo} {coccionEnCurso.nombre_horno}</p>
                                    <p className='mb-0'><strong> Fecha: </strong>  {coccionEnCurso.fecha_encendido}</p>
                                    <p className='mb-0'><strong>Estado: </strong> {coccionEnCurso.estado}</p>
                                </div>
                            ) : (
                                <span
                                    className='d-flex justify-content-center text-danger'
                                >
                                    No se ha registrado una cocción en H2.

                                </span>
                            )}

                    </div>
                    <div>
                        <button className='btn btn-primary' onClick={iniciarCoccion}>Iniciar Humeada</button>
                        <button className='btn btn-warning ms-2' onClick={cambiarProcesoQuema}>Iniciar Quema</button>
                        <button className='btn btn-danger ms-2' onClick={finalizarCoccion}>Finalizar cocción</button>
                    </div>
                </div>

                {/* Monitor de operadores */}
                {showMonitor && coccionEnCurso && (
                    <div id="wrapper_monitor" className="row mb-4">
                       

                        {/* Gráfico de temperatura */}
                        <div className="mb-4 mt-4">
                            <h5>Gráfico de temperatura</h5>
                            {registros.length > 0 ? (
                                <LineChart
                    dataset={registros}
                    xAxis={[
                        {
                            dataKey: 'x', 
                            label: 'Tiempo (HH:mm:ss)', 
                            tickFormat: (tick) => tick.slice(0, 5), // Mostrar solo HH:mm
                            scaleType: 'band', // Escala adecuada para tiempo
                        },
                    ]}
                    yAxis={[
                        {
                            dataKey: 'y',
                            label: 'Temperatura (°C)',
                            domain: [0, 1200], // Rango fijo para temperatura
                            tickInterval: 50,  // Intervalos de 50 en 50 grados
                        },
                    ]}
                    series={[
                        { dataKey: 'y', label: 'Temperatura' }, // Representa la temperatura
                    ]}
                    height={400}
                    width={700}
                    margin={{ left: 50, right: 50, top: 30, bottom: 50 }}
                    grid={{ vertical: true, horizontal: true }}
                />
                            ) : (
                                <p>No hay datos para mostrar.</p>
                            )}
                        </div>

                        {coccionEnCurso.operadores
                            .filter(operador => currentProcess === 'humeada' ? operador.nombre_cargo === 'Humeador' : operador.nombre_cargo === 'Quemador')
                            .map((operador, index) => (
                                <div key={index} className="card mb-3 col-md-3">
                                    <div className="card-body">
                                        <h5 className="card-title">{operador.nombre_operador}</h5>
                                        <p className="card-text">{operador.nombre_cargo}</p>
                                        <input
                                            type="number"
                                            className="form-control mb-2"
                                            placeholder="Cantidad"
                                        />
                                        <button className="btn btn-primary">Ingresar cantidad</button>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Monitor;
