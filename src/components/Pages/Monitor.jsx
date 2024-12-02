import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Snackbar } from '@mui/material';
import Alert from '@mui/material/Alert';
import { LineChart } from '@mui/x-charts/LineChart';
import config from '../../config'; // Ajusta la importación de tu configuración

const Monitor = () => {
    const [coccionesSinIniciar, setCoccionesSinIniciar] = useState([]);
    const [coccionesIniciadas, setCoccionesIniciadas] = useState([]);
    const [selectedCoccion, setSelectedCoccion] = useState(null);
    const [modalType, setModalType] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [wrapperData, setWrapperData] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [showWrapperData, setShowWrapperData] = useState(false);
    const [selectedOperator, setSelectedOperator] = useState(null);
    const [consumptionAmount, setConsumptionAmount] = useState('');
    const [consumptionHistory, setConsumptionHistory] = useState([]);

    const [showModalRegistroConsumo, setShowModalRegistroConsumo] = useState(false);


    const token = localStorage.getItem('token');
    const configToken = {
        headers: { Authorization: `Bearer ${token}` },
    };

    useEffect(() => {
        fetchCocciones();

        // console.log(selectedCoccion.);
    }, []);

    // Obtener las cocciones "en curso"
    const fetchCocciones = async () => {
        try {
            const { data } = await axios.post(`${config.apiBaseUrl}coccion/encurso`, {}, configToken);
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
            await axios.put(`${config.apiBaseUrl}coccion/${selectedCoccion}/iniciarhumeada`, {}, configToken);
            handleSnackbar('Cocción iniciada con éxito', 'success');
            setShowModal(false);
            fetchCocciones();
        } catch (error) {
            handleSnackbar('Error al iniciar la cocción', 'error');
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
            await axios.put(`${config.apiBaseUrl}coccion/${selectedCoccion}/iniciarquema`, {}, configToken);
            handleSnackbar('Quema iniciada con éxito', 'success');
            setShowModal(false);

             // Volver a obtener los operadores para actualizar los cards
        await verOperadores(selectedCoccion); // Actualiza los cards de operadores

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
    }
    };

    const confirmFinalizarCoccion = async () => {
        try {
            await axios.put(`${config.apiBaseUrl}coccion/${selectedCoccion}/finalizarcoccion`, {}, configToken);
            handleSnackbar('Cocción finalizada con éxito', 'success');
            setShowModal(false);
            fetchCocciones();
        } catch (error) {
            handleSnackbar('Error al finalizar la cocción', 'error');
        }
    };

    const verOperadores = async (id) => {
        try {
        const { data } = await axios.get(`${config.apiBaseUrl}coccion/${id}/operadores`, configToken);
        
        // Encuentra la cocción correspondiente para determinar su estado
        const coccion = coccionesIniciadas.find(c => c.id_coccion === id);
        
        // Filtrar operadores según el estado de la cocción
        const filteredOperators = data.operadores.filter(op => {
            // Si la cocción está en humeada
            if (coccion.humeada === 1 && coccion.quema === 0) {
                return op.nombre_cargo === 'Humeador'; // Solo mostrar Humeador
            }
            // Si la cocción está en quema
            else if (coccion.humeada === 1 && coccion.quema === 1) {
                return op.nombre_cargo === 'Quemador'; // Solo mostrar Quemador
            }
            return false; // Si no coincide con ninguna condición, no mostrar nada
        });

        setWrapperData(filteredOperators); // Actualiza el estado con los operadores filtrados
        setSelectedCoccion(id); // Actualiza la cocción seleccionada
        setShowWrapperData(true); // Muestra el wrapperData con los operadores
    } catch (error) {
        handleSnackbar('Error al obtener operadores', 'error'); // Manejo de errores
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
        try {
            const { data } = await axios.get(`${config.apiBaseUrl}coccion/${selectedCoccion}/${personalId}/material/consumosdematerial`, configToken);
            setConsumptionHistory(data);
        } catch (error) {
            handleSnackbar('Error al obtener historial de consumos', 'error');
        }
    };

    const registerConsumption = async () => {
    if (!consumptionAmount) {
        handleSnackbar('Por favor, ingrese una cantidad válida', 'error');
        return;
    }

    try {
        console.log("selectedCoccion.id_material", selectedCoccion.id_material);
        console.log("selectedCoccion", selectedCoccion);
        const payload = {
            coccionId: selectedCoccion, // ID de la cocción
            personalId: selectedOperator.id_personal, // ID del operador
            materiales: [
                {
                    materialId: selectedCoccion.id_material, // ID del material de la cocción
                    cantidadConsumida: parseInt(consumptionAmount, 10) // Asegúrate de enviar la cantidad como número
                }
            ]
        };

        // Realiza la solicitud POST para registrar el consumo
        const { data } = await axios.post(`${config.apiBaseUrl}coccion/consumomaterial`, payload , configToken);

        handleSnackbar('Consumo registrado con éxito', 'success');
        setConsumptionAmount(''); // Reiniciar la cantidad
        setShowModalRegistroConsumo(false); // Cerrar el modal
        await fetchConsumptionHistory(selectedOperator.id_personal); // Actualizar el historial de consumos
    } catch (error) {
        handleSnackbar('Error al registrar el consumo', 'error');
    }
};

    const handleConsumptionInput = (input) => {
        if (input === 'clear') {
            setConsumptionAmount('');
        } else {
            setConsumptionAmount(prevAmount => prevAmount + input);
        }
    };

    const toggleWrapperData = () => {
        setShowWrapperData(!showWrapperData);
    };

    return (
        <div className="container">
            <div className="row mb-4">
                <div className="col-md-6">
                    <h5>Cocciones sin Iniciar</h5>
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
                </div>
                <div className="col-md-6">
                    <h5>Cocciones Iniciadas</h5>
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
                </div>
            </div>

            {showWrapperData && wrapperData && (
                <div className="d-flex" id="wrapperData">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Operadores</h5>
                            {wrapperData.map(op => (
                                <div className="card mb-2" key={op.id_coccion_operador}>
                                    <div className="card-body">
                                        <h6 className="card-subtitle mb-2 text-muted">{op.nombre_completo}</h6>
                                        <p><strong>0</strong></p>
                                        <button
                                            className="btn btn-primary btn-sm float-end"
                                            onClick={() => openConsumptionModal(op)}
                                        >
                                            Ingresar
                                        </button>
                                    </div>
                                </div>
                            ))}
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
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Registro material - {selectedOperator ? selectedOperator.nombre_completo : ''}</h5>
                            <button type="button" className="close" onClick={() => setShowModalRegistroConsumo(false)}>
                                <span>&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">Cantidad</label>
                                <h2>{consumptionAmount}</h2>
                            </div>
                            <div className="d-flex justify-content-between">
                                {[...Array(10).keys()].map(num => (
                                    <button key={num} className="btn btn-secondary" onClick={() => handleConsumptionInput(num.toString())}>
                                        {num}
                                    </button>
                                ))}
                                <button className="btn btn-danger" onClick={() => handleConsumptionInput('clear')}>Borrar</button>
                            </div>
                            <div className="mt-3">
                                <h6>Historial de Consumos</h6>
                                {consumptionHistory.map(record => (
                                    <div key={record.id_consumo_material} className="card mb-2">
                                        <div className="card-body">
                                            <p>Cantidad: {record.cantidad_consumida}</p>
                                            <p>Fecha: {new Date(record.timestamp).toLocaleString()}</p>
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
                            <button onClick={() => setShowModal(false)} type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>

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