import DataTable from 'react-data-table-component';
import axios from 'axios';
//Icons
import * as FaIcons from 'react-icons/fa';
import { useState, useEffect } from 'react';

const Coccion = () => {
    const [loading, setLoading] = useState(true);

    //Estados para los datos de cocciones
    const [coccionData, setCoccionlData] = useState([]);

    // Estado para la data de hornos
    const [hornosData, setHornosData] = useState([]);
    const [hornoSeleccionado, setHornoSeleccionado] = useState(null); //para manejar la cantidad de operadores en un horno seleccionado
    const [cantidadOperadores, setCantidadOperadores] = useState(0);

    // Estado para la data de cargos cocción
    const [cargoCoccionData, setCargoCoccionData] = useState([]);
    const [cargosSeleccionados, setCargosSeleccionados] = useState([]);

    // Estados para las alertas
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState(''); // 'success' o 'danger'
    const [showAlert, setShowAlert] = useState(false);

    // Estados para manejar el modal de cocción
    const [isEditing, setIsEditing] = useState(false);
    const [modalTitle, setModalTitle] = useState('');

    // Estado para los datos de trabajadores
    const [trabajadoresData, setTrabajadoresData] = useState([]);


    // Configurar columnas para la tabla cocciones
    const columns = [
        {
            name: 'Cod. Horno',
            selector: row => row.prefijo,
        },
        {
            name: 'Horno',
            selector: row => row.nombre_horno,
        },
        {
            name: 'Fecha de encendido',
            selector: row => new Date(row.fecha_encendido).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }),
            sortable: true,
        },
        {
            name: 'Hora de inicio',
            selector: row => row.hora_inicio,
            sortable: true,
        },
        {
            name: 'Fecha de apagado',
            selector: row => new Date(row.fecha_apagado).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }),
            sortable: true,
        },
        {
            name: 'Hora de fin',
            selector: row => row.hora_fin,
            sortable: true,
        },
        {
            name: 'Estado',
            selector: row => row.estado,
            sortable: true,
        },
        {
            name: 'Acciones',
            cell: (row) => (
                <div className="d-flex">
                    {/* Botón de Editar */}
                    <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(row)}>
                        <FaIcons.FaEdit /> {/* Icono de editar */}
                    </button>

                    {/* Botón de Eliminar */}
                    <button className="btn btn-danger btn-sm" onClick={() => handleEliminar(row.id_coccion)}>
                        <FaIcons.FaTrashAlt /> {/* Icono de eliminar */}
                    </button>
                </div>
            ),
            ignoreRowClick: true, // Ignorar el click de la fila en esta columna
            // allowOverflow: true,
            button: true, // Indicar que es un botón
        }
    ];

    // Configurar columnas para la tabla hornos
    const columnsHornos = [
        {
            name: 'Cod. Horno',
            selector: row => row.prefijo,
        },
        {
            name: 'Nombre horno',
            selector: row => row.nombre,
            sortable: true,
        },
        {
            name: 'Acciones',
            cell: (row) => (
                <div className="d-flex">
                    {/* Botón de Editar */}
                    <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(row)}>
                        <FaIcons.FaEdit /> {/* Icono de editar */}
                    </button>

                    {/* Botón de Eliminar */}
                    <button className="btn btn-danger btn-sm" onClick={() => handleEliminar(row.id_horno)}>
                        <FaIcons.FaTrashAlt /> {/* Icono de eliminar */}
                    </button>
                </div>
            ),
            ignoreRowClick: true, // Ignorar el click de la fila en esta columna
            // allowOverflow: true,
            button: true, // Indicar que es un botón
        }
    ];

    // Configurar columnas para la tabla cargos cocciones
    const columnsCargosCoccion = [
        {
            name: 'Nombre',
            selector: row => row.nombre,
        },
        {
            name: 'Costo S/.',
            selector: row => row.costo,
            sortable: true,
        },
        {
            name: 'Acciones',
            cell: (row) => (
                <div className="d-flex">
                    {/* Botón de Editar */}
                    <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(row)}>
                        <FaIcons.FaEdit /> {/* Icono de editar */}
                    </button>

                    {/* Botón de Eliminar */}
                    <button className="btn btn-danger btn-sm" onClick={() => handleEliminar(row.id_cargo_coccion)}>
                        <FaIcons.FaTrashAlt /> {/* Icono de eliminar */}
                    </button>
                </div>
            ),
            ignoreRowClick: true, // Ignorar el click de la fila en esta columna
            // allowOverflow: true,
            button: true, // Indicar que es un botón
        }
    ];

    // Configurar columnas para la tabla de trabajadores
    const columnsTrabajadores = [
        {
            name: 'Personal',
            selector: row => row.nombre_completo,
            sortable: true,
        },
        {
            name: 'Cargo',
            cell: (row) => (
                <select 
                className="form-select" 
                disabled={!hornoSeleccionado || cargosSeleccionados.length>=hornoSeleccionado.cantidad_operarios && !cargosSeleccionados.find(item=>item.personalId === row.id)}
                onChange={(e)=>handleCargoChange(e, row.id_personal)}
                >
                    <option value="">Sel. un cargo</option>
                    {cargoCoccionData.map((cargo) => (
                        <option key={cargo.id_cargo_coccion} value={cargo.id_cargo_coccion}>
                            {cargo.nombre}
                        </option>
                    ))}
                </select>
            ),
            ignoreRowClick: true,
            button: true,
            minWidth: '180px'
        }
    ];

    //Obtener cocciones
    const fetchCoccionData = async () => {
        try {
            const response = await axios.get('http://localhost:3002/api/admin/coccion/');
            setCoccionlData(response.data);
            setLoading(false); //Cambia el estado de loading a false
        } catch (error) {
            console.error("Error al obtener los datos de cocciones: ", error);
            setLoading(false);
        }
    }

    //Obtener hornos
    const fetchHornosnData = async () => {
        try {
            const response = await axios.get('http://localhost:3002/api/admin/hornos/');
            setHornosData(response.data);
            setLoading(false); //Cambia el estado de loading a false
        } catch (error) {
            console.error("Error al obtener los datos de hornos: ", error);
            setLoading(false);
        }
    }


    //Obtener cargo coccion
    const fetchCargoCoccionData = async () => {
        try {
            const response = await axios.get('http://localhost:3002/api/admin/cargoCoccion/');
            setCargoCoccionData(response.data);
            setLoading(false); //Cambia el estado de loading a false
        } catch (error) {
            console.error("Error al obtener los datos de cargos de cocción: ", error);
            setLoading(false);
        }
    }

    // Función para obtener los trabajadores
    const fetchTrabajadoresData = async () => {
        try {
            const response = await axios.get('http://localhost:3002/api/admin/personal/');
            //Filtrar trabajadores "activos" (estado 1)
            const trabajadoresActivos = response.data.filter(trabajador => trabajador.estado === 1)
            setTrabajadoresData(trabajadoresActivos); // Guardar los datos en el estado
        } catch (error) {
            console.error("Error al obtener los datos de trabajadores: ", error);
        }
    }

    //useEffect para cargar los datos al montar el componente
    useEffect(() => {
        fetchCoccionData();
        fetchHornosnData();
        fetchCargoCoccionData();
        fetchTrabajadoresData();

        if (hornoSeleccionado && cargosSeleccionados.length > hornoSeleccionado.cantidad_operarios) {
            // Mostrar mensaje de éxito
            setAlertMessage('Se excede la cantidad de operarios seleccionados.');
            setAlertType('danger'); // Tipo de alerta
            setShowAlert(true); // Mostrar la alerta
            setTimeout(() => {
                setShowAlert(false); // Ocultar alerta después de 2 segundos
            }, 2000);
        }else{
            setShowAlert(false);
        }
    }, [cargosSeleccionados, hornoSeleccionado]);

    const obtenerFechaActual = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const obtenerHoraActual = () => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0'); // Asegura dos dígitos para la hora
        const minutes = String(now.getMinutes()).padStart(2, '0'); // Asegura dos dígitos para los minutos
        return `${hours}:${minutes}`;
    };

    // Función para manejar el cambio del select de tipo de horno
    const handleHornoChange = (e) => {
        const idHorno = e.target.value;

        if (idHorno == "") {
            setHornoSeleccionado(null); // no hay seleccionado, deshabilitar los selectores de cargo
            setCantidadOperadores(0); //Restablacer cantidad de operarios
        } else {
            const hornoSeleccionado = hornosData.find(horno => horno.id_horno === parseInt(idHorno)); // Buscar el horno seleccionado
            if (hornoSeleccionado) {
                setHornoSeleccionado(hornoSeleccionado); // Actualizar el horno seleccionado
                setCantidadOperadores(hornoSeleccionado.cantidad_operarios); // Actualizar la cantidad de operarios
            }
        }
    };

    const handleCargoChange = (e, id_personal) => {
        const cargoSeleccionado = e.target.value;

        if (cargoSeleccionado === "") {
            setCargosSeleccionados(prev => prev.filter(item => item.id_personal != id_personal));
            return;
        }

        // Agregar o actualizar el cargo seleccionado
        setCargosSeleccionados(prev => {
            const yaSeleccionado = prev.find(item => item.id_personal === id_personal);
            if (yaSeleccionado) {
                // Actualizar el cargo seleccionado para este trabajador
                return prev.map(item =>
                    item.id_personal === id_personal ? { id_personal, cargo: cargoSeleccionado } : item
                );
            } else {
                // Agregar nuevo cargo seleccionado
                return [...prev, { id_personal, cargo: cargoSeleccionado }];
            }
        });
    }
    // Deshabilitar el botón de guardar si se excede el límite de operarios
    const guardarDisabled = showAlert || !hornoSeleccionado || cargosSeleccionados.length !== hornoSeleccionado?.cantidad_operarios;



    return (
        <div className='d-flex'>
            {/* <Sidebar /> */}
            <div className='content'>
             {/* Alertas de éxito o error */}
             {showAlert && (
                        <div className={`alert alert-${alertType} mt-2 position-fixed top-0 start-50 translate-middle-x`} role="alert"  style={{ zIndex: 1060 }} >
                            {alertMessage}
                        </div>
                    )}
                <div className="">
                    {/* Inicio Header cocción */}
                    <div className="d-flex p-2 justify-content-between">
                        <h3 className="">Gestionar cocción</h3>
                        <div className="d-flex">
                            <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modalCoccion"><FaIcons.FaFire /> Registrar</button>
                        </div>
                    </div>
                    <div className='d-flex'>
                        <button className='btn btn-warning me-2' data-bs-toggle="modal" data-bs-target="#modalHornos"><FaIcons.FaIndustry /> Hornos</button>
                        <button className='btn btn-warning' data-bs-toggle="modal" data-bs-target="#modalCargoCoccion"><FaIcons.FaUserCog /> Cargos en cocción</button>
                    </div>
                    {/* Fin Header cocción */}

                    {/* Inicio modal de Hornos */}
                    <div className="modal fade" id="modalHornos" aria-labelledby="tituloModalHorno" aria-hidden="true">
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="modal-header bg-primary text-white">
                                    <h1 className="modal-title fs-5" id="tituloModalHorno">Gestionar Hornos</h1>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div className="modal-body">
                                    <div className="container">
                                        <div className="row">
                                            <div className="col-12 col-md-6">
                                                <form>
                                                    <div class="mb-3">
                                                        <label for="InputIdHorno" class="form-label">Id.</label>
                                                        <input type="text" class="form-control" id="InputIdHorno" disabled />
                                                    </div>
                                                    <div class="mb-3">
                                                        <label for="InputCodHorno" class="form-label">Cod. Horno</label>
                                                        <input type="text" class="form-control" id="InputCodHorno" aria-describedby="codHelp" />
                                                        <div id="codHelp" class="form-text">Prefijo para identificar un horno.</div>
                                                    </div>
                                                    <div class="mb-3">
                                                        <label for="InputNombreHorno" class="form-label">Nombre de horno</label>
                                                        <input type="text" class="form-control" id="InputNombreHorno" />
                                                    </div>
                                                    <button type="submit" class="btn btn-primary">Guardar</button>
                                                </form>
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <DataTable
                                                    title="Lista de hornos"
                                                    columns={columnsHornos}
                                                    data={hornosData}
                                                    pagination={false}
                                                    progressPending={loading}
                                                    highlightOnHover={true}
                                                    responsive={true}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                                    {/* <button type="submit" className="btn btn-primary">Guardar</button> */}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Fin modal de Hornos */}

                    {/* Inicio modal de cargo cocción */}
                    <div className="modal fade" id="modalCargoCoccion" aria-labelledby="tituloModalCargoCoccion" aria-hidden="true">
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="modal-header bg-primary text-white">
                                    <h1 className="modal-title fs-5" id="tituloModalCargoCoccion">Gestionar Cargos de cocción</h1>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div className="modal-body">
                                    <div className="container">
                                        <div className="row">
                                            <div className="col-12 col-md-6">
                                                <form>
                                                    <div class="mb-3">
                                                        <label for="InputIdCargoCoccion" class="form-label">Id.</label>
                                                        <input type="text" class="form-control" id="InputIdCargoCoccion" disabled />
                                                    </div>
                                                    <div class="mb-3">
                                                        <label for="Nombre" class="form-label">Nombre</label>
                                                        <input type="text" class="form-control" id="InputCodHorno" aria-describedby="codHelp" />
                                                        <div id="codHelp" class="form-text">Nombre del cargo del operador en cocción.</div>
                                                    </div>
                                                    <div class="mb-3">
                                                        <label for="InputCostoCargoCoccion" class="form-label">Costo S/.</label>
                                                        <input type="number" class="form-control" id="InputCostoCargoCoccion" />
                                                    </div>
                                                    <button type="submit" class="btn btn-primary">Guardar</button>
                                                </form>
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <DataTable
                                                    title="Lista de hornos"
                                                    columns={columnsCargosCoccion}
                                                    data={cargoCoccionData}
                                                    pagination={false}
                                                    progressPending={loading}
                                                    highlightOnHover={true}
                                                    responsive={true}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                                    {/* <button type="submit" className="btn btn-primary">Guardar</button> */}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Fin modal de cargo cocción */}

                    {/* Inicio modal de cocción */}
                    <div className="modal fade" id="modalCoccion" aria-labelledby="tituloModalCoccion" aria-hidden="true">
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="modal-header bg-primary text-white">
                                    <h1 className="modal-title fs-5" id="tituloModalCoccion">Registrar cocción</h1>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-12 col-md-6">
                                            <form>
                                                <div className="row">
                                                    <div className="col-6">
                                                        <div className="mb-3">
                                                            <label htmlFor="inputHorno" className="form-label">Horno</label>
                                                            <select className="form-select" onChange={handleHornoChange}>
                                                                <option value="">Sel. un horno</option>
                                                                {hornosData.map((horno) => (
                                                                    <option key={horno.id_horno} value={horno.id_horno}>
                                                                        {horno.prefijo} - {horno.nombre}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className='row'>

                                                    <div className="col-6">
                                                        <div className="mb-3">
                                                            <label htmlFor="inputFechaEncendido" className="form-label">Fecha de encendido</label>
                                                            <input type="date" className="form-control" id="inputFechaEncendido" defaultValue={obtenerFechaActual()} required />
                                                        </div>
                                                    </div>
                                                    <div className="col-6">
                                                        <div className="mb-3">
                                                            <label htmlFor="inputHoraInicio" className="form-label">Hora inicio</label>
                                                            <input type="time" className="form-control" id="inputHoraInicio" defaultValue={obtenerHoraActual()} required />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className='row'>
                                                    <div className="col-6">
                                                        <div className="mb-3">
                                                            <label htmlFor="inputFechaApagado" className="form-label">Fecha de apagado</label>
                                                            <input type="date" className="form-control" id="inputFechaApagado" />
                                                        </div>
                                                    </div>
                                                    <div className="col-6">
                                                        <div className="mb-3">
                                                            <label htmlFor="inputHoraFin" className="form-label">Hora fin</label>
                                                            <input type="time" className="form-control" id="inputHoraFin" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>

                                                </div>
                                            </form>
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <div className='text-center'>
                                                <p>Seleccionar personal a operar</p>
                                                <p className='text-body-secondary'><small>Operadores necesarios: {cantidadOperadores} </small></p>
                                            </div>
                                            <DataTable
                                                columns={columnsTrabajadores} // Las columnas configuradas para trabajadores
                                                data={trabajadoresData} // Los datos de trabajadores obtenidos de la API
                                                pagination={false}
                                                progressPending={loading} // Mostrar carga si es necesario
                                                highlightOnHover={true}
                                                responsive={true}
                                            />
                                        </div>
                                    </div>

                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                                        <button type="submit" disabled={guardarDisabled} className="btn btn-primary">{isEditing ? 'Actualizar' : 'Guardar'}</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                    {/* Fin modal de coccion */}
                   
                    {/* Inicio tabla cocciones */}
                    <section className="mt-3">
                        {/* <h1>Lista de personal</h1> */}
                        <DataTable
                            title="Lista de cocciones"
                            columns={columns}
                            data={coccionData}
                            pagination={true}
                            progressPending={loading}
                            highlightOnHover={true}
                            responsive={true}
                        />
                    </section>
                    {/* Fin tabla cocciones */}

                    {/* Inicio modal confirmacion eliminar coccion */}
                    {/* <div className={`modal ${MostrarModalEliminarTrabajador ? 'show' : ''}`} tabIndex="-1" style={{ display: MostrarModalEliminarTrabajador ? 'block' : 'none' }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
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
                                        className="btn btn-primary"
                                        onClick={handleConfirmEliminar}
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div> */}
                    {/* 
                    {MostrarModalEliminarTrabajador && <div className="modal-backdrop fade show"></div>} */}
                </div>
                {/* Fin  modal confirmacion eliminar coccion */}

            </div>
        </div>
    )
}

export default Coccion;