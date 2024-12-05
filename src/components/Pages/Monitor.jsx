import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Snackbar } from '@mui/material';
import Alert from '@mui/material/Alert';
import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';
import config from '../../config'; // Ajusta la importación de tu configuración

import iconTemperatura from '../../assets/images/icon_temp.png';
import iconTiempo from '../../assets/images/icon_time.png';
import iconMaterial from '../../assets/images/icon_sack.png';

const Monitor = () => {
    const [coccionesSinIniciar, setCoccionesSinIniciar] = useState([]);
    const [coccionesIniciadas, setCoccionesIniciadas] = useState([]);
    const [selectedCoccion, setSelectedCoccion] = useState(null);
    const [modalType, setModalType] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [wrapperData, setWrapperData] = useState(null);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [showWrapperData, setShowWrapperData] = useState(false);
    const [selectedOperator, setSelectedOperator] = useState(null);
    const [consumptionAmount, setConsumptionAmount] = useState('');
    const [consumptionHistory, setConsumptionHistory] = useState([]);

    const [showModalRegistroConsumo, setShowModalRegistroConsumo] = useState(false);

    const [loading, setLoading] = useState(false); // Estado de carga

    const token = localStorage.getItem('token');
    const configToken = {
        headers: { Authorization: `Bearer ${token}` },
    };

    // Generar datos de prueba para temperatura
    const generateTestData = () => {
        const data = [];
        for (let i = 0; i < 24; i++) { // 24 horas
            const temperature = Math.floor(Math.random() * 1201); // Temperatura entre 0 y 1200
            const time = `${i}:00`; // Formato de hora
            data.push({ x: time, y: temperature });
        }
        return data;
    };

    const temperatureData = generateTestData(); // Generar datos de prueba


    useEffect(() => {
        fetchCocciones();

        // console.log(selectedCoccion.);
    }, []);

    // Obtener las cocciones "en curso"
    const fetchCocciones = async () => {
        try {
            const { data } = await axios.post(`${config.apiBaseUrl}coccion/encurso`, {}, configToken);
            console.log("DATA:", data);
            const sinIniciar = data.filter(c => c.estado === 'En curso' && c.humeada === 0 && c.quema === 0);
            const iniciadas = data.filter(c => c.estado === 'En curso' && c.humeada === 1);
            setCoccionesSinIniciar(sinIniciar);
            setCoccionesIniciadas(iniciadas);
        } catch (error) {
            handleSnackbar('Error al obtener cocciones', 'error');
        }
    };

    const handleSnackbar = (message, severity) => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setShowSnackbar(true);
    };

    const iniciarCoccion = async (id) => {
        const coccion = coccionesSinIniciar.find(c => c.id_coccion === id);
        if (coccion) {
            setSelectedCoccion(coccion); // Establece el objeto de cocción completo
            setModalType('iniciarCoccion');
            setShowModal(true);
        }
    };

    const confirmIniciarCoccion = async () => {
        try {
            // Iniciar la cocción en el backend
            await axios.put(`${config.apiBaseUrl}coccion/${selectedCoccion.id_coccion}/iniciarhumeada`, {}, configToken);

            // Obtener la hora actual
            const horaActual = new Date().toLocaleTimeString();

            // Enviar mensaje de WhatsApp al iniciar la cocción
            await axios.post(`${config.apiBaseUrl}enviarmensaje`, {
                telefono: '+51970584592', // Número de teléfono del destinatario
                mensaje: `Inicio de Humeada 🔥 \nLa cocción con ID ${selectedCoccion.id_coccion} ha sido iniciada a las ${horaActual}.`
            });

            // Notificar al usuario del éxito
            handleSnackbar('Cocción iniciada con éxito y notificación enviada', 'success');
            setShowModal(false);
            fetchCocciones(); // Refrescar la lista de cocciones
        } catch (error) {
            console.error('Error al iniciar la cocción o enviar la notificación:', error);
            handleSnackbar('Error al iniciar la cocción o enviar la notificación', 'error');
        }
    };

    const iniciarQuema = async (id) => {
        const coccion = coccionesIniciadas.find(c => c.id_coccion === id);
        if (coccion) {
            setSelectedCoccion(coccion); // Establece el objeto de cocción completo
            setModalType('iniciarQuema');
            setShowModal(true);
        }
    };

    const confirmIniciarQuema = async () => {
        try {
            await axios.put(`${config.apiBaseUrl}coccion/${selectedCoccion.id_coccion}/iniciarquema`, {}, configToken);
            handleSnackbar('Quema iniciada con éxito', 'success');
            setShowModal(false);

            // Obtener la hora actual
            const horaActual = new Date().toLocaleTimeString();

            // Enviar mensaje de WhatsApp al iniciar la cocción
            await axios.post(`${config.apiBaseUrl}enviarmensaje`, {
                telefono: '+51970584592', // Número de teléfono del destinatario
                mensaje: `Inicio de Quema 🔥🔥 \nLa cocción con ID ${selectedCoccion.id_coccion} ha iniciado quema a las ${horaActual}.`
            });


            // Volver a obtener los operadores para actualizar los cards
            await verOperadores(selectedCoccion.id_coccion); // Actualiza los cards de operadores

            fetchCocciones();
        } catch (error) {
            handleSnackbar('Error al iniciar la quema', 'error');
        }
    };

    const finalizarCoccion = async (id) => {
        const coccion = coccionesIniciadas.find(c => c.id_coccion === id);
        if (coccion) {
            setSelectedCoccion(coccion); // Establece el objeto de cocción completo
            setModalType('finalizarCoccion');
            setShowModal(true);

            // Obtener la hora actual
            const horaActual = new Date().toLocaleTimeString();

            // Enviar mensaje de WhatsApp al iniciar la cocción
            await axios.post(`${config.apiBaseUrl}enviarmensaje`, {
                telefono: '+51970584592', // Número de teléfono del destinatario
                mensaje: `Cocción Finalizada 🔥 \nLa cocción con ID ${selectedCoccion.id_coccion} ha culminado a las ${horaActual}.`
            });

        }
    };

    const confirmFinalizarCoccion = async () => {
        try {
            await axios.put(`${config.apiBaseUrl}coccion/${selectedCoccion.id_coccion}/finalizarcoccion`, {}, configToken);
            handleSnackbar('Cocción finalizada con éxito', 'success');
            setShowModal(false);
            fetchCocciones();
        } catch (error) {
            handleSnackbar('Error al finalizar la cocción', 'error');
        }
    };

    const verOperadores = async (id) => {
        setLoading(true); // Iniciar carga
        try {
            const coccion = coccionesIniciadas.find(c => c.id_coccion === id);
            if (!coccion) {
                handleSnackbar('Cocción no encontrada', 'error');
                return;
            }

            setSelectedCoccion(coccion); // Establecer selectedCoccion
            console.log("coccion: ", coccion);

            const { data } = await axios.get(`${config.apiBaseUrl}coccion/${id}/operadores`, configToken);
            const filteredOperators = data.operadores.filter(op => {
                if (coccion.humeada === 1 && coccion.quema === 0) return op.nombre_cargo === 'Humeador';
                if (coccion.humeada === 1 && coccion.quema === 1) return op.nombre_cargo === 'Quemador';

                return false;
            });
            console.log("filteredOperators: ", filteredOperators);

            // Aquí es donde actualizas el historial de consumo para cada operador
            const updatedOperators = await Promise.all(filteredOperators.map(async (op) => {
                const history = await fetchConsumptionHistory(op.id_personal); // Traemos el historial
                return { ...op, consumptionHistory: history }; // Asignamos el historial a cada operador
            }));

            setWrapperData(updatedOperators);
            setShowWrapperData(true);
        } catch (error) {
            handleSnackbar('Error al obtener operadores', 'error');
        } finally {
            setLoading(false); // Finalizar carga
        }
    };

    // Función para abrir el modal de registro de consumo
    const openConsumptionModal = async (operator) => {
        setSelectedOperator(operator);
        setConsumptionAmount(''); // Reiniciar la cantidad
        await fetchConsumptionHistory(operator.id_personal); // Cargar el historial de consumos
        setShowModalRegistroConsumo(true);
    };

    // Función para obtener el historial de consumos
    const fetchConsumptionHistory = async (personalId) => {
        if (!selectedCoccion) {
            handleSnackbar('Cocción no seleccionada', 'error');
            return [];
        }
        try {
            const { data } = await axios.get(`${config.apiBaseUrl}coccion/${selectedCoccion.id_coccion}/${personalId}/${selectedCoccion.id_material}/consumosdematerial`, configToken);
            setConsumptionHistory(data);
            return data;
        } catch (error) {
            handleSnackbar('Error al obtener historial de consumos', 'error');
            return [];
        }
    };

    const registerConsumption = async () => {
        if (!selectedCoccion.id_coccion || !selectedOperator.id_personal || !selectedCoccion.id_material) {
            console.error("Faltan datos en selectedCoccion:", selectedCoccion);
            return;
        }

        const payload = {
            id_coccion: selectedCoccion.id_coccion, // Asegúrate de que `selectedCoccion` tenga esta propiedad
            id_personal: selectedOperator.id_personal,
            id_material: selectedCoccion.id_material,
            cantidad_consumida: parseFloat(consumptionAmount),
        };

        try {
            const response = await axios.post(
                `${config.apiBaseUrl}coccion/consumomaterial`,
                payload,
                configToken
            );
            console.log("Respuesta del servidor:", response.data);

            handleSnackbar('Consumo registrado exitosamente.', 'success');

            // Limpiar campos y cerrar el modal
            setConsumptionAmount('');
            setShowModalRegistroConsumo(false);

            // Recargar el historial de consumos
            await fetchConsumptionHistory(selectedOperator.id_personal);

        } catch (error) {
            console.error("Error al registrar el consumo:", error);
            handleSnackbar('Error al registrar el consumo.', 'error');
        }
    };

    const handleConsumptionInput = (input) => {
        if (input === 'clear') {
            setConsumptionAmount('');
        } else {
            setConsumptionAmount(prevAmount => prevAmount + input);
        }
    };

    const handleDeleteConsumption = async (idConsumo) => {
        try {
            await axios.delete(`${config.apiBaseUrl}coccion/consumo/${idConsumo}`, configToken);
            handleSnackbar('Registro eliminado con éxito', 'success');
            // Actualizar el historial de consumos después de la eliminación
            await fetchConsumptionHistory(selectedOperator.id_personal);
        } catch (error) {
            console.error('Error al eliminar el registro de consumo:', error);
            handleSnackbar('Error al eliminar el registro de consumo', 'error');
        }
    };


    return (
        <div className="container">
            <div className="row mb-4">
                <div className="col-md-6">
                    <h6>Cocciones sin Iniciar</h6>
                    {coccionesSinIniciar.length === 0 ? (
                        <div className="card">

                            <p className="text-danger text-center pt-4">No hay cocciones sin iniciar.</p>
                        </div>
                    ) : (
                        <ul className="list-group">
                            {coccionesSinIniciar.map(c => (
                                <li className="list-group-item d-flex justify-content-between align-items-center" key={c.id_coccion}>
                                    <div>
                                        <strong>ID:</strong> {c.id_coccion} <br />
                                        <strong>Fecha Encendido:</strong> {new Date(c.fecha_encendido).toLocaleString()} <br />
                                        <strong>Horno:</strong> {c.id_horno} - {c.nombre}
                                    </div>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => iniciarCoccion(c.id_coccion)}
                                    >
                                        Iniciar
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="col-md-6">
                    <h6>Cocciones Iniciadas</h6>
                    {coccionesIniciadas.length === 0 ? (
                        <div className="card">

                            <p className="text-danger text-center pt-4">No se ha iniciado ninguna cocción.</p>
                        </div>
                    ) : (
                        <ul className="list-group">
                            {coccionesIniciadas.map(c => (
                                <li className="list-group-item d-flex justify-content-between align-items-center" key={c.id_coccion}>
                                    <div>
                                        <strong>ID:</strong> {c.id_coccion} <br />
                                        <strong>Fecha Encendido:</strong> {new Date(c.fecha_encendido).toLocaleString()} <br />
                                        <strong>Horno:</strong> {c.id_horno} - {c.nombre}
                                    </div>
                                    <div>
                                        <button
                                            className="btn btn-info btn-sm me-2"
                                            onClick={() => {
                                                if (showWrapperData) {
                                                    setShowWrapperData(false); // Ocultar el wrapperData
                                                } else {
                                                    verOperadores(c.id_coccion); // Mostrar los operadores
                                                }
                                            }}
                                        >
                                            {showWrapperData ? 'Ocultar' : 'Ver'}
                                        </button>
                                        {c.quema === 0 ? (
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => iniciarQuema(c.id_coccion)}
                                            >
                                                Iniciar Quema
                                            </button>
                                        ) : (
                                            <button
                                                className="btn btn-warning btn-sm"
                                                onClick={() => finalizarCoccion(c.id_coccion)}
                                            >
                                                Finalizar
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {showWrapperData && wrapperData && (
                <div className="d-flex gap-2" id="wrapperData">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Operadores</h5>
                            {wrapperData.map(op => {
                                // Validar si consumptionHistory existe y es un array
                                const totalConsumption = Array.isArray(op.consumptionHistory)
                                    ? op.consumptionHistory
                                        .filter(record => record.cantidad_consumida !== null) // Filtrar consumos válidos
                                        .reduce((acc, record) => acc + record.cantidad_consumida, 0) // Sumar las cantidades
                                    : 0; // Si no existe, devolver 0 como valor predeterminado

                                console.log("consumptionHistory: ", totalConsumption); // Ver el historial de consumo para depurar

                                return (
                                    <div className="card mb-2" key={op.id_coccion_operador}>
                                        <div className="card-body">
                                            <h6 className="card-subtitle mb-2 text-muted">{op.nombre_completo}</h6>
                                            <p><strong>{totalConsumption}</strong></p> {/* Mostrar la sumatoria */}
                                            <button
                                                className="btn btn-primary btn-sm float-end"
                                                onClick={() => openConsumptionModal(op)}
                                            >
                                                Ingresar
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className='d-flex flex-column gap-2 flex-fill '>
                        <div className='card '>
                            <div className='card-body'>
                                <h5 className="card-title">Monitoreo de Cocción</h5>
                                <LineChart
                                    xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
                                    series={[
                                        {
                                            data: [2, 5.5, 2, 8.5, 1.5, 5],
                                        },
                                    ]}
                                    width={880}
                                    height={300}
                                    grid={{ vertical: true, horizontal: true }}
                                />
                            </div>
                        </div>
                        <div className="card ">
                            <div className="card-body">
                                <h5 className="card-title">Resumen</h5>
                                <div className='d-flex gap-2 justify-content-between'>
                                    <div className='d-flex gap-2 '>
                                        <div className='d-flex'>
                                            <div>

                                                <img src={iconTemperatura} />
                                            </div>
                                            <div>
                                                <p className='mb-0'>Temperatura actual</p>
                                                <p className='mb-0'><strong>680°</strong></p>
                                            </div>
                                        </div>
                                        <div className='d-flex'>
                                            <div>

                                                <img src={iconTiempo} />
                                            </div>
                                            <div>
                                                <p className='mb-0'>Tiempo transcurrido</p>
                                                <p className='mb-0'><strong>15h 13min</strong></p>
                                            </div>
                                        </div>
                                        <div className='d-flex'>
                                            <div>

                                                <img src={iconMaterial} />
                                            </div>
                                            <div>
                                                <p className='mb-0'>Material utilizado</p>
                                                <p className='mb-0'><strong>1320</strong></p>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        {/* <p className='mb-0'>Consumo de material</p> */}
                                        <BarChart
                                            xAxis={[{ scaleType: 'band', data: ['Cocción 1'] }]}
                                            series={[{ data: [4] }, { data: [6] }]}
                                            width={400}
                                            height={200}
                                        />

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>



                </div>
            )}



            <Snackbar
                open={showSnackbar}
                autoHideDuration={3000}
                onClose={() => setShowSnackbar(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setShowSnackbar(false)} severity={snackbarSeverity}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>

            {/* Modal de registro de consumo */}
            <div className={`modal fade ${showModalRegistroConsumo ? 'show' : ''}`} style={{ display: showModalRegistroConsumo ? 'block' : 'none' }} tabIndex="-1" role="dialog">
                <div className="modal-dialog modal-lg" role="document">
                    <div className="modal-content">
                        <div className="modal-header bg-primary text-white">
                            <h5 className="modal-title">Registro material - {selectedOperator ? selectedOperator.nombre_completo : ''}</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => setShowModalRegistroConsumo(false)}>
                            </button>
                        </div>
                        <div className="modal-body row">
                            <div className="col">
                                <div className="mb-3">
                                    <p className="text-center mb-0">Cantidad</p>
                                    <h2 className="text-center">{consumptionAmount || 0}</h2> {/* Aseguramos que la cantidad comience en 0 y esté centrada */}
                                </div>
                                <div className="d-grid gap-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                                    {[...Array(9).keys()].map(num => (
                                        <button
                                            key={num}
                                            className="btn btn-secondary"
                                            onClick={() => handleConsumptionInput(num.toString())}
                                            style={{ fontSize: '18px' }}
                                        >
                                            {num + 1} {/* Los números empiezan desde 1 */}
                                        </button>
                                    ))}
                                    {/* Botón de 0 */}
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => handleConsumptionInput('0')}
                                        style={{ fontSize: '18px' }}
                                    >
                                        0
                                    </button>
                                    {/* Botón de borrar */}
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => handleConsumptionInput('clear')}
                                        style={{ fontSize: '18px' }}
                                    >
                                        Borrar
                                    </button>
                                </div>
                            </div>

                            <div className="col mt-3">
                                <h6>Historial de Consumos</h6>
                                {consumptionHistory
                                    .filter(record => record.cantidad_consumida !== null) // Filtrar registros válidos
                                    .map(record => (
                                        <div key={record.id_consumo_material} className="card mb-1">
                                            <div className="card-body d-flex justify-content-between align-items-center">
                                                <div>
                                                    <p className='mb-0'>Hora: {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })} - Cantidad: {record.cantidad_consumida}</p>
                                                </div>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleDeleteConsumption(record.id_consumo_material)}
                                                >
                                                    X
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowModalRegistroConsumo(false)}>Cerrar</button>
                            <button type="button" className="btn btn-primary" onClick={registerConsumption}>
                                Registrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Confirmación */}
            <div className={`modal fade ${showModal ? 'show' : ''}`} style={{ display: showModal ? 'block' : 'none' }} tabIndex="-1" role="dialog">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header bg-danger text-white">
                            <h5 className="modal-title">
                                Confirmar {modalType === 'iniciarCoccion' ? 'Iniciar Cocción' : modalType === 'iniciarQuema' ? 'Iniciar Quema' : 'Finalizar Cocción'}
                            </h5>
                            <button onClick={() => setShowModal(false)} type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>

                        </div>
                        <div className="modal-body">
                            <p>¿Está seguro de que desea {modalType === 'iniciarCoccion' ? 'iniciar la cocción' : 'otra acción'}?</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                            <button type="button" className="btn btn-primary" onClick={modalType === 'iniciarCoccion' ? confirmIniciarCoccion : modalType === 'iniciarQuema' ? confirmIniciarQuema : confirmFinalizarCoccion}>
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Monitor;