import { LineChart } from '@mui/x-charts';


import { useState, useEffect } from 'react';
import axios from 'axios';

import config from '../../config';
import iconTemp from '../../assets/images/icon_temp.png';
import iconTime from '../../assets/images/icon_time.png';
import iconSack from '../../assets/images/icon_sack.png';

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

    const [coccionEnCurso, setCoccionEnCurso] = useState(null);

    // Para controlar si mostrar el monitor
    const [showMonitor, setShowMonitor] = useState(false);

    const [registros, setRegistros] = useState([]); // Estado para los registros de temperatura

    const [isHumeada, setIsHumeada] = useState(false);
    const [isQuema, setIsQuema] = useState(false);

    // Estado para el modal de agregar cantidad
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOperator, setSelectedOperator] = useState(null);
    const [cantidad, setCantidad] = useState('');

    const openModal = (operador) => {
        setSelectedOperator(operador);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCantidad('');
        setSelectedOperator(null);
    };

    const handleRegisterCantidad = async () => {
        try {
            const response = await axios.post(`${config.apiBaseUrl}detalle_coccion`, {
                operadorId: selectedOperator.id, // Asegúrate de tener el ID del operador
                cantidad: cantidad,
            });
            if (response.status === 200) {
                alert('Cantidad registrada con éxito');
                closeModal(); // Cerrar modal después de registrar
            }
        } catch (error) {
            console.error('Error al registrar cantidad:', error);
            alert('Error al registrar cantidad');
        }
    };
    
    // Función para consultar la cocción en curso
    const handleVerCoccion = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await axios.get(`${config.apiBaseUrl}coccion/horno/H2/encurso`, configToken);
            if (response.data) {
                const { humeada, quema } = response.data;
                setCoccionEnCurso(response.data);

                // Validar estados de humeada y quema
                setIsHumeada(humeada === 1);
                setIsQuema(quema === 1);

                if (humeada === 1 || quema === 1) {
                    await obtenerRegistrosCoccion(response.data.id_coccion);
                    setShowMonitor(true);
                }
            } else {
                setCoccionEnCurso(null);
                setShowMonitor(false);
            }
        } catch (error) {
            console.error('Error al consultar la base de datos:', error);
            setError('Error al consultar los datos');
        } finally {
            setIsLoading(false);
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

    useEffect(() => {
        let isMounted = true;
        handleVerCoccion().finally(() => {
            if (isMounted) setIsLoading(false);
        });
        return () => {
            isMounted = false;
        };
    }, []);
    

    // Agrega otro useEffect para actualizar el wrapper_monitor cuando cambien los estados de humeada o quema

    useEffect(() => {
        if (coccionEnCurso) {
            setIsHumeada(coccionEnCurso.humeada === 1);
            setIsQuema(coccionEnCurso.quema === 1);
        }
    }, [coccionEnCurso]); // Se ejecuta cada vez que coccionEnCurso cambia

    const actualizarEstadoCoccion = async (campo, valor) => {
        try {
            const response = await axios.put(
                `${config.apiBaseUrl}coccion/iniciarcoccion/${coccionEnCurso.id_coccion}`,
                { campo, valor }, // Campo y valor a actualizar
                configToken
            );
    
            if (response.status === 200) {
                setAlertMessage(`${campo === 'humeada' ? 'Humeada' : 'Quema'} iniciada con éxito.`);
                setAlertType('success');
                setShowAlert(true);
                setTimeout(() => setShowAlert(false), 3000);
    
                // Actualiza la cocción en curso después del cambio
                const updatedCoccion = await axios.get(`${config.apiBaseUrl}coccion/${coccionEnCurso.id_coccion}`, configToken);
                if (updatedCoccion.status === 200) {
                    setCoccionEnCurso(updatedCoccion.data); // Actualiza el estado de la cocción
    
                    // Aquí puedes llamar a obtenerRegistrosCoccion si es necesario
                    await obtenerRegistrosCoccion(updatedCoccion.data.id_coccion);
                }
                setShowMonitor(true);
            }
        } catch (error) {
            setAlertMessage(`Error al iniciar la ${campo === 'humeada' ? 'humeada' : 'quema'}.`);
            setAlertType('danger');
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 3000);
            console.error('Error:', error);
        }
    };

    // Funcion para finalizar el proceso de coccion
    const finalizarCoccion = async () => {

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
                <div className="d-flex justify-content-between align-items-center border border-light-subtle p-2 mb-2">
                    <div>
                        <p className='mb-1'>Información cocción:</p>
                        {
                            isLoading ? (
                                <p>Cargando...</p>
                            ) : coccionEnCurso ? (
                                <div className='d-flex gap-4'>
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
                        {/* Mostrar solo si coccionEnCurso está definido */}
                        {coccionEnCurso && (
                            <>
                                {coccionEnCurso.humeada === 0 && coccionEnCurso.quema === 0 && (
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => actualizarEstadoCoccion('humeada', 1)}
                                    >
                                        Iniciar Humeada
                                    </button>
                                )}
                                {coccionEnCurso.humeada === 1 && coccionEnCurso.quema === 0 && (
                                    <button
                                        className="btn btn-warning ms-2"
                                        onClick={() => actualizarEstadoCoccion('quema', 1)}
                                    >
                                        Iniciar Quema
                                    </button>
                                )}
                                {coccionEnCurso.humeada === 1 && coccionEnCurso.quema === 1 && (
                                    <button
                                        className="btn btn-danger ms-2"
                                        onClick={finalizarCoccion}
                                    >
                                        Finalizar Cocción
                                    </button>
                                )}
                            </>
                        )}
                        {/* Mensaje para cuando no hay cocción en curso */}
                        {!coccionEnCurso && <p>No hay cocción en curso.</p>}
                    </div>

                </div>


                {showMonitor && coccionEnCurso && (
                    <div id="wrapper_monitor" className='d-flex gap-2'>

                        <div className='wrapper_cards d-flex flex-column gap-2'>
                            {coccionEnCurso?.operadores?.filter((operador) =>
                                // Si humeada = 1 y quema = 0, mostrar solo operadores Humeador
                                (coccionEnCurso.humeada === 1 && coccionEnCurso.quema === 0 && operador.nombre_cargo === 'Humeador') ||
                                // Si humeada = 1 y quema = 1, mostrar solo operadores Quemador
                                (coccionEnCurso.humeada === 1 && coccionEnCurso.quema === 1 && operador.nombre_cargo === 'Quemador')
                            )?.map((operador, index) => (
                                <div key={index} className="card">
                                    <div className="card-body text-center">
                                        <h5 className="card-title mb-0">{operador.nombre_operador}</h5>
                                        <p className="card-text mb-0">{operador.nombre_cargo}</p>
                                        <p className='my-0 text-danger'><strong>0</strong></p>
                                        <button className="btn btn-primary">Ingresar cantidad</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="wrapper_info_coccion d-flex flex-column gap-2 flex-grow-1">
                            <div className=''>
                                {/* Gráfico de temperatura */}
                                <div className="card p-2">
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
                                        <p>No hay sensor capturando datos.</p>
                                    )}
                                </div>

                                {/* Grafico barras */}
                                <div className="card p-2">
                                    <h5>Gráfico de barras</h5>
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
                                        <p>No hay datos.</p>
                                    )}
                                </div>
                            </div>


                            <div className='d-flex gap-2'>
                                <div className='wrapper_sensores d-flex flex-column gap-2'>
                                    <div className='card'>
                                        <div className="card-body">
                                            <p className='mb-0'>Termocupla 1</p>
                                            <p className='mb-0'>756 °C</p>
                                        </div>
                                    </div>
                                    <div className='card'>
                                        <div className="card-body">
                                            <p className='mb-0'>Termocupla 2</p>
                                            <p className='mb-0'>756 °C</p>
                                        </div>
                                    </div>
                                    <div className='card'>
                                        <div className="card-body">
                                            <p className='mb-0'>Termocupla 3</p>
                                            <p className='mb-0'>756 °C</p>
                                        </div>
                                    </div>
                                    <div className='card'>
                                        <div className="card-body">
                                            <p className='mb-0'>DHT22</p>
                                            <p className='mb-0'>756 °C</p>
                                        </div>
                                    </div>
                                </div>



                                <div className='d-flex flex-column gap-2'>
                                    {/* Card Temperatura actual */}
                                    <div className='card'>
                                        <div className="card-body d-flex">
                                            <img src={iconTemp} alt="" />
                                            <div className='ms-2'>
                                                <p className='mb-0'>Temperatura actual</p>
                                                <p className='mb-0'><strong>600 °C</strong></p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Tiempo transcurrido */}
                                    <div className='card'>
                                        <div className="card-body d-flex">
                                            <img src={iconTime} alt="" />
                                            <div className='ms-2'>
                                                <p className='mb-0'>Tiempo transcurrido</p>
                                                <p className='mb-0'><strong>15h 35min</strong></p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Material utilizado */}
                                    <div className='card'>
                                        <div className="card-body d-flex">
                                            <img src={iconSack} alt="" />
                                            <div className='ms-2'>
                                                <p className='mb-0'>Material Utilizado</p>
                                                <p className='mb-0'><strong>600 °C</strong></p>}
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
                      
        </div>
    )
}

export default Monitor;


