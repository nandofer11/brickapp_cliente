import { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';
import "../../App.css";

import { Snackbar } from '@mui/material';
import Alert from '@mui/material/Alert';

import WrapperMonitor from '../WrapperMonitor/WrapperMonitor';

const Monitor = ({ idCoccion, personalId, materialId }) => {
    const [historialConsumos, setHistorialConsumos] = useState([]);
    const [operadores, setOperadores] = useState([]);
    const [selectedOperador, setSelectedOperador] = useState(null);
    const [selectedMaterial, setSelectedMaterial] = useState(null);


    const [coccionesSinIniciar, setCoccionesSinIniciar] = useState([]);
    const [coccionesIniciadas, setCoccionesIniciadas] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(""); // "iniciarQuema" | "finalizarCoccion"
    const [selectedCoccion, setSelectedCoccion] = useState(null);

    // Estados para las alertas
    const [alertMessage, setAlertMessage] = useState(''); // Mensaje a mostrar
    const [showAlert, setShowAlert] = useState(false);   // Controlar visibilidad del Snackbar
    const [alertSeverity, setAlertSeverity] = useState('error'); // Severidad del Alert (success o error)


    const [showWrapper, setShowWrapper] = useState(false);
const [currentCoccion, setCurrentCoccion] = useState(null);

    const token = localStorage.getItem('token');

    const configToken = {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };
    const handleVer = (idCoccion) => {
        setCurrentCoccion(idCoccion);
        setShowWrapper(true);
    };

    // Obtener cocciones al cargar el componente
    const fetchCocciones = () => {
        axios.get(`${config.apiBaseUrl}coccion/`, configToken)
            .then(response => {
                const sinIniciar = response.data.filter(
                    coccion => coccion.estado === 'En curso' && coccion.humeada === 0 && coccion.quema === 0
                );
                const iniciadas = response.data.filter(
                    coccion => coccion.estado === 'En curso' && coccion.humeada === 1
                );
                setCoccionesSinIniciar(sinIniciar);
                setCoccionesIniciadas(iniciadas);
            })
            .catch(error => console.error('Error al obtener cocciones:', error));
    };

    useEffect(() => {
        fetchCocciones();

        const fetchHistorialConsumos = async () => {
            if (idCoccion && personalId && materialId) { // Asegúrate de que estos valores estén definidos
                try {
                    const response = await axios.get(
                        `${config.apiBaseUrl}coccion/${idCoccion}/${personalId}/${materialId}/consumosdematerial`,
                        configToken
                    );
                    setHistorialConsumos(response.data);
                } catch (error) {
                    console.error("Error al obtener el historial de consumos:", error);
                }
            }
        };

        const fetchOperadores = async () => {
            try {
                const response = await axios.get(`${config.apiBaseUrl}coccion/${idCoccion}/operadores`, configToken);
                setOperadores(response.data.operadores);
            } catch (error) {
                console.error('Error al cargar operadores:', error);
            }
        };

        fetchOperadores();

        fetchHistorialConsumos();
    }, [idCoccion, personalId, materialId]);

    // Iniciar cocción
    const handleIniciarCoccion = (idCoccion) => {
        setSelectedCoccion(idCoccion);
        setModalType("iniciarCoccion");
        setShowModal(true);
    };

    const confirmIniciarCoccion = () => {
        axios.put(`${config.apiBaseUrl}coccion/${selectedCoccion}/iniciarhumeada`, {}, configToken)
            .then(() => {

                setAlertMessage('Cocción iniciada con éxito.');
                setAlertSeverity('success');
                setShowAlert(true);

                setShowModal(false);
                fetchCocciones();
            })
            .catch(error => console.error('Error al iniciar cocción:', error));
    };

    // Iniciar quema
    const handleIniciarQuema = (idCoccion) => {
        setSelectedCoccion(idCoccion);
        setModalType("iniciarQuema");
        setShowModal(true);
    };

    const confirmIniciarQuema = () => {
        axios.put(`${config.apiBaseUrl}coccion/${selectedCoccion}/iniciarquema`, {}, configToken)
            .then(() => {
                // alert('Quema iniciada con éxito');
                setAlertMessage('Quema iniciada con éxito.');
                setAlertSeverity('success');
                setShowAlert(true);
                
                setShowModal(false);
                fetchCocciones();
            })
            .catch(error => console.error('Error al iniciar quema:', error));
    };

    // Finalizar cocción
    const handleFinalizarCoccion = (idCoccion) => {
        setSelectedCoccion(idCoccion);
        setModalType("finalizarCoccion");
        setShowModal(true);
    };

    const confirmFinalizarCoccion = () => {
        axios.put(`${config.apiBaseUrl}coccion/${selectedCoccion}/finalizarcoccion`, {}, configToken)
            .then(() => {
                // alert('Cocción finalizada con éxito');
                setAlertMessage('Cocción finalizada con éxito.');
                setAlertSeverity('success');
                setShowAlert(true);

                setShowModal(false);
                fetchCocciones();
            })
            .catch(error => console.error('Error al finalizar cocción:', error));
    };

    const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
};

    return (
        <div className="container">

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

            <div className="row">
                <div className="col-md-6">
                    <h4>Cocciones Sin Iniciar</h4>
                    <div className="card">
                        {coccionesSinIniciar.length === 0 ? (
                            <p className='mb-0 p-2 text-center text-danger'>No hay cocciones registradas.</p>
                        ) : (
                            coccionesSinIniciar.map(coccion => (
                                <div className="card-body d-flex justify-content-between" key={coccion.id_coccion}>
                                    <div>
                                    <p className='mb-0'><strong>Cocción ID: </strong>{coccion.id_coccion}</p>
                                    <p className="mb-0"><strong>Fecha de encendido: </strong>{formatFecha(coccion.fecha_encendido)}</p>
                                    </div>
                                    
                                    <div>

                                    <button
                                        className="btn btn-primary"
                                        onClick={() => handleIniciarCoccion(coccion.id_coccion)}
                                    >
                                        Iniciar
                                    </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="col-md-6">
                    <h4>Cocciones Iniciadas</h4>
                    <div className="card">
                        {coccionesIniciadas.length === 0 ? (
                            <p className='mb-0 p-2 text-center text-danger'>No se ha iniciado ninguna cocción.</p>
                        ) : (
                            coccionesIniciadas.map(coccion => (
                                <div className="card-body d-flex justify-content-between" key={coccion.id_coccion}>
                                    <div>
                                    <p className='mb-0'><strong>Cocción ID: </strong>{coccion.id_coccion}</p>
                                    <p className='mb-0'><strong>Fecha de encendido: </strong>{formatFecha(coccion.fecha_encendido)}</p>
                                    </div>
                                   
                                    <div className='d-flex gap-1 mt-2'>
                                        <button
                                            className="btn btn-info"
                                            onClick={() => handleVer(coccion.id_coccion)}
                                        >
                                            Ver
                                        </button>
                                        {coccion.quema === 0 ? (
                                            <button
                                                className="btn btn-warning"
                                                onClick={() => handleIniciarQuema(coccion.id_coccion)}
                                            >
                                                Iniciar Quema
                                            </button>
                                        ) : (
                                            <button
                                                className="btn btn-danger"
                                                onClick={() => handleFinalizarCoccion(coccion.id_coccion)}
                                            >
                                                Finalizar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

             {/* Wrapper para mostrar información adicional */}
             {showWrapper && (
                <div className="row mt-4">
                    <div className="col-12">
                        <WrapperMonitor 
                        idCoccion={currentCoccion} 
                        personalId={personalId}
                materialId={materialId}
                historialConsumos={historialConsumos} />
                    </div>
                </div>
            )}

            {/* Modal de confirmación */}
            {showModal && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" role="dialog">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header bg-danger text-white">
                                <h5 className="modal-title">Confirmación</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>

                            </div>
                            <div className="modal-body">
                                {modalType === "iniciarQuema" && <p>¿Está seguro de que desea iniciar la quema?</p>}
                                {modalType === "finalizarCoccion" && <p>¿Está seguro de que desea finalizar esta cocción?</p>}
                                {modalType === "iniciarCoccion" && <p>¿Está seguro de que desea iniciar la cocción?</p>}
                            </div>
                            <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                        Cancelar
                    </button>
                    {modalType === "iniciarQuema" && (
                        <button type="button" className="btn btn-primary" onClick={confirmIniciarQuema}>
                            Confirmar
                        </button>
                    )}
                    {modalType === "finalizarCoccion" && (
                        <button type="button" className="btn btn-primary" onClick={confirmFinalizarCoccion}>
                            Confirmar
                        </button>
                    )}
                    {modalType === "iniciarCoccion" && (  // Agregar este bloque para el botón de confirmar
                        <button type="button" className="btn btn-primary" onClick={confirmIniciarCoccion}>
                            Confirmar
                        </button>
                    )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Monitor;
