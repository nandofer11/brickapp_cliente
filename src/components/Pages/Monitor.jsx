import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';
import icon_temp from '../../assets/images/icon_temp.png';
import icon_time from '../../assets/images/icon_time.png';
import icon_sack from '../../assets/images/icon_sack.png';
import icon_sensor from '../../assets/images/icon_sensor.png';

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
    const [showMaterialModal, setShowMaterialModal] = useState(false);

    const [coccionEnCurso, setCoccionEnCurso] = useState(null);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [selectedProceso, setSelectedProceso] = useState('');
    const [materialesData, setMaterialesData] = useState([]);

    // Para controlar si mostrar el monitor
    const [showMonitor, setShowMonitor] = useState(false);

    // Función para abrir el modal y consultar disponibilidad de la cocción
    const handleVerCoccion = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await axios.get(`${config.apiBaseUrl}coccion/horno/H2/encurso`, configToken);
            if (response.data) {
                setCoccionEnCurso(response.data);
            } else {
                setCoccionEnCurso(null);
            }
        } catch (error) {
            console.error('Error al consultar la base de datos:', error);
            setError('Error al consultar los datos');
        } finally {
            setIsLoading(false);
            await fetchMaterialData(); // Asegúrate de tener esta función para obtener los materiales
            setModalSeleccionarCoccion(true);
        }
    };

    //Obtener todos los materiales
    const fetchMaterialData = async () => {
        try {
            const response = await axios.get(`${config.apiBaseUrl}material/`, configToken);
            setMaterialesData(response.data);
            // setLoading(false); //Cambia el estado de loading a false
            // console.log(response.data);
        } catch (error) {
            console.error("Error al obtener los datos de materiales: ", error);
            // setLoading(false);
        }
    }

    const iniciarCoccion = async () => {
        if (!coccionEnCurso || !selectedMaterial || !selectedProceso) {
            setAlertMessage('Debes seleccionar una cocción en curso, un material y un proceso.');
            setAlertType('danger')
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 3000);
            return;
        }

        try {
            const response = await axios.put(`${config.apiBaseUrl}coccion/coccion_detalles/${coccionEnCurso.id_coccion}`, {
                materialId: selectedMaterial.id_material,
                proceso: selectedProceso
            }, configToken);

            if (response.status === 200) {
                setAlertMessage('Cocción y detalle de cocción actualizados con éxito');
                setAlertType('success')
                setShowAlert(true);
                setTimeout(() => setShowAlert(false), 3000);
                setModalSeleccionarCoccion(false);
            }
        } catch (error) {
            setAlertMessage('Error al actualizar la cocción');
            setAlertType('danger')
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 3000);
            console.error('Error:', error);
        }
    };

    const handleCambiarEstado = () => {
        setShowModalCambiarEstado(true);
    };

    return (
        <div className='d-flex'>
            <div className='content container'>
                <h3>Cocción en tiempo real</h3>
                <div className="row">
                    <div className="">
                        <label className="form-label">Seleccionar cocción</label>
                        <button className="btn btn-warning me-2" onClick={handleVerCoccion}>Ver</button>
                        <button className="btn btn-secondary me-2" onClick={handleCambiarEstado}>Cambiar estado de cocción</button>
                    </div>
                </div>

                {showModalSeleccionarCoccion && (
                    <div className="modal show fade" style={{ display: 'block' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header bg-primary text-white">
                                    <h5 className="modal-title">Seleccionar Cocción</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setModalSeleccionarCoccion(false)}
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    {isLoading ? (
                                        <p>Cargando...</p>
                                    ) : coccionEnCurso ? (
                                        <div className="card p-2">
                                            <div className="d-flex gap-4">

                                                <input
                                                    type="radio"
                                                    checked={true} // Siempre seleccionado si hay cocción en curso
                                                    readOnly
                                                />
                                                <div className="d-flex flex-column">
                                                    <p className='mb-0'><strong> Horno: </strong> {coccionEnCurso.prefijo} {coccionEnCurso.nombre_horno}</p>
                                                    <p className='mb-0'><strong> Fecha: </strong>  {coccionEnCurso.fecha_encendido}</p>
                                                    <p className='mb-0'><strong>Hora: </strong> {coccionEnCurso.hora_inicio}</p>
                                                    <p className='mb-0'><strong>Estado: </strong> {coccionEnCurso.estado}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <span
                                            className='d-flex border border-light-subtle p-2 justify-content-center text-danger'
                                        >
                                            No se ha registrado una cocción en H2.

                                        </span>
                                    )}

                                    <div>
                                        <div className='d-flex justify-content-between align-items-center my-2'>

                                            <p className='mb-0'>Seleccionar material</p>
                                            <button className='btn btn-primary' id='btnSeleccionarMaterial' onClick={() => setShowMaterialModal(true)} ><FaIcons.FaPlus /></button>
                                        </div>
                                        {selectedMaterial ? (
                                            <span className='d-flex border border-light-subtle p-2 justify-content-center text-success'>
                                                Material seleccionado: {selectedMaterial.nombre}
                                            </span>
                                        ) : (
                                            <span className='d-flex border border-light-subtle p-2 justify-content-center text-danger'>
                                                No se ha seleccionado material.
                                            </span>
                                        )}
                                    </div>


                                    <div className="mt-2">
                                        <label className="form-label">Seleccionar Proceso</label>
                                        <div>
                                            <input
                                                type="radio"
                                                id="humeada"
                                                name="proceso"
                                                value="humeada"
                                                checked={selectedProceso === 'humeada'}
                                                onChange={() => setSelectedProceso('humeada')}
                                            />
                                            <label htmlFor="humeada" className="ms-2">Humeada</label>
                                        </div>
                                        <div>
                                            <input
                                                type="radio"
                                                id="quema"
                                                name="proceso"
                                                value="quema"
                                                checked={selectedProceso === 'quema'}
                                                onChange={() => setSelectedProceso('quema')}
                                            />
                                            <label htmlFor="quema" className="ms-2">Quema</label>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        className="btn btn-primary"
                                        onClick={iniciarCoccion}
                                    >
                                        Iniciar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showMaterialModal && (
                    <div className="modal show fade" style={{ display: 'block' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header bg-primary text-white">
                                    <h5 className="modal-title">Seleccionar Material</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowMaterialModal(false)}
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    {materialesData.length > 0 ? (
                                        materialesData.map(material => (
                                            <div key={material.id_material}>
                                                <input
                                                    type="radio"
                                                    name="material"
                                                    onChange={() => setSelectedMaterial(material)}
                                                />
                                                {material.nombre} - {material.presentacion}
                                            </div>
                                        ))
                                    ) : (
                                        <p>No hay materiales disponibles.</p>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setShowMaterialModal(false)}
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}



                {/* Monitor */}
                {showMonitor && (
                    <div id='wrapper_monitor' className='row mb-4'>
                        {/* Mostrar cards con trabajadores */}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Monitor;
